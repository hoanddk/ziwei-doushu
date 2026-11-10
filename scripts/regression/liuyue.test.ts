/**
 * Lưu nguyệt (vận tháng) — kiểm chứng, 10/11/2026.
 *
 * Khóa các tính chất đã kiểm chứng bằng tay trước khi viết code:
 * - Can Chi 12 tháng năm 2026 khớp lunar-javascript 12/12
 *   (Canh Dần → Tân Sửu); năm 2026 không có tháng nhuận.
 * - Chi cung Lưu nguyệt Mệnh khớp iztro monthlyList 12/12 trên 2 lá số
 *   (anh Hoàn 1977 giờ Sửu; nữ 1990 giờ Mùi), theo công thức iztro:
 *   (chi năm − tháng sinh âm lịch + chi giờ sinh + tháng tính) mod 12.
 * - Tứ Hóa tháng khớp mutagen của iztro 12/12 trên cả 2 lá số.
 * - Năm nhuận 2025: 13 dòng, có 1 dòng tháng 6 nhuận, cùng Can Chi
 *   với tháng 6 chính (Ất Mùi).
 * - ChartReading render đủ 10 mục; mục 10 có đủ 12 tháng 2026, tháng 7
 *   của anh Hoàn trùng cung Mệnh gốc (Mùi), tháng 1 Mệnh tháng tại
 *   Thiên Di (Sửu), tháng 10 tại Điền Trạch (Tuất).
 */
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { astro } from 'iztro';
import { Lunar } from 'lunar-javascript';
import ChartReading from '../../components/ChartReading';
import { generateChart } from '../../lib/ziwei/algorithm';
import { formToBirthInfo } from '../../lib/ziwei/share';
import { BRANCHES, STEMS } from '../../lib/ziwei/constants';
import { getLiuYueMonths } from '../../lib/ziwei/liuyue';

// The repository preserves JSX for Next; tsx's standalone runner uses the
// classic JSX transform, which expects React as a global during SSR.
Object.assign(globalThis, { React });

const HOAN = {
  name: 'Vũ Minh Hoàn', year: '1977', month: '9', day: '5',
  clockHour: '2', clockMinute: '0', unknownTime: false,
  province: 'Việt Nam', city: 'Hà Nội', longitude: 105.85, gender: 'male' as const,
};
const NU1990 = {
  name: 'Test Nữ', year: '1990', month: '3', day: '15',
  clockHour: '14', clockMinute: '0', unknownTime: false,
  province: 'Việt Nam', city: 'TP.HCM', longitude: 106.7, gender: 'female' as const,
};

// ── 1) Can Chi tháng 2026 khớp lunar-javascript (nguồn độc lập) ─────────
{
  const chart = generateChart(formToBirthInfo(HOAN));
  const months = getLiuYueMonths(chart, 2026);
  assert.equal(months.length, 12, '2026 không có tháng nhuận: đúng 12 tháng');
  for (let m = 1; m <= 12; m++) {
    const lunar = Lunar.fromYmd(2026, m, 15);
    const expected = lunar.getMonthGan() + lunar.getMonthZhi();
    const got = STEMS[months[m - 1].stem] + BRANCHES[months[m - 1].branch];
    assert.equal(got, expected, `Can Chi tháng ${m}/2026: ${got} != ${expected}`);
  }
  assert.equal(STEMS[months[0].stem] + BRANCHES[months[0].branch], '庚寅', 'Tháng Giêng 2026 là Canh Dần');
  assert.equal(STEMS[months[11].stem] + BRANCHES[months[11].branch], '辛丑', 'Tháng Chạp 2026 là Tân Sửu');
}

// ── 2) Cung Lưu nguyệt Mệnh + Tứ Hóa tháng khớp iztro, 2 lá số ──────────
for (const [label, form] of [['anh Hoàn', HOAN], ['nữ 1990', NU1990]] as const) {
  const chart = generateChart(formToBirthInfo(form));
  const b = chart.birthInfo;
  const a = astro.bySolar(
    `${b.year}-${b.month}-${b.day}`, b.hour,
    b.gender === 'female' ? 'female' : 'male', true, 'zh-CN',
  );
  const iztroMonths = a.monthlyList(2026);
  const months = getLiuYueMonths(chart, 2026);
  assert.equal(months.length, iztroMonths.length, `${label}: số tháng khớp iztro`);
  for (const item of iztroMonths) {
    const m = months.find((x) => x.lunarMonth === item.month && !x.isLeap);
    assert.ok(m, `${label}: thiếu tháng ${item.month}`);
    assert.equal(STEMS[m.stem], item.heavenlyStem, `${label} tháng ${item.month}: can tháng`);
    assert.equal(BRANCHES[m.branch], item.earthlyBranch, `${label} tháng ${item.month}: chi tháng`);
    // iztro index quy về Dần = 0; chi cung Mệnh tháng = index + 2.
    assert.equal(m.mingBranch, (item.index + 2) % 12, `${label} tháng ${item.month}: cung Lưu nguyệt Mệnh`);
    assert.deepEqual(
      m.sihua.map((s) => s.star), item.mutagen,
      `${label} tháng ${item.month}: Tứ Hóa tháng`,
    );
  }
}

// ── 3) Năm nhuận 2025: 13 dòng, tháng 6 nhuận cùng Can Chi tháng 6 ─────
{
  const chart = generateChart(formToBirthInfo(HOAN));
  const months = getLiuYueMonths(chart, 2025);
  assert.equal(months.length, 13, '2025 có tháng nhuận: 13 dòng');
  const leap = months.filter((m) => m.isLeap);
  assert.equal(leap.length, 1, '2025 chỉ có 1 tháng nhuận');
  assert.equal(leap[0].lunarMonth, 6, 'Tháng nhuận 2025 là tháng 6');
  const regular6 = months.find((m) => m.lunarMonth === 6 && !m.isLeap)!;
  assert.equal(leap[0].stem, regular6.stem, 'Tháng nhuận cùng can với tháng chính');
  assert.equal(leap[0].branch, regular6.branch, 'Tháng nhuận cùng chi với tháng chính');
}

// ── 4) ChartReading render mục 10 cho lá số anh Hoàn, 2026 ─────────────
{
  const chart = generateChart(formToBirthInfo(HOAN));
  const html = renderToStaticMarkup(React.createElement(ChartReading, { chart, liunianYear: 2026 }));
  const t = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  for (const s of [
    'Lưu nguyệt 2026', 'Canh Dần', 'Tân Sửu', 'Tháng 12',
    'Mệnh tháng tại Thiên Di', 'Mệnh tháng tại Điền Trạch',
    'trùng cung Mệnh gốc', 'Tứ Hóa tháng',
  ]) {
    assert.ok(t.includes(s), `ChartReading thiếu chuỗi lưu nguyệt: ${s}`);
  }
  // Tháng 7/2026 (Bính Thân): Mệnh tháng tại Mùi = trùng cung Mệnh gốc.
  assert.ok(t.includes('Tháng 7 (Bính Thân)'), 'Thiếu dòng tháng 7 Bính Thân');
  // Tháng 10/2026 (Kỷ Hợi): khoảng dương lịch 09/11–08/12/2026.
  assert.ok(t.includes('09/11/2026'), 'Tháng 10 âm lịch bắt đầu 09/11/2026');
}

console.log('LiuYue regression passed');
