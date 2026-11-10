/**
 * Giờ Việt Nam chuẩn 105°E (UTC+7) — đối chiếu ZolaChat, 10/11/2026.
 *
 * Trước đổi này, người sinh ở Việt Nam phải tự cộng 1 giờ sang giờ Bắc Kinh
 * (UTC+8) rồi mới nhập, với trung tuyến 120°. Giờ hai cách phải cho cùng
 * một giờ mặt trời thật (cùng kinh độ, cùng ngày):
 *   Hà Nội 07:30 VN (105.85°Đ, UTC+7)  ==  08:30 Bắc Kinh (UTC+8)
 *   → cùng ra giờ chân thái dương 07:34, giờ Thìn (chi 4).
 * Và phương trình thời gian (均时差, NOAA) phải được tính: 11/02/2000
 * 07:00 tại kinh độ 105°Đ là 06:45 giờ mặt trời thật → giờ Mão (chi 3),
 * không phải giờ Thìn như khi bỏ均时差.
 */
import assert from 'node:assert/strict';
import {
  describeTrueSolar,
  formToBirthInfo,
  formToSearchParams,
  getUtcOffsetMinutes,
  searchParamsToForm,
} from '../../lib/ziwei/share';
import { PROVINCES } from '../../lib/ziwei/cities';
import type { BirthFormState } from '../../components/BirthForm';

// ── 1) Tra múi giờ theo tỉnh ──────────────────────────────────────────
assert.equal(getUtcOffsetMinutes('Việt Nam'), 420, 'Việt Nam = UTC+7 (420 phút)');
assert.equal(getUtcOffsetMinutes('北京市'), 480, 'Trung Quốc = UTC+8 (480 phút)');
assert.equal(getUtcOffsetMinutes(undefined), 480, 'Không rõ tỉnh = mặc định UTC+8');
assert.equal(getUtcOffsetMinutes(''), 480, 'Tỉnh rỗng = mặc định UTC+8');

// ── 2) Hai cách nhập cho cùng một giờ mặt trời thật ───────────────────
const vn = describeTrueSolar(1977, 9, 5, 7, 30, 105.85, 420);
const bj = describeTrueSolar(1977, 9, 5, 8, 30, 105.85, 480);
assert.equal(vn.branch, 4, 'Hà Nội 07:30 VN phải ra giờ Thìn (chi 4)');
assert.equal(bj.branch, vn.branch, 'Cách nhập Bắc Kinh cũ phải ra cùng chi');
assert.equal(vn.clock, '07:34', 'Giờ chân thái dương Hà Nội 07:30 VN là 07:34');
assert.equal(bj.clock, vn.clock, 'Hai cách phải cho cùng giờ chân thái dương');
assert.ok(Math.abs(vn.longitudeCorrectionMinutes - 3.4) < 0.01, 'Lệch kinh độ Hà Nội so với 105° là +3,4 phút');
assert.ok(Math.abs(bj.longitudeCorrectionMinutes + 56.6) < 0.01, 'Lệch kinh độ Hà Nội so với 120° là −56,6 phút');

// ── 3) Phương trình thời gian đổi chi ở sát ranh giới ─────────────────
const eot = describeTrueSolar(2000, 2, 11, 7, 0, 105, 420);
assert.equal(eot.clock, '06:45', '11/02/2000 07:00 tại 105°Đ là 06:45 giờ mặt trời thật');
assert.equal(eot.branch, 3, '06:45 là giờ Mão (chi 3), không phải giờ Thìn');
assert.ok(eot.equationOfTimeMinutes < -14 && eot.equationOfTimeMinutes > -14.5, '均时差 ngày 11/02/2000 khoảng −14,2 phút');

// ── 4) formToBirthInfo với form Việt Nam ──────────────────────────────
function vnForm(overrides: Partial<BirthFormState> = {}): BirthFormState {
  return {
    name: '',
    year: '1977',
    month: '9',
    day: '5',
    clockHour: '7',
    clockMinute: '30',
    unknownTime: false,
    province: 'Việt Nam',
    city: 'Hà Nội',
    longitude: 105.85,
    gender: 'male',
    ...overrides,
  };
}

