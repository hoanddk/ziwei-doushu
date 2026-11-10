import type { BirthFormState } from '@/components/BirthForm';
import type { BirthInfo } from './types';
import {
  calculateTrueSolarTime,
  formatTrueSolarClock,
  resolveZiweiDayOffset,
  shiftGregorianDate,
} from './true-solar-time';
import { PROVINCES } from './cities';

function isValidLongitude(longitude: number): boolean {
  return longitude >= -180 && longitude <= 180;
}

/**
 * 钟表时间所在时区的标准偏移（分钟）：按出生省份查表。
 * 越南 = 420（UTC+7，中央经线 105°）；其余默认 480（UTC+8，中央经线 120°）。
 * （2026-11-10 对照 ZolaChat 改：越南此前走 480 + 用户手工 +1 小时，
 * 现在直接按 UTC+7 输入，见 lib/ziwei/cities.ts 的越南条目注释。）
 */
export function getUtcOffsetMinutes(province?: string): number {
  if (!province) return 480;
  const found = PROVINCES.find(p => p.name === province);
  return found?.utcOffsetMinutes ?? 480;
}

/** 中央经线（度）= 时区偏移 / 4：420 → 105°，480 → 120°。 */
export function centralMeridian(utcOffsetMinutes: number): number {
  return utcOffsetMinutes / 4;
}

export interface TrueSolarDescription {
  branch: number;
  /** 真太阳时 HH:MM（已含经度修正 + 均时差） */
  clock: string;
  longitudeCorrectionMinutes: number;
  equationOfTimeMinutes: number;
  totalCorrectionMinutes: number;
  /** 晚子时换日后的日期偏移（-1 / 0 / +1），与 resolveZiweiDayOffset 同口径。 */
  dayOffset: number;
  normalizedMinutes: number;
  utcOffsetMinutes: number;
}

/**
 * 真太阳时唯一完整实现（经度修正 + NOAA 均时差 + 晚子时换日）。
 * BirthForm 的实时预览与 formToBirthInfo 都走这里，不得在组件里另写一份
 * （见 scripts/regression/birthform-birthinfo-consistency.test.ts）。
 */
export function describeTrueSolar(
  year: number,
  month: number,
  day: number,
  clockHour: number,
  clockMinute: number,
  longitude: number,
  utcOffsetMinutes = 480,
): TrueSolarDescription {
  const solar = calculateTrueSolarTime({
    year, month, day, clockHour, clockMinute, longitude, utcOffsetMinutes,
  });
  const dayOffset = resolveZiweiDayOffset({
    dayOffset: solar.dayOffset,
    normalizedMinutes: solar.normalizedMinutes,
    branch: solar.branch,
  });
  return {
    branch: solar.branch,
    clock: formatTrueSolarClock(solar),
    longitudeCorrectionMinutes: solar.longitudeCorrectionMinutes,
    equationOfTimeMinutes: solar.equationOfTimeMinutes,
    totalCorrectionMinutes: solar.totalCorrectionMinutes,
    dayOffset,
    normalizedMinutes: solar.normalizedMinutes,
    utcOffsetMinutes,
  };
}

/** 有日期的真太阳时时辰支（含均时差）；日期不合法时退化为经度修正。 */
export function calcTrueSolarBranchAtDate(
  year: number,
  month: number,
  day: number,
  clockHour: number,
  clockMinute: number,
  longitude: number,
  utcOffsetMinutes = 480,
): number {
  return describeTrueSolar(year, month, day, clockHour, clockMinute, longitude, utcOffsetMinutes).branch;
}

/**
 * 旧版：仅经度修正、中央经线固定 120°、不含均时差。
 * 保留只为向后兼容（老测试与老调用）；新代码一律用 describeTrueSolar /
 * calcTrueSolarBranchAtDate。注意：它与 formToBirthInfo 的结果在均时差
 * ±16 分钟内可能差一个时辰（落在交界附近时）。
 */
export function calcTrueSolarBranch(clockHour: number, clockMinute: number, longitude: number): number {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (longitude - 120) * 4;
  const solar = ((clockMins + offset) % 1440 + 1440) % 1440;
  if (solar >= 1380 || solar < 60) return 0;
  return Math.floor((solar - 60) / 120) + 1;
}

