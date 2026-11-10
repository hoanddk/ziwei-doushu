/**
 * 紫微斗数格局识别（v2 严格化版本）
 *
 * 设计原则：
 * 1. 古书条件优先：每个格局列出"必须 / 加分 / 破格"三层结构，出处可考
 * 2. 倪师立场：不使用宫干自化、大限四化、来因宫等飞星派工具
 * 3. 庙旺利陷：用 brightness 字段（bright=庙旺、normal=平、dim=陷）
 * 4. 三方四正会照：命宫 + 财帛 + 官禄 + 迁移
 * 5. 夹宫：命宫前后两宫
 *
 * 主要古籍出处：
 *  - 《紫微斗数全集》（陈抟祖师传，明代刊本）
 *  - 《紫微斗数全书》（罗洪先编，明代刊本）
 *  - 《骨髓赋》《女命骨髓赋》《十二宫诸星得地合格诀》
 *  - 倪师《天纪》紫微斗数讲义
 */

import 'server-only';
import { VI_STAR, VI_BRANCH } from './vi-names';
import type { ZiweiChart, Palace, Star, SiHua } from './types';
import { detectDingGui } from './patterns-dinggui';
import { detectDingFu } from './patterns-dingfu';
import { detectDingPin } from './patterns-dingpin';

// ────────────────── 类型 ──────────────────
export interface PatternCondition {
  required: string[];   // 必须满足条件（已通过的）
  bonus?: string[];     // 加分项（已触发）
  breaking?: string[];  // 破格警示（已触发）
}

export interface Pattern {
  name: string;
  level: 'excellent' | 'good' | 'neutral' | 'caution';
  description: string;
  palaces: string[];                 // 涉及宫位
  conditions?: PatternCondition;     // 成立条件分层（v2 新增）
  source?: string;                   // 古籍出处（v2 新增）
}

// ────────────────── 常量 ──────────────────
const SHA_NAMES = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'];
const SHA_HARD = ['擎羊', '陀罗', '火星', '铃星'];   // 四煞
const SHA_KONG = ['地空', '地劫'];                  // 空劫
const ZUO_YOU = ['左辅', '右弼'];
const CHANG_QU = ['文昌', '文曲'];
const KUI_YUE = ['天魁', '天钺'];

// ────────────────── 辅助函数 ──────────────────
function getMajorStarNames(palace: Palace): string[] {
  return palace.stars.filter(s => s.type === 'major').map(s => s.name);
}
function findStar(palace: Palace, name: string): Star | undefined {
  return palace.stars.find(s => s.name === name);
}
function hasStar(palace: Palace, name: string): boolean {
  return palace.stars.some(s => s.name === name);
}
function findStarPalace(chart: ZiweiChart, name: string): Palace | undefined {
  return chart.palaces.find(p => p.stars.some(s => s.name === name));
}
function getPalaceByBranch(chart: ZiweiChart, branch: number): Palace | undefined {
  return chart.palaces.find(p => p.branch === ((branch % 12) + 12) % 12);
}
function shaCountInPalace(palace: Palace, list: string[] = SHA_HARD): number {
  return palace.stars.filter(s => list.includes(s.name)).length;
}
function hasShaInPalace(palace: Palace, list: string[] = SHA_NAMES): boolean {
  return palace.stars.some(s => list.includes(s.name));
}
function getSanFangPalaces(chart: ZiweiChart): Palace[] {
  const m = chart.mingGongBranch;
  const branches = [m, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12];
  return chart.palaces.filter(p => branches.includes(p.branch));
}
function isInSanFang(chart: ZiweiChart, branch: number): boolean {
  const m = chart.mingGongBranch;
  return [m, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12].includes(branch);
}
function getDuiGong(chart: ZiweiChart, branch: number): Palace | undefined {
  return getPalaceByBranch(chart, (branch + 6) % 12);
}
function getJiaPalaces(chart: ZiweiChart, branch: number): { prev?: Palace; next?: Palace } {
  return {
    prev: getPalaceByBranch(chart, (branch + 11) % 12),
    next: getPalaceByBranch(chart, (branch + 1) % 12),
  };
}
function sanFangAllStars(chart: ZiweiChart): Set<string> {
  return new Set(getSanFangPalaces(chart).flatMap(p => p.stars.map(s => s.name)));
}
function sanFangShaCount(chart: ZiweiChart, list: string[] = SHA_HARD): number {
  return getSanFangPalaces(chart).reduce((sum, p) => sum + shaCountInPalace(p, list), 0);
}
function isBright(palace: Palace, starName: string): boolean {
  const s = findStar(palace, starName);
  return s?.brightness === 'bright';
}
function isDim(palace: Palace, starName: string): boolean {
  const s = findStar(palace, starName);
  return s?.brightness === 'dim';
}
function getStarSiHua(palace: Palace, starName: string): Star['siHua'] | undefined {
  return findStar(palace, starName)?.siHua;
}
// 四化挂在星曜的 siHua 字段上，不是独立星名——不能用 hasStar / sanFangAllStars 查「化禄」
function palaceHasSiHua(palace: Palace, hua: SiHua): boolean {
  return palace.stars.some(s => s.siHua === hua);
}
function sanFangHasSiHua(chart: ZiweiChart, hua: SiHua): boolean {
  return getSanFangPalaces(chart).some(p => palaceHasSiHua(p, hua));
}
const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// ────────────────── 正格识别器 ──────────────────