const info = formToBirthInfo(vnForm());
assert.deepEqual(
  { year: info.year, month: info.month, day: info.day, hour: info.hour },
  { year: 1977, month: 9, day: 5, hour: 4 },
  'Form Việt Nam 05/09/1977 07:30 → 05/09/1977 giờ Thìn',
);
assert.equal(info.utcOffsetMinutes, 420, 'BirthInfo ghi lại UTC+7');
assert.equal(info.trueSolarClock, '07:34', 'BirthInfo ghi lại giờ chân thái dương');

const infoOldWay = formToBirthInfo(vnForm({ province: '', city: '', clockHour: '8' }));
assert.equal(infoOldWay.hour, info.hour, 'Cách nhập Bắc Kinh cũ cho cùng lá số');
assert.equal(infoOldWay.trueSolarClock, info.trueSolarClock, 'Cách nhập cũ cho cùng giờ chân thái dương');

// ── 5) Link chia sẻ ghi rõ múi giờ và đi về được ─────────────────────
const params = formToSearchParams(vnForm());
assert.equal(params.get('tz'), '420', 'Link Việt Nam phải ghi tz=420');
assert.equal(params.get('lo'), '105.85', 'Link giữ kinh độ');
const back = searchParamsToForm(params);
assert.equal(back?.utcOffsetMinutes, 420, 'Mở lại link phải khôi phục UTC+7');
assert.equal(back?.province, 'Việt Nam', 'Mở lại link phải khôi phục tỉnh');
const infoRoundTrip = formToBirthInfo({ ...vnForm(), ...back });
assert.equal(infoRoundTrip.hour, info.hour, 'Đi-về link chia sẻ không đổi giờ sinh');

// Link Trung Quốc không ghi tz (mặc định 480).
const cnParams = formToSearchParams(vnForm({ province: '北京市', city: '北京', longitude: 116.4 }));
assert.equal(cnParams.has('tz'), false, 'Link Trung Quốc không cần ghi tz');

// ── 6) Danh sách 34 thủ phủ Việt Nam ──────────────────────────────────
const vnEntry = PROVINCES.find(p => p.name === 'Việt Nam');
assert.ok(vnEntry, 'Phải có mục Việt Nam');
assert.equal(vnEntry.utcOffsetMinutes, 420, 'Mục Việt Nam ghi UTC+7');
assert.equal(vnEntry.cities.length, 35, 'Việt Nam: Toàn quốc + 34 thủ phủ');
assert.deepEqual(
  vnEntry.cities[0],
  { name: 'Toàn quốc', longitude: 105 },
  'Mục đầu là Toàn quốc 105°Đ (chuẩn UTC+7)',
);
for (const c of vnEntry.cities) {
  assert.ok(c.longitude >= 102 && c.longitude <= 110, `Kinh độ ${c.name} (${c.longitude}) phải nằm trong khoảng Việt Nam`);
}
const byName = new Map(vnEntry.cities.map(c => [c.name, c.longitude]));
// 5 thủ phủ đặt ở thành phố của tỉnh bị sáp nhập (QĐ 759/QĐ-TTg) + 2 số đã đính chính.
assert.equal(byName.get('Yên Bái'), 104.87, 'Yên Bái (thủ phủ tỉnh Lào Cai) 104.87°Đ — Wikipedia 104°52′E');
assert.equal(byName.get('Bắc Giang'), 106.19, 'Bắc Giang (thủ phủ tỉnh Bắc Ninh) 106.19°Đ');
assert.equal(byName.get('Đồng Hới'), 106.6, 'Đồng Hới (thủ phủ tỉnh Quảng Trị) 106.60°Đ');
assert.equal(byName.get('Tân An'), 106.41, 'Tân An (thủ phủ tỉnh Tây Ninh) 106.41°Đ');
assert.equal(byName.get('Mỹ Tho'), 106.36, 'Mỹ Tho (thủ phủ tỉnh Đồng Tháp) 106.36°Đ');
assert.equal(byName.get('Lai Châu'), 103.44, 'Lai Châu 103.44°Đ — Wikipedia 103°26′21″E');

console.log('Vietnam true-solar (105°E / UTC+7) regression passed');
