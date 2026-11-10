// ─── Lưu nguyệt (vận tháng) ───────────────────────────────────────────────
// Tính theo quy tắc của engine iztro (đã đọc mã nguồn
// node_modules/iztro/lib/astro/FunctionalAstrolabe.js):
//
//   monthlyIndex = fixIndex(yearlyIndex − tháng sinh âm lịch
//                            + chi giờ sinh + tháng âm lịch cần tính)
//   yearlyIndex  = chi năm lưu niên − 2        (quy về Dần = 0)
//   → chi cung Lưu nguyệt Mệnh = (chi năm − tháng sinh âm lịch
//                                 + chi giờ sinh + tháng cần tính) mod 12
//
// Chú thích trong mã iztro: “流年地支逆数到生月所在宫位，再从该宫位顺数到
// 生时，为正月所在宫位，之后每月一宫”. Sinh vào tháng nhuận: iztro cộng
// thêm 1 khi ngày sinh âm lịch > 15 (leapAddition) — hàm dưới giữ nguyên
// quy tắc này.
//
// Can Chi tháng theo Ngũ Hổ Độn (五虎遁): tháng Giêng lấy can theo can năm
//   Giáp/Kỷ → Bính Dần; Ất/Canh → Mậu Dần; Bính/Tân → Canh Dần;
//   Đinh/Nhâm → Nhâm Dần; Mậu/Quý → Giáp Dần.
// Chi tháng: tháng Giêng = Dần, cứ thế thuận theo 12 chi.
//
// Đã kiểm chứng (10/11/2026, script tạm, đã xóa):
// - Can Chi 12 tháng năm 2026 khớp lunar-javascript 12/12
//   (Canh Dần → Tân Sửu); năm 2026 không có tháng nhuận.
// - Chi cung Lưu nguyệt Mệnh khớp iztro monthlyList 12/12 trên 2 lá số
//   (anh Hoàn 1977 giờ Sửu; nữ 1990 giờ Mùi).
// - Tứ Hóa tháng (mutagen của iztro) khớp SI_HUA_TABLE theo can tháng.
//
// Tháng nhuận (nếu có): một dòng riêng ngay sau tháng chính, cùng Can Chi
// với tháng chính (cách xử lý chung: nhuận tháng dùng chung can chi tháng
// chính; iztro chia làm 2 nửa, nửa đầu theo tháng chính, nửa sau theo
// tháng sau — dòng này lấy nửa đầu và ghi rõ).

import { SI_HUA_TABLE } from './constants';
import { leapMonthOfLunarYear, lunarMonthDayCount, lunarToSolar } from './lunar-solar';
import type { Palace, ZiweiChart } from './types';

export type SiHuaKind = '禄' | '权' | '科' | '忌';

export interface LiuYueSiHua {
  kind: SiHuaKind;
  star: string;
  palace: Palace | undefined;
}

export interface LiuYueMonth {
  lunarMonth: number; // 1–12
  isLeap: boolean;
  stem: number; // 0–9 (甲…癸)
  branch: number; // 0–11 (子…亥)
  mingBranch: number; // chi của cung Lưu nguyệt Mệnh
  mingPalace: Palace | undefined;
  solarStart: string; // dd/mm/yyyy, ngày đầu tháng âm lịch
  solarEnd: string; // dd/mm/yyyy, ngày cuối tháng âm lịch
  sihua: LiuYueSiHua[]; // theo thứ tự Lộc, Quyền, Khoa, Kỵ
}

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Can Chi của một năm (dương lịch = âm lịch trong cách tính này). */
export function getYearGanZhi(year: number): { stem: number; branch: number } {
  return { stem: mod(year - 4, 10), branch: mod(year - 4, 12) };
}

/**
 * Can Chi tháng âm lịch theo Ngũ Hổ Độn.
 * @param yearStem can năm lưu niên (0–9)
 * @param lunarMonth tháng âm lịch 1–12
 */
export function getMonthGanZhi(yearStem: number, lunarMonth: number): { stem: number; branch: number } {
  const firstStem = mod(yearStem * 2 + 2, 10); // can tháng Giêng
  return {
    stem: mod(firstStem + lunarMonth - 1, 10),
    branch: mod(lunarMonth + 1, 12), // tháng Giêng = Dần (2)
  };
}

/**
 * Tháng sinh âm lịch dùng trong công thức lưu nguyệt (theo iztro):
 * tháng nhuận và ngày sinh > 15 thì cộng thêm 1.
 */
export function getBirthLunarMonthForLiuYue(chart: ZiweiChart): number {
  const lunar = chart.lunarInfo;
  const month = Math.abs(lunar.lunarMonth);
  return month + (lunar.isLeapMonth && lunar.lunarDay > 15 ? 1 : 0);
}

/**
 * Chi của cung Lưu nguyệt Mệnh cho một tháng âm lịch trong năm lưu niên.
 * Công thức iztro (đã kiểm chứng 12/12 trên 2 lá số):
 *   (chi năm − tháng sinh âm lịch + chi giờ sinh + tháng cần tính) mod 12
 */
export function getLiuYueMingBranch(chart: ZiweiChart, liunianYear: number, lunarMonth: number): number {
  const yearBranch = getYearGanZhi(liunianYear).branch;
  return mod(
    yearBranch - getBirthLunarMonthForLiuYue(chart) + chart.birthInfo.hour + lunarMonth,
    12,
  );
}

function palaceOfStar(chart: ZiweiChart, starName: string): Palace | undefined {
  return chart.palaces.find((p) => p.stars.some((s) => s.name === starName));
}

function fmtSolar(d: { day: number; month: number; year: number } | null): string {
  if (!d) return '—';
  return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`;
}

function buildMonth(
  chart: ZiweiChart,
  liunianYear: number,
  lunarMonth: number,
  isLeap: boolean,
): LiuYueMonth {
  const yearStem = getYearGanZhi(liunianYear).stem;
  const { stem, branch } = getMonthGanZhi(yearStem, lunarMonth);
  const mingBranch = getLiuYueMingBranch(chart, liunianYear, lunarMonth);
  const mingPalace = chart.palaces.find((p) => p.branch === mingBranch);
  const dayCount = lunarMonthDayCount(liunianYear, lunarMonth, isLeap);
  const sihuaTable = SI_HUA_TABLE[stem] ?? ['', '', '', ''];
  const kinds: SiHuaKind[] = ['禄', '权', '科', '忌'];
  return {
    lunarMonth,
    isLeap,
    stem,
    branch,
    mingBranch,
    mingPalace,
    solarStart: fmtSolar(lunarToSolar(liunianYear, lunarMonth, 1, isLeap)),
    solarEnd: fmtSolar(lunarToSolar(liunianYear, lunarMonth, Math.max(dayCount, 1), isLeap)),
    sihua: kinds.map((kind, i) => ({
      kind,
      star: sihuaTable[i] ?? '',
      palace: sihuaTable[i] ? palaceOfStar(chart, sihuaTable[i]) : undefined,
    })),
  };
}

/**
 * Toàn bộ các tháng âm lịch của một năm lưu niên (12 tháng, cộng 1 dòng
 * tháng nhuận ngay sau tháng chính nếu năm đó có tháng nhuận).
 */
export function getLiuYueMonths(chart: ZiweiChart, liunianYear: number): LiuYueMonth[] {
  const out: LiuYueMonth[] = [];
  const leap = leapMonthOfLunarYear(liunianYear);
  for (let m = 1; m <= 12; m++) {
    out.push(buildMonth(chart, liunianYear, m, false));
    if (leap === m) out.push(buildMonth(chart, liunianYear, m, true));
  }
  return out;
}