/** 君臣庆会：Tử Vi nhập Mệnh，Tả Phù Hữu Bật đồng hội（同宫或三方） */
function detectJunChenQingHui(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (!hasStar(ming, '紫微')) return;
  const sanFangSet = sanFangAllStars(chart);
  const hasZuo = sanFangSet.has('左辅');
  const hasYou = sanFangSet.has('右弼');
  if (!hasZuo || !hasYou) return;

  const required = ['Tử Vi nhập Mệnh', 'Tả Phù Hữu Bật đồng hội tam phương tứ chính'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('Lại hội Văn Xương hoặc Văn Khúc');
  if (sanFangSet.has('天魁') || sanFangSet.has('天钺')) bonus.push('Khôi Việt quý nhân gia chiếu');
  if (getStarSiHua(ming, '紫微') === '权') bonus.push('Tử Vi Hóa Quyền');
  if (sanFangShaCount(chart, SHA_KONG) >= 2) breaking.push('Địa Không Địa Kiếp song giáp hội chiếu (Tử Vi kỵ Không Kiếp)');

  patterns.push({
    name: 'Quân Thần Khánh Hội',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Tử Vi nhập Mệnh, Tả Phù Hữu Bật đồng hội, đế vương được hiền thần phò tá, chủ đại phú đại quý, mệnh thống ngự. Suốt đời quý nhân không dứt, hợp đi chính thương vị trí cao, lãnh đạo đa lĩnh vực.',
    palaces: ['命宫'],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư · Cách Quân Thần Khánh Hội»',
  });
}

/** 紫府同宫：紫微+天府于命宫（限寅、申宫） */
function detectZiFu(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const ziwei = findStarPalace(chart, '紫微');
  const tianfu = findStarPalace(chart, '天府');
  if (!ziwei || !tianfu || ziwei.branch !== tianfu.branch) return;

  const inMing = ziwei.branch === chart.mingGongBranch;
  const required = inMing
    ? ['Tử Vi Thiên Phủ đồng nhập cung Mệnh']
    : ['Tử Vi Thiên Phủ đồng cung (không ở cung Mệnh, hội chiếu giảm lực)'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  const sanFangSet = sanFangAllStars(chart);
  if (sanFangSet.has('左辅') && sanFangSet.has('右弼')) bonus.push('Tả Phù Hữu Bật đồng hội');
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('Lại hội Xương Khúc');
  if (hasShaInPalace(ziwei, SHA_KONG)) breaking.push('Cung Tử Phủ tọa Không Kiếp (phá quý khí của Tử Phủ)');
  if (shaCountInPalace(ziwei, SHA_HARD) >= 2) breaking.push('Cung Tử Phủ gặp song sát đồng tọa');

  patterns.push({
    name: 'Tử Phủ đồng cung',
    level: inMing && !breaking.length ? 'excellent' : 'good',
    description: inMing
      ? 'Tử Vi Thiên Phủ cùng nhập cung Mệnh, đế tướng cùng lâm, mệnh tôn quý. Chủ phẩm hạnh đoan chính, áo cơm không lo, có tài lãnh đạo, hợp đảm nhiệm trọng trách. Cần Tả Hữu Phụ Bật phối hợp mới thành đại cách hoàn chỉnh.'
      : 'Tử Vi Thiên Phủ đồng cung nhưng không tọa Mệnh, chủ suốt đời có quý nhân quý khí nương tựa, nhưng bản thân chưa chắc đại phú quý, cần xem hội chiếu cát sát mà định.',
    palaces: [ziwei.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư · Cách Tử Phủ Đồng Cung»',
  });
}

/** 府相朝垣：天府、天相分别坐守命宫的三方四正 */
function detectFuXiangChaoYuan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const tianfu = findStarPalace(chart, '天府');
  const tianxiang = findStarPalace(chart, '天相');
  if (!tianfu || !tianxiang) return;
  if (!isInSanFang(chart, tianfu.branch) || !isInSanFang(chart, tianxiang.branch)) return;
  if (tianfu.branch === chart.mingGongBranch && tianxiang.branch === chart.mingGongBranch) return;
  if (tianfu.branch === tianxiang.branch) return;

  const required = ['Thiên Phủ tọa tam phương cung Mệnh', 'Thiên Tướng tọa tam phương cung Mệnh', 'Hai sao khác cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (hasStar(ming, '禄存') || palaceHasSiHua(ming, '禄')) bonus.push('Cung Mệnh gặp Lộc');
  if (sanFangAllStars(chart).has('左辅')) bonus.push('Lại hội Tả Phù');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('Cung Mệnh tọa sát tinh');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('Tam phương tứ chính sát tinh quá nhiều');

  patterns.push({
    name: 'Phủ Tướng triều viên',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Thiên Phủ Thiên Tướng phân thủ tam phương tứ chính của cung Mệnh, văn võ song toàn, quyền ấn cùng rực rỡ, chủ suốt đời áo cơm đầy đủ, địa vị cao quý. Cổ thư nói “Phủ Tướng triều viên, thiên chung thực lộc”, thường gặp ở giới chính trị, quản lý doanh nghiệp.',
    palaces: [tianfu.name, tianxiang.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư · Cách Phủ Tướng Triều Viên»',
  });
}

/** 阳梁昌禄：太阳+天梁+文昌+禄存四星会命宫，大贵格 */
function detectYangLiangChangLu(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('太阳') || !sanFangSet.has('天梁') ||
      !sanFangSet.has('文昌') || !sanFangSet.has('禄存')) return;

  const sun = findStarPalace(chart, '太阳')!;
  const liang = findStarPalace(chart, '天梁')!;
  const required = [
    'Thái Dương hội tam phương cung Mệnh',
    'Thiên Lương hội tam phương cung Mệnh',
    'Văn Xương hội tam phương cung Mệnh',
    'Lộc Tồn hội tam phương cung Mệnh',
  ];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (isBright(sun, '太阳')) bonus.push('Thái Dương miếu vượng');
  if (isBright(liang, '天梁')) bonus.push('Thiên Lương miếu vượng');
  if (sanFangHasSiHua(chart, '科')) bonus.push('Lại hội Hóa Khoa');
  if (isDim(sun, '太阳')) breaking.push('Thái Dương lạc hãm (Dương Lương thất huy)');
  if (sanFangShaCount(chart, SHA_HARD) >= 2) breaking.push('Tam phương sát nặng');

  patterns.push({
    name: 'Dương Lương Xương Lộc',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Thái Dương, Thiên Lương, Văn Xương, Lộc Tồn bốn sao cùng hội tam phương cung Mệnh, được gọi là “sao khoa cử”, chủ thanh quý hiển đạt, vận thi cử cực tốt, hợp đi học thuật, văn giáo, nghiên cứu, chứng chỉ chuyên môn, suốt đời công danh dễ thành.',
    palaces: [sun.name, liang.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư · Cách Dương Lương Xương Lộc»',
  });
}

/** 火贪格 / 铃贪格：贪狼+火星 或 贪狼+铃星 同宫或会照 */
function detectHuoTanLingTan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const tan = findStarPalace(chart, '贪狼');
  if (!tan) return;
  const huo = findStarPalace(chart, '火星');
  const ling = findStarPalace(chart, '铃星');

  for (const [shaName, shaPalace] of [['火星', huo], ['铃星', ling]] as const) {
    if (!shaPalace) continue;
    const sameOrTrine =
      tan.branch === shaPalace.branch ||
      (tan.branch + 4) % 12 === shaPalace.branch ||
      (tan.branch + 8) % 12 === shaPalace.branch ||
      (tan.branch + 6) % 12 === shaPalace.branch;
    if (!sameOrTrine) continue;
    if (!isInSanFang(chart, tan.branch)) continue;

    const required = [`Tham Lang ${tan.branch === shaPalace.branch ? 'đồng cung' : 'hội chiếu'} ${VI_STAR[shaName] ?? shaName}`, 'Tham Lang hội chiếu tam phương cung Mệnh'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (isBright(tan, '贪狼')) bonus.push('Tham Lang miếu vượng');
    if (getStarSiHua(tan, '贪狼') === '禄' || getStarSiHua(tan, '贪狼') === '权') bonus.push('Tham Lang Hóa Lộc/Hóa Quyền');
    if (hasShaInPalace(tan, ['擎羊', '陀罗'])) breaking.push('Cung Tham Lang lại gặp Dương Đà (phá lực hoạnh phát)');
    if (hasShaInPalace(tan, SHA_KONG)) breaking.push('Tham Lang gặp Không Kiếp (tài đến tài đi)');

    patterns.push({
      name: shaName === '火星' ? 'Cách Hỏa Tham' : 'Cách Linh Tham',
      level: breaking.length ? 'good' : 'excellent',
      description: `Tham Lang gặp ${VI_STAR[shaName] ?? shaName}${tan.branch === shaPalace.branch ? ' đồng cung' : ' hội chiếu tam phương'}, chủ phát tài bất ngờ, cơ hội đến đột ngột. Cổ thư nói “Tham Lang gặp Hỏa Linh, ắt phát hoạnh tài”, nhưng đến nhanh đi cũng nhanh, nên biết dừng đúng lúc.${breaking.length ? ' Lá số này đã chạm điều kiện phá cách, lực phát giảm.' : ''}`,
      palaces: [tan.name, shaPalace.name],
      conditions: { required, bonus, breaking },
      source: '«Tử Vi Đẩu Số Cốt Tủy Phú»',
    });
  }
}

/** 武贪格：武曲+贪狼 同宫（丑、未） 或 对照 */
function detectWuTan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const wu = findStarPalace(chart, '武曲');
  const tan = findStarPalace(chart, '贪狼');
  if (!wu || !tan) return;
  const sameOrOppose = wu.branch === tan.branch || (wu.branch + 6) % 12 === tan.branch;
  if (!sameOrOppose) return;
  if (!isInSanFang(chart, wu.branch) && !isInSanFang(chart, tan.branch)) return;

  const required = [
    wu.branch === tan.branch ? 'Vũ Khúc Tham Lang đồng cung (Sửu/Mùi)' : 'Vũ Khúc Tham Lang đối cung củng chiếu',
    'Hội chiếu tam phương cung Mệnh',
  ];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('火星') || sanFangAllStars(chart).has('铃星'))
    bonus.push('Lại gặp Hỏa Tinh/Linh Tinh (Hỏa Tham/Linh Tham chồng thêm)');
  if (getStarSiHua(wu, '武曲') === '禄') bonus.push('Vũ Khúc Hóa Lộc');
  if (hasShaInPalace(wu, ['擎羊', '陀罗'])) breaking.push('Cung Vũ Tham gặp Dương Đà');
  if (hasShaInPalace(wu, SHA_KONG)) breaking.push('Cung Vũ Tham gặp Không Kiếp');

  patterns.push({
    name: 'Cách Vũ Tham',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Vũ Khúc Tham Lang hội Mệnh, sao tài cùng sao đào hoa dục vọng giao thoa, cổ thư nói “Vũ Tham không phát lúc thiếu niên” — sau ba mươi tuổi mới tích lũy dày rồi phát. Chủ trung niên về sau đại phú đại quý, tài nguyên đến từ nhân mạch, giao tiếp, quản lý dục vọng, hợp tài chính, đầu cơ, bán hàng, giải trí.',
    palaces: [wu.name, tan.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Cốt Tủy Phú»',
  });
}

/** 杀破狼：七杀、破军、贪狼三方齐聚 */
function detectShaPoLang(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['七杀', '破军', '贪狼'].filter(s => sanFangSet.has(s));
  if (has.length < 3) return;

  const required = ['Thất Sát, Phá Quân, Tham Lang ba sao cùng nhập tam phương tứ chính cung Mệnh'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangHasSiHua(chart, '禄') || sanFangHasSiHua(chart, '权')) bonus.push('Tam phương có Hóa Lộc hoặc Hóa Quyền (động mà có lực)');
  if (sanFangSet.has('左辅') && sanFangSet.has('右弼')) bonus.push('Phụ Bật đồng hội (trong biến động có quý nhân)');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('Sát tinh quá nặng (động mà không thành)');
  if (hasShaInPalace(ming, SHA_KONG)) breaking.push('Mệnh tọa Không Kiếp (động mà vất vả)');

  patterns.push({
    name: 'Sát Phá Lang',
    level: breaking.length ? 'caution' : 'good',
    description: 'Thất Sát, Phá Quân, Tham Lang ba sao hội Mệnh, là mệnh cách khai sáng xông xáo. Suốt đời biến động nhiều, không cam chịu tầm thường, hợp khởi nghiệp, quân cảnh, kinh doanh, bán hàng. Trung niên về sau mới ổn định giữ thành, lúc trẻ dễ vì bốc đồng mà thất bại.',
    palaces: getSanFangPalaces(chart).filter(p => has.includes(getMajorStarNames(p)[0])).map(p => p.name),
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư · Sát Phá Lang»',
  });
}

/** 机月同梁：天机、太阴、天同、天梁四星齐入命迁财官 */
function detectJiYueTongLiang(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['天机', '太阴', '天同', '天梁'].filter(s => sanFangSet.has(s));
  if (has.length < 4) return;

  const required = ['Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương bốn sao cùng nhập tam phương tứ chính cung Mệnh'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('Lại hội Xương Khúc');
  if (sanFangHasSiHua(chart, '科')) bonus.push('Lại hội Hóa Khoa');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('Sát tinh quá nhiều (Cơ Nguyệt Đồng Lương kỵ sát)');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('Cung Mệnh tọa sát');

  patterns.push({
    name: 'Cơ Nguyệt Đồng Lương',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Thiên Cơ Thái Âm Thiên Đồng Thiên Lương bốn sao cùng nhập Mệnh Thiên Di Tài Bạch Quan Lộc, văn chất nho nhã, thông tuệ giỏi mưu. Hợp nhất công chức, học thuật, văn nghệ, y tế, dịch vụ — những ngành cần ổn định tích lũy, không hợp mạo hiểm lớn, đầu cơ lớn.',
    palaces: getSanFangPalaces(chart).filter(p => has.some(s => getMajorStarNames(p).includes(s))).map(p => p.name),
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư · Cách Cơ Nguyệt Đồng Lương»',
  });
}

/** 廉贞天相：同宫 */
function detectLianXiang(chart: ZiweiChart, patterns: Pattern[]) {
  const lian = findStarPalace(chart, '廉贞');
  const xiang = findStarPalace(chart, '天相');
  if (!lian || !xiang || lian.branch !== xiang.branch) return;

  const inMing = lian.branch === chart.mingGongBranch;
  const required = ['Liêm Trinh Thiên Tướng đồng cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (hasStar(lian, '禄存') || getStarSiHua(lian, '廉贞') === '禄') bonus.push('Gặp Lộc Tồn hoặc Liêm Trinh Hóa Lộc');
  if (sanFangAllStars(chart).has('左辅')) bonus.push('Tả Phù hội chiếu');
  if (hasShaInPalace(lian, ['擎羊'])) breaking.push('Cung Liêm Tướng tọa Kình Dương (khuynh hướng Liêm Sát Dương)');
  if (getStarSiHua(lian, '廉贞') === '忌') breaking.push('Liêm Trinh Hóa Kỵ');

  patterns.push({
    name: 'Cách Liêm Tướng',
    level: breaking.length ? 'caution' : (inMing ? 'good' : 'neutral'),
    description: 'Liêm Trinh Thiên Tướng đồng cung, cách cục ấn thụ, chủ làm việc công bằng, tiếng thanh liêm, hợp làm công chức, quản lý hành chính, pháp vụ, hoạch định. Sợ gặp Kình Dương Hóa Kỵ, ngược lại chủ quan phi.',
    palaces: [lian.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

/** 武曲七杀：同宫，将星配财星 */
function detectWuQiSha(chart: ZiweiChart, patterns: Pattern[]) {
  const wu = findStarPalace(chart, '武曲');
  const qi = findStarPalace(chart, '七杀');
  if (!wu || !qi || wu.branch !== qi.branch) return;

  const inMing = wu.branch === chart.mingGongBranch;
  const required = ['Vũ Khúc Thất Sát đồng cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (getStarSiHua(wu, '武曲') === '权') bonus.push('Vũ Khúc Hóa Quyền');
  if (getStarSiHua(wu, '武曲') === '禄') bonus.push('Vũ Khúc Hóa Lộc');
  if (getStarSiHua(wu, '武曲') === '忌') breaking.push('Vũ Khúc Hóa Kỵ (Vũ Khúc Hóa Kỵ là điềm tài kiếp)');
  if (hasShaInPalace(wu, ['擎羊', '陀罗', '火星', '铃星'])) breaking.push('Cung Vũ Sát sát tinh quá nhiều');

  patterns.push({
    name: 'Vũ Khúc Thất Sát',
    level: breaking.length ? 'caution' : (inMing ? 'excellent' : 'good'),
    description: 'Vũ Khúc Thất Sát đồng cung, sao tướng phối sao tài, chủ quả quyết cương nghị, giỏi quản lý tiền bạc, hợp tài chính, quân cảnh, khởi nghiệp. Nhưng kỵ gặp Hóa Kỵ sát tinh, nếu không sẽ hung hiểm. Suốt đời phấn đấu, tích tài nhưng lo toan.',
    palaces: [wu.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

/** 天同天梁：同宫 */
function detectTongLiang(chart: ZiweiChart, patterns: Pattern[]) {
  const tong = findStarPalace(chart, '天同');
  const liang = findStarPalace(chart, '天梁');
  if (!tong || !liang || tong.branch !== liang.branch) return;

  const required = ['Thiên Đồng Thiên Lương đồng cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('文昌')) bonus.push('Văn Xương hội chiếu');
  if (getStarSiHua(tong, '天同') === '禄') bonus.push('Thiên Đồng Hóa Lộc');
  if (hasShaInPalace(tong, SHA_HARD)) breaking.push('Sát tinh đồng tọa');

  patterns.push({
    name: 'Cách Đồng Lương',
    level: breaking.length ? 'neutral' : 'good',
    description: 'Thiên Đồng Thiên Lương đồng cung, sao phúc cùng sao ấm hội tụ, chủ khoan hậu hòa nhã, thích giúp người, hợp y tế, giáo dục, tôn giáo, công ích xã hội. Nhưng thiên về ôn hòa bảo thủ, khó thành cục đại phú đại quý.',
    palaces: [tong.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

/** 日月同宫：太阳太阴丑或未宫同宫 */
function detectRiYueTongGong(chart: ZiweiChart, patterns: Pattern[]) {
  const sun = findStarPalace(chart, '太阳');
  const moon = findStarPalace(chart, '太阴');
  if (!sun || !moon || sun.branch !== moon.branch) return;
  if (sun.branch !== 1 && sun.branch !== 7) return;  // 必须丑(1) 或 未(7)

  const inMing = sun.branch === chart.mingGongBranch;
  const required = [`Thái Dương Thái Âm đồng nhập cung ${VI_BRANCH[BRANCH_NAMES[sun.branch]]}`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sun.branch === 7) bonus.push('Cung Mùi Nhật Nguyệt đồng huy (cổ thư nói cung Mùi Nhật Nguyệt song mỹ)');
  if (sanFangAllStars(chart).has('文昌') && sanFangAllStars(chart).has('文曲')) bonus.push('Xương Khúc hội chiếu');
  if (hasShaInPalace(sun, SHA_HARD)) breaking.push('Cung Nhật Nguyệt sát tinh đồng tọa');

  patterns.push({
    name: 'Nhật Nguyệt đồng cung',
    level: breaking.length ? 'good' : (inMing ? 'excellent' : 'good'),
    description: `Thái Dương Thái Âm đồng cung tại cung ${VI_BRANCH[BRANCH_NAMES[sun.branch]]}, âm dương cân bằng, văn võ song toàn. Chủ duyên khác giới tốt, sự nghiệp thuận lợi, danh tiếng vang xa.${sun.branch === 7 ? ' Cung Mùi Nhật Nguyệt song mỹ càng tốt.' : ' Cung Sửu Nhật Nguyệt đồng cung, lực bình thường.'}`,
    palaces: [sun.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

/** 日月夹命：太阳太阴在命宫前后两宫 */
function detectRiYueJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const prevHasSun = hasStar(prev, '太阳');
  const prevHasMoon = hasStar(prev, '太阴');
  const nextHasSun = hasStar(next, '太阳');
  const nextHasMoon = hasStar(next, '太阴');
  const ok = (prevHasSun && nextHasMoon) || (prevHasMoon && nextHasSun);
  if (!ok) return;

  const sunPalace = prevHasSun ? prev : next;
  const moonPalace = prevHasMoon ? prev : next;
  const required = ['Thái Dương Thái Âm phân cư trước sau hai cung của cung Mệnh'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (isBright(sunPalace, '太阳')) bonus.push('Thái Dương miếu vượng');
  if (isBright(moonPalace, '太阴')) bonus.push('Thái Âm miếu vượng');
  if (isDim(sunPalace, '太阳') || isDim(moonPalace, '太阴')) breaking.push('Nhật Nguyệt lạc hãm (giáp Mệnh vô quang)');

  patterns.push({
    name: 'Nhật Nguyệt giáp Mệnh',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Thái Dương Thái Âm phân cư hai bên cung Mệnh giáp chiếu, quang minh lỗi lạc, suốt đời quý nhân giúp đỡ, sự nghiệp hưng thịnh. Nam chủ quan quý, nữ chủ vượng phu ích gia. Nhật Nguyệt phải không lạc hãm mới là giáp thật.',
    palaces: [sunPalace.name, moonPalace.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư · Nhật Nguyệt Giáp Mệnh»',
  });
}

/** 巨日同宫：巨门太阳同入寅或申 */
function detectJuRiTongGong(chart: ZiweiChart, patterns: Pattern[]) {
  const ju = findStarPalace(chart, '巨门');
  const sun = findStarPalace(chart, '太阳');
  if (!ju || !sun || ju.branch !== sun.branch) return;
  if (ju.branch !== 2 && ju.branch !== 8) return;  // 必须寅(2) 或 申(8)

  const inMing = ju.branch === chart.mingGongBranch;
  const required = [`Cự Môn Thái Dương đồng nhập cung ${VI_BRANCH[BRANCH_NAMES[ju.branch]]}`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (ju.branch === 2) bonus.push('Cung Dần Thái Dương miếu vượng, Cự Môn được nhật quang hóa giải thị phi');
  if (getStarSiHua(ju, '巨门') === '禄' || getStarSiHua(ju, '巨门') === '权') bonus.push('Cự Môn Hóa Lộc/Hóa Quyền (khẩu tài sinh tài)');
  if (getStarSiHua(ju, '巨门') === '忌') breaking.push('Cự Môn Hóa Kỵ (khẩu thiệt quan phi)');
  if (ju.branch === 8) breaking.push('Cung Thân Thái Dương ngả về tây, ám tinh Cự Môn càng rõ');

  patterns.push({
    name: 'Cự Nhật đồng cung',
    level: breaking.length ? 'caution' : (inMing && ju.branch === 2 ? 'excellent' : 'good'),
    description: `Cự Môn Thái Dương đồng cung ${VI_BRANCH[BRANCH_NAMES[ju.branch]]}, Thái Dương hóa giải ám tinh Cự Môn, chủ lập nghiệp bằng khẩu tài, truyền thông, ngoại ngữ, chuyên môn. Cung Dần là tốt nhất, cung Thân lực giảm. Sợ Cự Môn Hóa Kỵ thì quan phi.`,
    palaces: [ju.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư · Cự Nhật Đồng Cung»',
  });
}

/** 石中隐玉：巨门入命于子午宫 */
function detectShiZhongYinYu(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (!hasStar(ming, '巨门')) return;
  if (ming.branch !== 0 && ming.branch !== 6) return;  // 子(0) 或 午(6)

  const required = [`Cự Môn nhập Mệnh tại cung ${VI_BRANCH[BRANCH_NAMES[ming.branch]]}`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (getStarSiHua(ming, '巨门') === '禄' || getStarSiHua(ming, '巨门') === '权') bonus.push('巨门化禄/化权');
  if (sanFangAllStars(chart).has('文昌')) bonus.push('Văn Xương hội chiếu (Thạch Trung Ẩn Ngọc được sáng)');
  if (getStarSiHua(ming, '巨门') === '忌') breaking.push('Cự Môn Hóa Kỵ (ngọc giấu trong bùn sâu)');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('命坐煞星');

  patterns.push({
    name: 'Thạch Trung Ẩn Ngọc',
    level: breaking.length ? 'caution' : 'excellent',
    description: 'Cự Môn tọa Mệnh tại Tý Ngọ, bề ngoài bình thường mà bên trong chứa tài học. Thời trẻ lặng lẽ vô danh, trung niên mới hiển quý khí, hợp đi chuyên môn, nghiên cứu, khẩu tài, truyền thông. Cần có Lộc Quyền hoặc Văn Xương giúp đỡ mới “đục đá thấy ngọc”.',
    palaces: ['命宫'],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Cốt Tủy Phú · Thạch Trung Ẩn Ngọc»',
  });
}

/** 明珠出海：命宫在未空宫，对宫丑宫为太阳太阴 */
function detectMingZhuChuHai(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (ming.branch !== 7) return;   // 命在未
  if (getMajorStarNames(ming).length > 0) return;   // 命宫为空宫
  const dui = getDuiGong(chart, ming.branch);
  if (!dui) return;
  if (!hasStar(dui, '太阳') || !hasStar(dui, '太阴')) return;

  const required = ['Cung Mệnh tại Mùi là cung trống', 'Đối cung Sửu là Thái Dương Thái Âm đồng độ'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('文昌') || sanFangAllStars(chart).has('文曲')) bonus.push('Lại hội Xương Khúc');
  if (sanFangAllStars(chart).has('左辅') || sanFangAllStars(chart).has('右弼')) bonus.push('Phụ Bật tương trợ');
  if (sanFangShaCount(chart, SHA_HARD) >= 2) breaking.push('Sát tinh hội chiếu (châu quang ảm đạm)');

  patterns.push({
    name: 'Minh Châu Xuất Hải',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Mệnh tại Mùi là cung trống, đối cung Sửu Nhật Nguyệt đồng huy củng chiếu, gọi là “Minh Châu Xuất Hải”. Chủ xuất thân bình thường, nhờ nỗ lực sau này mà vươn lên, hợp đi xa quê, nghiên cứu học thuật hoặc vị trí cao trong công ty lớn, chủ đại phú đại quý.',
    palaces: ['命宫', dui.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Tập · Minh Châu Xuất Hải»',
  });
}

/** 紫微独坐入命 */
function detectZiWeiInMing(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (!hasStar(ming, '紫微') || hasStar(ming, '天府')) return;

  const required = ['Tử Vi độc tọa cung Mệnh (không có Thiên Phủ đồng tọa)'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  const sanFangSet = sanFangAllStars(chart);
  if (sanFangSet.has('左辅') && sanFangSet.has('右弼')) bonus.push('Tả Phù Hữu Bật đồng hội');
  if (sanFangSet.has('文昌') && sanFangSet.has('文曲')) bonus.push('Văn Xương Văn Khúc đồng hội');
  if (!sanFangSet.has('左辅') && !sanFangSet.has('右弼')) breaking.push('Không có Phụ Bật (cô quân vô thần)');
  if (hasShaInPalace(ming, SHA_KONG)) breaking.push('Tử Vi gặp Không Kiếp (cổ thư kỵ nhất)');

  patterns.push({
    name: 'Tử Vi nhập Mệnh',
    level: breaking.length ? 'caution' : (bonus.length ? 'excellent' : 'good'),
    description: 'Tử Vi độc tọa cung Mệnh, sao đế vương, tự tôn mạnh, có sức hút lãnh đạo. Nhưng Tử Vi kỵ nhất “tại dã cô quân” — nếu không có Tả Hữu Phụ Bật hội chiếu, ngược lại thành cô cao tự ngạo, dễ chiêu hủy báng.',
    palaces: ['命宫'],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

/** 辅弼夹命 */
function detectFuBiJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const prevHasZuo = hasStar(prev, '左辅');
  const prevHasYou = hasStar(prev, '右弼');
  const nextHasZuo = hasStar(next, '左辅');
  const nextHasYou = hasStar(next, '右弼');
  if (!((prevHasZuo && nextHasYou) || (prevHasYou && nextHasZuo))) return;

  const required = ['Tả Phù Hữu Bật phân cư trước sau hai cung của cung Mệnh'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('天魁') || sanFangAllStars(chart).has('天钺')) bonus.push('Lại hội Khôi Việt');

  patterns.push({
    name: 'Phụ Bật giáp Mệnh',
    level: 'excellent',
    description: 'Tả Phù Hữu Bật giáp Mệnh, luận thuật truyền thống cho rằng cách này tượng trưng cho quý nhân giúp đỡ và phúc hậu. Hợp đi quan lộ, quản lý doanh nghiệp lớn — những hướng phát huy được tài tổ chức. Cổ thư nói “Tả Phù Hữu Bật, chung thân phúc hậu” — nhấn mạnh ưu thế của cách này trong tổ chức điều phối.',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required, bonus, breaking },
    source: '«Tử Vi Đẩu Số Toàn Thư · Phụ Bật Giáp Mệnh»',
  });
}

/** 昌曲夹命 */
function detectChangQuJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const prevHasChang = hasStar(prev, '文昌');
  const prevHasQu = hasStar(prev, '文曲');
  const nextHasChang = hasStar(next, '文昌');
  const nextHasQu = hasStar(next, '文曲');
  if (!((prevHasChang && nextHasQu) || (prevHasQu && nextHasChang))) return;

  patterns.push({
    name: 'Xương Khúc giáp Mệnh',
    level: 'excellent',
    description: 'Văn Xương Văn Khúc giáp cung Mệnh, chủ thông minh tuấn tú, văn tài xuất chúng, hợp đi văn giáo, học thuật, nghệ thuật, viết lách. Cổ thư nói “Xương Khúc giáp Mệnh chủ khoa giáp”, có lợi nhất cho vận thi cử.',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ['Văn Xương Văn Khúc phân cư trước sau hai cung của cung Mệnh'] },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

/** 魁钺夹命 */
function detectKuiYueJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '天魁') && hasStar(next, '天钺');
  const okB = hasStar(prev, '天钺') && hasStar(next, '天魁');
  if (!okA && !okB) return;

  patterns.push({
    name: 'Khôi Việt giáp Mệnh',
    level: 'good',
    description: 'Thiên Khôi Thiên Việt giáp Mệnh, nam gọi là Thiên Ất, nữ gọi là Ngọc Đường, suốt đời quý nhân nâng đỡ. Thi cử, tìm việc, thời khắc quan trọng thường có quý nhân bất ngờ giúp đỡ.',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ['Thiên Khôi Thiên Việt phân cư trước sau hai cung của cung Mệnh'] },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

/** 双禄朝垣：化禄 + 禄存 同会三方 */
function detectShuangLuChaoYuan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFang = getSanFangPalaces(chart);
  let huaLuFound = false;
  let luCunFound = false;
  for (const p of sanFang) {
    if (p.stars.some(s => s.siHua === '禄')) huaLuFound = true;
    if (hasStar(p, '禄存')) luCunFound = true;
  }
  if (!huaLuFound || !luCunFound) return;

  patterns.push({
    name: 'Song Lộc triều viên',
    level: 'excellent',
    description: 'Hóa Lộc, Lộc Tồn đồng hội tam phương tứ chính cung Mệnh, tài nguyên dồi dào, áo cơm đầy đủ. Cổ thư nói “Song Lộc triều viên, phú sánh Đào Chu”, chủ suốt đời không lo tiền, thường có cả chính tài lẫn hoạnh tài.',
    palaces: sanFang.map(p => p.name),
    conditions: {
      required: ['Hóa Lộc hội chiếu tam phương tứ chính', 'Lộc Tồn hội chiếu tam phương tứ chính'],
      breaking: hasShaInPalace(ming, SHA_KONG) ? ['Mệnh tọa Không Kiếp (song Lộc gặp Không, tài đến tài đi)'] : undefined,
    },
    source: '«Tử Vi Đẩu Số Toàn Thư · Song Lộc Triều Viên»',
  });
}

/** 三奇加会：化禄 化权 化科 同会三方 */
function detectSanQiJiaHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangPalaces = getSanFangPalaces(chart);
  let lu = false, quan = false, ke = false;
  for (const p of sanFangPalaces) {
    for (const s of p.stars) {
      if (s.siHua === '禄') lu = true;
      if (s.siHua === '权') quan = true;
      if (s.siHua === '科') ke = true;
    }
  }
  if (!(lu && quan && ke)) return;

  patterns.push({
    name: 'Tam Kỳ gia hội',
    level: 'excellent',
    description: 'Hóa Lộc, Hóa Quyền, Hóa Khoa ba cát hóa cùng hội tam phương tứ chính cung Mệnh, gọi là “Tam Kỳ gia hội”. Chủ suốt đời công danh, tài phú, quý nhân đủ cả ba, là một trong những cát cách cao nhất của Tử Vi Đẩu Số.',
    palaces: sanFangPalaces.map(p => p.name),
    conditions: { required: ['Hóa Lộc, Hóa Quyền, Hóa Khoa ba cát hóa cùng hội tam phương tứ chính cung Mệnh'] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Tam Kỳ Gia Hội»',
  });
}

/** 化禄入命/官/财 */
function detectHuaLuRuMing(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const huaLuStar = ming.stars.find(s => s.siHua === '禄' && s.type === 'major');
  if (!huaLuStar) return;

  patterns.push({
    name: `${VI_STAR[huaLuStar.name] ?? huaLuStar.name} Hóa Lộc nhập Mệnh`,
    level: 'good',
    description: `${VI_STAR[huaLuStar.name] ?? huaLuStar.name} Hóa Lộc tọa Mệnh, chủ sinh tài thuận lợi, nhân duyên tốt, cơ hội nhiều.${huaLuStar.name === '武曲' ? ' Vũ Khúc Hóa Lộc thuộc chính tài, hợp thực nghiệp, tài chính.' : huaLuStar.name === '太阴' ? ' Thái Âm Hóa Lộc thuộc âm tài, bất động sản.' : huaLuStar.name === '贪狼' ? ' Tham Lang Hóa Lộc thuộc tài nhân mạch, tài đào hoa.' : ''}`,
    palaces: ['命宫'],
    conditions: { required: [`${VI_STAR[huaLuStar.name] ?? huaLuStar.name} Hóa Lộc tọa cung Mệnh`] },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

// ────────────────── 恶格识别器 ──────────────────

/** 化忌入命/迁 */
function detectHuaJiRuMingQian(chart: ZiweiChart, patterns: Pattern[]) {
  const qianBranch = (chart.mingGongBranch + 6) % 12;
  for (const palace of chart.palaces) {
    if (palace.branch !== chart.mingGongBranch && palace.branch !== qianBranch) continue;
    const jiStar = palace.stars.find(s => s.siHua === '忌' && s.type === 'major');
    if (!jiStar) continue;

    const inMing = palace.branch === chart.mingGongBranch;
    patterns.push({
      name: `${VI_STAR[jiStar.name] ?? jiStar.name} Hóa Kỵ nhập ${inMing ? 'Mệnh' : 'Thiên Di'}`,
      level: 'caution',
      description: inMing
        ? `${VI_STAR[jiStar.name] ?? jiStar.name} Hóa Kỵ tọa cung Mệnh, cần lưu tâm tính cố chấp, trở ngại tâm lý hoặc ẩn họa sức khỏe, mọi việc nên lùi một bước mà suy nghĩ. Hóa Kỵ chưa chắc đã xấu, nó cho thấy năng lượng của sao này cần được đặc biệt chú ý.`
        : `${VI_STAR[jiStar.name] ?? jiStar.name} Hóa Kỵ tọa cung Thiên Di, ra ngoài, đi xa, quan hệ với người dễ có trắc trở, nên giữ chứ không nên động.`,
      palaces: [palace.name],
      conditions: { required: [`${VI_STAR[jiStar.name] ?? jiStar.name} Hóa Kỵ tọa cung ${inMing ? 'Mệnh' : 'Thiên Di'}`] },
      source: '«Tử Vi Đẩu Số Toàn Thư»',
    });
  }
}

/** 羊陀夹忌：化忌坐宫，左右被擎羊陀罗夹 */
function detectYangTuoJiaJi(chart: ZiweiChart, patterns: Pattern[]) {
  for (const palace of chart.palaces) {
    const jiStar = palace.stars.find(s => s.siHua === '忌');
    if (!jiStar) continue;
    if (palace.branch !== chart.mingGongBranch) continue;   // 只看命宫被夹

    const { prev, next } = getJiaPalaces(chart, palace.branch);
    if (!prev || !next) continue;
    const aPrev = hasStar(prev, '擎羊') && hasStar(next, '陀罗');
    const aNext = hasStar(prev, '陀罗') && hasStar(next, '擎羊');
    if (!aPrev && !aNext) continue;

    patterns.push({
      name: 'Dương Đà giáp Kỵ',
      level: 'caution',
      description: 'Hóa Kỵ tọa Mệnh, hai bên Kình Dương Đà La giáp Mệnh, cổ thư nói “Dương Đà giáp Kỵ là bại cục”, chủ suốt đời lao lực bôn ba, gập ghềnh không thuận, thân tâm đều mệt. Cần lấy đức hạnh tu dưỡng và làm việc tích cực để hóa giải, mọi việc cẩn thận là trên hết.',
      palaces: ['命宫', prev.name, next.name],
      conditions: { required: ['Hóa Kỵ tọa Mệnh', 'Kình Dương Đà La phân cư trước sau hai cung của cung Mệnh'] },
      source: '«Tử Vi Đẩu Số Cốt Tủy Phú · Dương Đà Giáp Kỵ»',
    });
    return;
  }
}

/** 火铃夹命：火星铃星分居命宫前后 */
function detectHuoLingJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '火星') && hasStar(next, '铃星');
  const okB = hasStar(prev, '铃星') && hasStar(next, '火星');
  if (!okA && !okB) return;

  patterns.push({
    name: 'Hỏa Linh giáp Mệnh',
    level: 'caution',
    description: 'Hỏa Tinh Linh Tinh phân cư trước sau hai cung của cung Mệnh giáp Mệnh, chủ nóng tính, dễ bốc đồng, chuyện bất ngờ hoặc tranh chấp đột phát. Cần rèn tính kiên nhẫn, tránh quyết định bốc đồng.',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ['Hỏa Tinh Linh Tinh phân cư trước sau hai cung của cung Mệnh'] },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

/** 空劫夹命：地空地劫分居命宫前后 */
function detectKongJieJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '地空') && hasStar(next, '地劫');
  const okB = hasStar(prev, '地劫') && hasStar(next, '地空');
  if (!okA && !okB) return;

  patterns.push({
    name: 'Không Kiếp giáp Mệnh',
    level: 'caution',
    description: 'Địa Không Địa Kiếp giáp Mệnh, chủ tiền đến tiền đi, tư tưởng thoát tục, dễ ẩn vào tôn giáo triết học. Cổ thư nói “Không Kiếp giáp Mệnh, tài không tụ”. Hợp kỹ nghệ, tôn giáo, nghiên cứu — những nghề không nặng vật chất.',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ['Địa Không Địa Kiếp phân cư trước sau hai cung của cung Mệnh'] },
    source: '«Tử Vi Đẩu Số Toàn Thư»',
  });
}

/** 廉杀羊：廉贞、七杀、擎羊三星会照（流年大限最凶） */
function detectLianShaYang(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('廉贞') && sanFangSet.has('七杀') && sanFangSet.has('擎羊'))) return;

  patterns.push({
    name: 'Liêm Sát Dương',
    level: 'caution',
    description: 'Liêm Trinh, Thất Sát, Kình Dương ba sao hội chiếu tam phương cung Mệnh, luận thuật truyền thống đánh dấu là tổ hợp cần đặc biệt lưu tâm. Cách này khi được đại hạn lưu niên kích hoạt thì nhắc giữ thái độ thận trọng: an toàn lái xe, hòa khí với người, quyết định y tế cần lý trí — nhấn mạnh chủ động quản lý chứ không phải số mệnh tiêu cực.',
    palaces: ['命宫'],
    conditions: { required: ['Liêm Trinh, Thất Sát, Kình Dương ba sao hội chiếu tam phương tứ chính'] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Liêm Sát Dương»',
  });
}

/** 巨火羊：巨门、火星、擎羊会照 */
function detectJuHuoYang(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('巨门') && sanFangSet.has('火星') && sanFangSet.has('擎羊'))) return;

  patterns.push({
    name: 'Cự Hỏa Dương',
    level: 'caution',
    description: 'Cự Môn, Hỏa Tinh, Kình Dương ba sao hội chiếu, cổ thư truyền thống ghi cách này là tổ hợp cần cảnh giác (câu cổ “chung thân ải tử” là cách nói của thuyết số mệnh, nay đã không còn phù hợp). Hiểu theo hiện đại: tổ hợp này tượng trưng cho việc nói thẳng dễ gây xung đột, lúc cảm xúc dữ dội cần tự nhận thức. Hướng tu dưỡng là: luyện cách diễn đạt ôn hòa, chủ động hóa giải đối lập, rèn quản lý cảm xúc.',
    palaces: ['命宫'],
    conditions: { required: ['Cự Môn, Hỏa Tinh, Kình Dương ba sao hội chiếu tam phương tứ chính'] },
    source: '«Tử Vi Đẩu Số Cốt Tủy Phú · Cự Hỏa Dương»',
  });
}

/** 铃昌陀武：铃星、文昌、陀罗、武曲会照（限至投河） */
function detectLingChangTuoWu(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('铃星') && sanFangSet.has('文昌') && sanFangSet.has('陀罗') && sanFangSet.has('武曲'))) return;

  patterns.push({
    name: 'Linh Xương Đà Vũ',
    level: 'caution',
    description: 'Linh Tinh, Văn Xương, Đà La, Vũ Khúc bốn sao cùng hội, cổ thư truyền thống ghi đây là tổ hợp cần đặc biệt lưu tâm (câu cổ “hạn chí đầu hà” là cách nói của thuyết số mệnh, không phải cách hiểu hiện đại). Khuyến nghị hiện đại: tổ hợp này khi đại hạn lưu niên kích hoạt thì nhắc xử lý quyết định lớn một cách lý trí, chú ý biến động cảm xúc, giữ ổn định cuộc sống — nhấn mạnh chủ động quản lý chứ không chờ đợi tiêu cực.',
    palaces: ['命宫'],
    conditions: { required: ['Linh Tinh, Văn Xương, Đà La, Vũ Khúc bốn sao hội chiếu tam phương tứ chính'] },
    source: '«Tử Vi Đẩu Số Cốt Tủy Phú · Linh Xương Đà Vũ»',
  });
}

/** 马头带箭：擎羊在午宫坐命 */
function detectMaTouDaiJian(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (ming.branch !== 6) return;   // 必须午
  if (!hasStar(ming, '擎羊')) return;

  const required = ['Kình Dương tại cung Ngọ tọa Mệnh'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('七杀') || sanFangAllStars(chart).has('破军')) bonus.push('Lại hội Thất Sát hoặc Phá Quân (võ chức đại quý)');
  if (sanFangAllStars(chart).has('天魁') || sanFangAllStars(chart).has('天钺')) bonus.push('Khôi Việt gia chiếu');

  patterns.push({
    name: 'Mã Đầu Đái Tiễn',
    level: bonus.length ? 'good' : 'caution',
    description: 'Kình Dương tại cung Ngọ tọa Mệnh, gọi là “Mã Đầu Đái Tiễn”, cổ thư nói “uy chấn biên cương”. Cách này tượng trưng cho năng lực hành động quả quyết và tinh thần cạnh tranh, hợp những hướng nghề cần sức thực thi và quyết sách dũng cảm. Luận thuật truyền thống đồng thời nhắc cách này cần phối hợp sao cát lợi mới phát huy tối ưu — nhấn mạnh ảnh hưởng của tổ hợp chứ không luận riêng một sao.',
    palaces: ['命宫'],
    conditions: { required, bonus },
    source: '«Tử Vi Đẩu Số Cốt Tủy Phú · Mã Đầu Đái Tiễn»',
  });
}

// ────────────────── 基础格局（提升识别覆盖率）──────────────────
// 设计：让普通命盘也能识别出 1-3 个常见格局，而不是 30+ 严格古书格局都不匹配。
// 这些都是单一条件触发的轻量识别，level 多为 neutral / good。

/** 禄存守身：Lộc Tồn nhập cung Thân（或命宫与身宫同宫） */
function detectLuCunShouShen(chart: ZiweiChart, patterns: Pattern[]) {
  const luCunPalace = findStarPalace(chart, '禄存');
  if (!luCunPalace) return;
  const inMing = luCunPalace.branch === chart.mingGongBranch;
  const inShen = luCunPalace.branch === chart.shenGongBranch;
  if (!inMing && !inShen) return;
  patterns.push({
    name: inMing ? 'Lộc Tồn thủ Mệnh' : 'Lộc Tồn thủ Thân',
    level: 'good',
    description: inMing
      ? 'Lộc Tồn tọa Mệnh, chủ suốt đời áo cơm không lo, tài lộc ổn định. Tính cách bảo thủ, giỏi tích lũy, nhưng Dương Đà giáp Lộc phải đề phòng tiểu nhân. Hợp nhất phối Hóa Lộc, Tả Phù Hữu Bật mới thành đại cách.'
      : 'Lộc Tồn nhập cung Thân, chủ trung niên về sau tài nguyên ổn định, được lộc tự hưởng. Thầy Nghê nói “Lộc Tồn nhập Thân, tài khí cận thân” — vợ/chồng hoặc hướng sự nghiệp có thể mang lại tài lộc ổn định.',
    palaces: [inMing ? '命宫' : '身宫'],
    conditions: { required: [inMing ? 'Lộc Tồn nhập cung Mệnh' : 'Lộc Tồn nhập cung Thân'] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Sao Lộc Tồn»',
  });
}

/** 天马入命/迁：驿马星动 */
function detectTianMaRuMing(chart: ZiweiChart, patterns: Pattern[]) {
  const tianMaPalace = findStarPalace(chart, '天马');
  if (!tianMaPalace) return;
  const inMing = tianMaPalace.branch === chart.mingGongBranch;
  const inQian = tianMaPalace.branch === ((chart.mingGongBranch + 6) % 12);
  if (!inMing && !inQian) return;
  patterns.push({
    name: inMing ? 'Thiên Mã nhập Mệnh' : 'Thiên Mã tại Thiên Di',
    level: 'neutral',
    description: inMing
      ? 'Thiên Mã tọa Mệnh, chủ suốt đời bôn ba, động mà đắc tài, hợp đi thương mại lữ hành, công tác bên ngoài, phát triển đa lĩnh vực. Thầy Nghê nói “Thiên Mã nhập Mệnh, vô Lộc bất phát” — nếu lại hội Lộc Tồn hoặc Hóa Lộc tức là phú cách “Lộc Mã giao trì”.'
      : 'Thiên Mã tại cung Thiên Di, chủ ra ngoài có lợi, đi xa đắc tài, hợp phát triển nơi đất khách. Phối Hóa Lộc chủ sinh tài nơi đất lạ, phối sát tinh thì hành trình nhiều trắc trở.',
    palaces: [tianMaPalace.name],
    conditions: { required: [inMing ? 'Thiên Mã nhập cung Mệnh' : 'Thiên Mã nhập cung Thiên Di'] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Sao Thiên Mã»',
  });
}

/** 化禄入财：财帛宫主星化禄 */
function detectHuaLuRuCai(chart: ZiweiChart, patterns: Pattern[]) {
  const cai = chart.palaces.find(p => p.name === '财帛');
  if (!cai) return;
  const luStar = cai.stars.find(s => s.type === 'major' && s.siHua === '禄');
  if (!luStar) return;
  patterns.push({
    name: 'Hóa Lộc nhập Tài',
    level: 'good',
    description: `${VI_STAR[luStar.name] ?? luStar.name} Hóa Lộc nhập cung Tài Bạch, chủ tài nguyên hanh thông, thu nhập ổn định. Thầy Nghê nói Hóa Lộc là biểu tượng của “chính tài” — năng lực mà sao Hóa Lộc này đại diện (đặc chất cốt lõi của ${VI_STAR[luStar.name] ?? luStar.name}) chính là trục chính giúp bạn kiếm tiền. Phối Lộc Tồn hoặc Thiên Mã thì tài nguyên càng rộng.`,
    palaces: ['财帛'],
    conditions: { required: [`${VI_STAR[luStar.name] ?? luStar.name} Hóa Lộc nhập cung Tài Bạch`] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Luận Tứ Hóa»',
  });
}

/** 化权入官：官禄宫主星化权 */
function detectHuaQuanRuGuan(chart: ZiweiChart, patterns: Pattern[]) {
  const guan = chart.palaces.find(p => p.name === '官禄');
  if (!guan) return;
  const quanStar = guan.stars.find(s => s.type === 'major' && s.siHua === '权');
  if (!quanStar) return;
  patterns.push({
    name: 'Hóa Quyền nhập Quan',
    level: 'good',
    description: `${VI_STAR[quanStar.name] ?? quanStar.name} Hóa Quyền nhập cung Quan Lộc, chủ sự nghiệp có lực nắm giữ, có thể đảm đương vị trí độc lập. Hóa Quyền đại diện cho quyền lực và sức thực thi — ${VI_STAR[quanStar.name] ?? quanStar.name} Hóa Quyền cho thấy bạn trong sự nghiệp có thể thành người ra quyết định hoặc người thực thi nòng cốt, hợp đi quản lý hoặc tuyến uy tín kỹ thuật.`,
    palaces: ['官禄'],
    conditions: { required: [`${VI_STAR[quanStar.name] ?? quanStar.name} Hóa Quyền nhập cung Quan Lộc`] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Luận Tứ Hóa»',
  });
}

/** 化科入命/身：科名加身 */
function detectHuaKeRuMingShen(chart: ZiweiChart, patterns: Pattern[]) {
  const ming = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  const shen = chart.palaces.find(p => p.branch === chart.shenGongBranch);
  const target = [ming, shen].filter((p): p is Palace => Boolean(p));
  for (const p of target) {
    const keStar = p.stars.find(s => s.type === 'major' && s.siHua === '科');
    if (!keStar) continue;
    const isMing = p.branch === chart.mingGongBranch;
    patterns.push({
      name: isMing ? 'Hóa Khoa nhập Mệnh' : 'Hóa Khoa nhập Thân',
      level: 'good',
      description: `${VI_STAR[keStar.name] ?? keStar.name} Hóa Khoa nhập cung ${isMing ? 'Mệnh' : 'Thân'}, chủ danh tiếng, văn thư, vận học thuật. Thầy Nghê nói Hóa Khoa là “sao quý nhân” — ${VI_STAR[keStar.name] ?? keStar.name} Hóa Khoa mang đến đặc chất được người khác coi trọng, hợp làm văn thư, giáo dục, nghiên cứu, tư vấn, sáng tạo văn hóa — những hướng “lấy danh mà đắc lợi”.`,
      palaces: [isMing ? '命宫' : '身宫'],
      conditions: { required: [`${VI_STAR[keStar.name] ?? keStar.name} Hóa Khoa nhập cung ${isMing ? 'Mệnh' : 'Thân'}`] },
      source: '«Tử Vi Đẩu Số Toàn Thư · Luận Tứ Hóa»',
    });
    return; // 命和身重复时只识别一次
  }
}

/** 机月同梁三星会（3 星不全格，非四星真格）：天机/太阴/天同/天梁 任 3 星齐入三方四正 */
function detectJiYueTongLiangPartial(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['天机', '太阴', '天同', '天梁'].filter(s => sanFangSet.has(s));
  if (has.length !== 3) return; // 4 星齐由 detectJiYueTongLiang 处理
  // 避免和上面 detectJiYueTongLiang 重复（4 星齐的不进这里）
  const missing = ['天机', '太阴', '天同', '天梁'].filter(s => !sanFangSet.has(s));
  patterns.push({
    name: 'Cơ Nguyệt Đồng Lương tam tinh hội',
    level: 'neutral',
    description: `Cơ Nguyệt Đồng Lương cần Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương bốn sao cùng hội tam phương tứ chính mới là cách thật hoàn chỉnh; lá số này chỉ hội đủ 3 sao (${has.map(s => VI_STAR[s] ?? s).join(', ')}), thiếu ${missing.map(s => VI_STAR[s] ?? s).join(', ')} chưa hội, không phải cách thật hoàn chỉnh, lực giảm một bậc. Văn chất mưu lược, hợp công chức, giảng dạy nghiên cứu, y tế, dịch vụ — những ngành dựa vào tích lũy và ổn định; then chốt là xem sao khuyết và Tứ Hóa phối hợp ra sao.`,
    palaces: getSanFangPalaces(chart).filter(p => has.some(s => getMajorStarNames(p).includes(s))).map(p => p.name),
    conditions: { required: [`Tam phương tứ chính hội ${has.map(s => VI_STAR[s] ?? s).join(', ')} (Cơ Nguyệt Đồng Lương thiếu ${missing.map(s => VI_STAR[s] ?? s).join(', ')})`] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Cách Cơ Nguyệt Đồng Lương»',
  });
  void ming;
}

/** 昌曲同会：文昌+文曲都在命三方四正 */
function detectChangQuTongHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('文昌') || !sanFangSet.has('文曲')) return;
  const ming = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  if (!ming) return;
  const inMing = hasStar(ming, '文昌') && hasStar(ming, '文曲');
  patterns.push({
    name: inMing ? 'Xương Khúc tọa Mệnh' : 'Xương Khúc đồng hội',
    level: 'good',
    description: inMing
      ? 'Văn Xương Văn Khúc cùng nhập cung Mệnh, chủ thông minh tuấn tú, văn tài xuất chúng, hợp văn học, giáo dục, viết lách, tư vấn. Kỵ nhất Hóa Kỵ — Xương Khúc Hóa Kỵ chủ văn thư khế ước ngầm thua thiệt.'
      : 'Văn Xương Văn Khúc đồng hội tam phương tứ chính, chủ tài hoa dồi dào, khẩu tài văn bút đều giỏi. Hợp đi những ngành cần diễn đạt và văn tài, được Hóa Khoa nâng đỡ thì danh tiếng lớn.',
    palaces: ['命宫'],
    conditions: { required: ['Văn Xương, Văn Khúc đồng hội tam phương tứ chính cung Mệnh'] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Luận Văn Tinh»',
  });
}

/** 辅弼同会：左辅+右弼都在命三方四正 */
function detectFuBiTongHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('左辅') || !sanFangSet.has('右弼')) return;
  patterns.push({
    name: 'Phụ Bật đồng hội',
    level: 'good',
    description: 'Tả Phù Hữu Bật đồng hội tam phương tứ chính cung Mệnh, chủ suốt đời quý nhân không dứt, nhân duyên cực tốt. Hợp nhất vị trí lãnh đạo và công việc hợp tác theo nhóm. Thầy Nghê nói “Phụ Bật giáp Mệnh, bình sinh quý nhân đa” — bạn không phải mệnh đơn đả độc đấu, cần khéo dùng mạng lưới nhân tế.',
    palaces: ['命宫'],
    conditions: { required: ['Tả Phù, Hữu Bật đồng hội tam phương tứ chính cung Mệnh'] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Luận Phụ Bật»',
  });
}

/** 魁钺同会：天魁+天钺都在命三方四正 */
function detectKuiYueTongHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('天魁') || !sanFangSet.has('天钺')) return;
  patterns.push({
    name: 'Khôi Việt đồng hội',
    level: 'good',
    description: 'Thiên Khôi Thiên Việt đồng hội tam phương tứ chính cung Mệnh, chủ được “Thiên Ất quý nhân” gia trì, thời khắc quan trọng luôn có quý nhân nâng đỡ. Thầy Nghê nói “Khôi Việt giáp Mệnh, tất vi quý nhân” — khi gặp khó khăn bên cạnh sẽ xuất hiện người giúp đắc lực, nên chủ động giữ gìn nhân mạch.',
    palaces: ['命宫'],
    conditions: { required: ['Thiên Khôi, Thiên Việt đồng hội tam phương tứ chính cung Mệnh'] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Luận Khôi Việt»',
  });
}

/** 科权双会：化科 + 化权 同会三方四正 */
function detectKeQuanShuangHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sfPalaces = getSanFangPalaces(chart);
  let hasKe = false, hasQuan = false;
  for (const p of sfPalaces) {
    for (const s of p.stars) {
      if (s.type === 'major' && s.siHua === '科') hasKe = true;
      if (s.type === 'major' && s.siHua === '权') hasQuan = true;
    }
  }
  if (!hasKe || !hasQuan) return;
  patterns.push({
    name: 'Khoa Quyền song hội',
    level: 'good',
    description: 'Hóa Khoa + Hóa Quyền đồng hội tam phương tứ chính, chủ danh quyền song mỹ — vừa có học thức/danh tiếng (Khoa), vừa có lực nắm giữ (Quyền), hợp đi tuyến “chuyên gia uy tín” (như bác sĩ, luật sư, giáo sư, cán bộ kỹ thuật nòng cốt), danh lợi song thu mà căn cơ vững chắc.',
    palaces: ['命宫'],
    conditions: { required: ['Hóa Khoa, Hóa Quyền đồng hội tam phương tứ chính cung Mệnh'] },
    source: '«Tử Vi Đẩu Số Toàn Thư · Tứ Hóa Hội Chiếu»',
  });
}

// ────────────────── 《全书》四张格表 · 严格判定接入 ──────────────────
//
// 卷一〈定贵局〉27 /〈定富局〉6 /〈定贫贱局〉8 共 41 条命盘可判格
// （〈定杂局〉8 条为大限格，另行架构，未收录）。严格实现见
// patterns-dinggui/dingfu/dingpin.ts：照原文判，不放宽；安星无解的
// 条目在源表标 unreachable，不参与判定。识别器分工：
//  - 本文件原有 41 个识别器：宽松判据，带加分项/破格警示的 UI 文案；
//  - 严格版：description 即原书注文，source 带原书条目序号，可溯源。
// 同名时严格版取代宽松版（君臣庆会/府相朝垣/日月夹命/明珠出海 4 条），
// 宽松版的 bonus/breaking 原样保留——严格条件是宽松条件的子集，
// 宽松版能触发时其加分判定依然有效。
// 马头带剑不参与取代：严格版已证 unreachable（注文「不是居午格」否定了
// 项目所采读法，见 patterns-dinggui.ts 第 10 条），不会产生命中；
// 宽松版「马头带箭」按原样保留，其判据质量已在核查报告中标 wrong。

interface QuanshuHit {
  no: number;
  name: string;
  note: string;
  status: string;
}

// Tên quyển (卷一) của «Toàn Thư» dịch sang tiếng Việt (chỉ hiển thị).
const TABLE_VI: Record<string, string> = {
  定贵局: 'Định Quý cục',
  定富局: 'Định Phú cục',
  定贫贱局: 'Định Bần Tiện cục',
};

function detectQuanshuStrict(chart: ZiweiChart): Pattern[] {
  const out: Pattern[] = [];
  const push = (hits: QuanshuHit[], table: string, level: Pattern['level']) => {
    for (const h of hits) {
      const tag = h.status === 'disputed' ? ' [Cách còn nghi vấn: chú văn mơ hồ, xét theo cách đọc thông hành nhất]' : '';
      out.push({
        name: h.name,
        level,
        description: `Nguyên thư điều ${h.no}: “${h.note}”${tag}`,
        palaces: ['命宫'],
        conditions: { required: [`«Toàn Thư» ${TABLE_VI[table] ?? table} điều ${h.no}: ${h.note}`] },
        source: `«Tử Vi Đẩu Số Toàn Thư · Quyển một · ${TABLE_VI[table] ?? table}» điều ${h.no}`,
      });
    }
  };
  push(detectDingGui(chart), '定贵局', 'excellent');
  push(detectDingFu(chart), '定富局', 'good');
  push(detectDingPin(chart), '定贫贱局', 'caution');
  return out;
}

// ────────────────── 主入口 ──────────────────
export function detectPatterns(chart: ZiweiChart): Pattern[] {
  const patterns: Pattern[] = [];
  const ming = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  if (!ming) return patterns;

  // 上格
  detectJunChenQingHui(chart, ming, patterns);
  detectZiFu(chart, ming, patterns);
  detectFuXiangChaoYuan(chart, ming, patterns);
  detectYangLiangChangLu(chart, ming, patterns);
  detectHuoTanLingTan(chart, ming, patterns);
  detectWuTan(chart, ming, patterns);
  detectShaPoLang(chart, ming, patterns);
  detectJiYueTongLiang(chart, ming, patterns);

  // 中格
  detectLianXiang(chart, patterns);
  detectWuQiSha(chart, patterns);
  detectTongLiang(chart, patterns);
  detectRiYueTongGong(chart, patterns);
  detectRiYueJiaMing(chart, patterns);
  detectJuRiTongGong(chart, patterns);
  detectShiZhongYinYu(chart, ming, patterns);
  detectMingZhuChuHai(chart, ming, patterns);
  detectZiWeiInMing(chart, ming, patterns);

  // 助力格
  detectFuBiJiaMing(chart, patterns);
  detectChangQuJiaMing(chart, patterns);
  detectKuiYueJiaMing(chart, patterns);
  detectShuangLuChaoYuan(chart, ming, patterns);
  detectSanQiJiaHui(chart, patterns);
  detectHuaLuRuMing(chart, ming, patterns);

  // 恶格
  detectHuaJiRuMingQian(chart, patterns);
  detectYangTuoJiaJi(chart, patterns);
  detectHuoLingJiaMing(chart, patterns);
  detectKongJieJiaMing(chart, patterns);
  detectLianShaYang(chart, patterns);
  detectJuHuoYang(chart, patterns);
  detectLingChangTuoWu(chart, patterns);
  detectMaTouDaiJian(chart, ming, patterns);

  // 基础格局（提升识别覆盖率，让普通命盘也能识别 1-3 个）
  detectLuCunShouShen(chart, patterns);
  detectTianMaRuMing(chart, patterns);
  detectHuaLuRuCai(chart, patterns);
  detectHuaQuanRuGuan(chart, patterns);
  detectHuaKeRuMingShen(chart, patterns);
  detectJiYueTongLiangPartial(chart, ming, patterns);
  detectChangQuTongHui(chart, patterns);
  detectFuBiTongHui(chart, patterns);
  detectKuiYueTongHui(chart, patterns);
  detectKeQuanShuangHui(chart, patterns);

  // 《全书》四张格表严格判定接入（同名严格版取代宽松版，见上方注释）
  const strict = detectQuanshuStrict(chart);
  const looseByName = new Map(patterns.map(p => [p.name, p]));
  const out = patterns.slice();
  for (const s of strict) {
    const loose = looseByName.get(s.name);
    if (loose) {
      const idx = out.indexOf(loose);
      out[idx] = {
        ...s,
        conditions: {
          required: s.conditions!.required,
          bonus: loose.conditions?.bonus,
          breaking: loose.conditions?.breaking,
        },
      };
    } else {
      out.push(s);
    }
  }
  return out;
}

// ────────────────── 命宫摘要（保持向后兼容）──────────────────
// 实现已 chuyển sang ./ming-summary.ts（client-safe，不 import 'server-only'）
// để RuleSummary dùng được ở phía client；这里只 re-export，
// ChartSummary/PatternsCard 不用改 import。
export { getMingGongSummary } from './ming-summary';