/** BirthFormState → BirthInfo
 *
 * 子时规则（倪海厦体系/三合派标准）：
 * · 23:00-23:59 = 晚子时，**按次日**排盘（日期 +1）
 * · 00:00-00:59 = 早子时，按本日排盘
 * 这与「时辰支同为子(0)」并不冲突——子时分早晚两段，需要在日期上区分。
 *
 * 真太阳时口径：钟表时间 + 经度修正 + 均时差（NOAA 近似式），中央经线
 * 按出生地时区取（越南 105°/UTC+7，中国 120°/UTC+8）。晚子时换日按
 * 真太阳时判定，与时辰支同一口径（见 true-solar-time.ts）。
 * 只看钟表 23 点会和经度校正后的时辰错位：东经 100° 钟表 23:30 是真太阳时 22:10 亥时，不该换日。
 */
export function formToBirthInfo(form: BirthFormState): BirthInfo {
  let y = parseInt(form.year) || 0;
  let m = parseInt(form.month) || 0;
  let d = parseInt(form.day) || 0;
  let hour = 0;
  const utcOffsetMinutes = form.utcOffsetMinutes ?? getUtcOffsetMinutes(form.province);
  let trueSolarClock: string | undefined;
  let trueSolarCorrectionMinutes: number | undefined;

  if (!form.unknownTime) {
    const desc = describeTrueSolar(
      y, m, d,
      parseInt(form.clockHour) || 0,
      parseInt(form.clockMinute) || 0,
      form.longitude,
      utcOffsetMinutes,
    );
    hour = desc.branch;
    trueSolarClock = desc.clock;
    trueSolarCorrectionMinutes = Math.round(desc.totalCorrectionMinutes);
    if (desc.dayOffset !== 0 && y > 0 && m > 0 && d > 0) {
      ({ year: y, month: m, day: d } = shiftGregorianDate({ year: y, month: m, day: d }, desc.dayOffset));
    }
  }

  return {
    year: y, month: m, day: d,
    hour,
    gender: form.gender,
    name: form.name || undefined,
    province: form.province || undefined,
    city: form.city || undefined,
    longitude: form.province ? form.longitude : undefined,
    utcOffsetMinutes,
    trueSolarClock,
    trueSolarCorrectionMinutes,
  };
}

/** BirthFormState → URLSearchParams（用于分享链接） */
export function formToSearchParams(form: BirthFormState): URLSearchParams {
  const p = new URLSearchParams();
  if (form.name) p.set('n', form.name);
  p.set('y', form.year);
  p.set('m', form.month);
  p.set('d', form.day);
  if (form.unknownTime) {
    p.set('u', '1');
  } else {
    p.set('h', form.clockHour);
    p.set('mi', form.clockMinute);
  }
  if (form.province) p.set('p', form.province);
  if (form.city) p.set('c', form.city);
  if (form.longitude !== 120 && isValidLongitude(form.longitude)) p.set('lo', String(form.longitude));
  const utcOffsetMinutes = form.utcOffsetMinutes ?? getUtcOffsetMinutes(form.province);
  if (utcOffsetMinutes !== 480) p.set('tz', String(utcOffsetMinutes));
  p.set('g', form.gender === 'male' ? 'm' : 'f');
  return p;
}

/** URLSearchParams → Partial<BirthFormState>，不完整时返回 null */
export function searchParamsToForm(params: URLSearchParams): Partial<BirthFormState> | null {
  const year = params.get('y');
  const month = params.get('m');
  const day = params.get('d');
  if (!year || !month || !day) return null;
  const rawLongitude = params.get('lo')?.trim();
  const longitude = rawLongitude ? Number(rawLongitude) : 120;
  const rawTz = params.get('tz')?.trim();
  const tz = rawTz ? Number(rawTz) : NaN;
  const province = params.get('p') || '';
  return {
    name: params.get('n') || '',
    year,
    month,
    day,
    unknownTime: params.get('u') === '1',
    clockHour: params.get('h') || '8',
    clockMinute: params.get('mi') || '0',
    province,
    city: params.get('c') || '',
    longitude: isValidLongitude(longitude) ? longitude : 120,
    // 有 tz 参数时以它为准；没有时由 formToBirthInfo 按省份查表
    // （越南 420）。注意：2026-11-10 之前的越南分享链接没有 tz，
    // 其钟表时间是北京时间，会被按越南时间重解释——见 cities.ts 注释。
    utcOffsetMinutes: Number.isFinite(tz) && tz >= -720 && tz <= 840 ? tz : undefined,
    gender: params.get('g') === 'f' ? 'female' : 'male',
  };
}
