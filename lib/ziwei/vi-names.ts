// Tên hiển thị tiếng Việt cho các danh xưng Tử Vi Đẩu Số.
//
// Bản fork Việt hoá dùng cá nhân: repo gốc chưa có hệ i18n, chuỗi giao diện
// viết cứng bằng tiếng Trung trong component/page. File này chỉ là BẢNG TRA
// TÊN HIỂN THỊ — key (tên gốc tiếng Trung) không đổi, logic và thuật toán
// không đổi; component chỉ tra bảng này khi render ra màn hình. Tên nào
// chưa có trong bảng sẽ hiển thị nguyên tên gốc, không vỡ giao diện.
//
// Quy ước đặt tên: theo cách gọi quen dùng trong Tử Vi Việt Nam
// (Hán–Việt): sao Tử Vi, cung Mệnh, Tứ Hóa (Hóa Lộc/Quyền/Khoa/Kỵ),
// can Giáp, chi Tý, giờ Tý, cục Thủy nhị cục...

/** 12 cung — tên đầy đủ */
export const VI_PALACE: Record<string, string> = {
  '命宫': 'Mệnh',
  '兄弟宫': 'Huynh Đệ',
  '夫妻宫': 'Phu Thê',
  '子女宫': 'Tử Tức',
  '财帛宫': 'Tài Bạch',
  '疾厄宫': 'Tật Ách',
  '迁移宫': 'Thiên Di',
  '交友宫': 'Nô Bộc',
  '官禄宫': 'Quan Lộc',
  '田宅宫': 'Điền Trạch',
  '福德宫': 'Phúc Đức',
  '父母宫': 'Phụ Mẫu',
  // Dạng rút gọn không chữ "cung" (dùng trong TOPIC_PALACE_NAME của db-analysis.ts:
  // iztro gọi cung Nô Bộc là "仆役", các cung khác bỏ chữ "cung")
  '兄弟': 'Huynh Đệ',
  '夫妻': 'Phu Thê',
  '子女': 'Tử Tức',
  '财帛': 'Tài Bạch',
  '疾厄': 'Tật Ách',
  '迁移': 'Thiên Di',
  '仆役': 'Nô Bộc',
  '官禄': 'Quan Lộc',
  '田宅': 'Điền Trạch',
  '福德': 'Phúc Đức',
  '父母': 'Phụ Mẫu',
};

/** 12 cung — tên rút gọn (không chữ "cung"), dùng ở các thẻ tóm tắt */
export const VI_PALACE_SHORT: Record<string, string> = {
  '命宫': 'Mệnh',
  '兄弟宫': 'Huynh Đệ',
  '夫妻宫': 'Phu Thê',
  '子女宫': 'Tử Tức',
  '财帛宫': 'Tài Bạch',
  '疾厄宫': 'Tật Ách',
  '迁移宫': 'Thiên Di',
  '交友宫': 'Nô Bộc',
  '官禄宫': 'Quan Lộc',
  '田宅宫': 'Điền Trạch',
  '福德宫': 'Phúc Đức',
  '父母宫': 'Phụ Mẫu',
};

/** 14 sao chính */
export const VI_STAR: Record<string, string> = {
  // Chủ tinh
  '紫微': 'Tử Vi',
  '天机': 'Thiên Cơ',
  '太阳': 'Thái Dương',
  '武曲': 'Vũ Khúc',
  '天同': 'Thiên Đồng',
  '廉贞': 'Liêm Trinh',
  '天府': 'Thiên Phủ',
  '太阴': 'Thái Âm',
  '贪狼': 'Tham Lang',
  '巨门': 'Cự Môn',
  '天相': 'Thiên Tướng',
  '天梁': 'Thiên Lương',
  '七杀': 'Thất Sát',
  '破军': 'Phá Quân',
  // Phụ tinh, cát tinh
  '左辅': 'Tả Phù',
  '右弼': 'Hữu Bật',
  '文昌': 'Văn Xương',
  '文曲': 'Văn Khúc',
  '禄存': 'Lộc Tồn',
  '天马': 'Thiên Mã',
  '天魁': 'Thiên Khôi',
  '天钺': 'Thiên Việt',
  '天喜': 'Thiên Hỉ',
  '红鸾': 'Hồng Loan',
  '天姚': 'Thiên Diêu',
  '天寿': 'Thiên Thọ',
  '天才': 'Thiên Tài',
  '龙池': 'Long Trì',
  '凤阁': 'Phụng Các',
  '天德': 'Thiên Đức',
  '月德': 'Nguyệt Đức',
  '解神': 'Giải Thần',
  // Sát tinh, tạp diệu
  '擎羊': 'Kình Dương',
  '陀罗': 'Đà La',
  '火星': 'Hỏa Tinh',
  '铃星': 'Linh Tinh',
  '地空': 'Địa Không',
  '地劫': 'Địa Kiếp',
  '天空': 'Thiên Không',
  '天刑': 'Thiên Hình',
  '天哭': 'Thiên Khốc',
  '天虚': 'Thiên Hư',
  '天伤': 'Thiên Thương',
  '天使': 'Thiên Sứ',
  '孤辰': 'Cô Thần',
  '寡宿': 'Quả Tú',
  '截空': 'Tiệt Không',
  '旬空': 'Tuần Không',
  '大耗': 'Đại Hao',
  '天月': 'Thiên Nguyệt',
  '阴煞': 'Âm Sát',
  '天伤星': 'Thiên Thương',
};

/** Tứ Hóa — dạng đầy đủ (Hóa Lộc...) */
export const VI_SIHUA_FULL: Record<string, string> = {
  '化禄': 'Hóa Lộc',
  '化权': 'Hóa Quyền',
  '化科': 'Hóa Khoa',
  '化忌': 'Hóa Kỵ',
};

/** Tứ Hóa — dạng một chữ (dùng trong huy hiệu) */
export const VI_SIHUA: Record<string, string> = {
  '禄': 'Lộc',
  '权': 'Quyền',
  '科': 'Khoa',
  '忌': 'Kỵ',
};

/** 10 thiên can */
export const VI_STEM: Record<string, string> = {
  '甲': 'Giáp',
  '乙': 'Ất',
  '丙': 'Bính',
  '丁': 'Đinh',
  '戊': 'Mậu',
  '己': 'Kỷ',
  '庚': 'Canh',
  '辛': 'Tân',
  '壬': 'Nhâm',
  '癸': 'Quý',
};

/** 12 địa chi */
export const VI_BRANCH: Record<string, string> = {
  '子': 'Tý',
  '丑': 'Sửu',
  '寅': 'Dần',
  '卯': 'Mão',
  '辰': 'Thìn',
  '巳': 'Tỵ',
  '午': 'Ngọ',
  '未': 'Mùi',
  '申': 'Thân',
  '酉': 'Dậu',
  '戌': 'Tuất',
  '亥': 'Hợi',
};

/** 12 giờ (địa chi) — dùng cho form nhập giờ sinh */
export const VI_SHICHEN: string[] = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
];

/** Ngũ hành cục */
export const VI_JU: Record<string, string> = {
  '水二局': 'Thủy nhị cục',
  '木三局': 'Mộc tam cục',
  '金四局': 'Kim tứ cục',
  '土五局': 'Thổ ngũ cục',
  '火六局': 'Hỏa lục cục',
};

/** Độ sáng sao (7 bậc + 2 bậc phụ) */
export const VI_BRIGHTNESS: Record<string, string> = {
  '庙': 'Miếu',
  '旺': 'Vượng',
  '得': 'Đắc',
  '利': 'Lợi',
  '平': 'Bình',
  '不': 'Bất',
  '闲': 'Nhàn',
  '陷': 'Hãm',
  '地': 'Địa',
};

/** Từ khoá tính cách (tóm tắt cung Mệnh) */
export const VI_KEYWORD: Record<string, string> = {
  '尊贵': 'Cao quý', '独立': 'Độc lập', '领导': 'Lãnh đạo',
  '智慧': 'Trí tuệ', '机变': 'Cơ biến', '善谋': 'Giỏi mưu tính',
  '阳刚': 'Dương cương', '官贵': 'Quan quý', '慷慨': 'Hào phóng',
  '财富': 'Tài phú', '刚毅': 'Cương nghị', '果断': 'Quả quyết',
  '温和': 'Ôn hòa', '享福': 'Hưởng phúc', '随缘': 'Tùy duyên',
  '才艺': 'Tài nghệ', '桃花': 'Đào hoa', '多变': 'Đa biến',
  '财库': 'Kho tài', '稳重': 'Vững vàng', '保守': 'Thận trọng',
  '柔美': 'Dịu dàng', '细腻': 'Tinh tế',
  '欲望': 'Dục vọng', '多才': 'Đa tài',
  '善辩': 'Giỏi biện luận', '多思': 'Đa tư', '口才': 'Khẩu tài',
  '辅佐': 'Phò tá', '行政': 'Hành chính', '稳健': 'Ổn định',
  '荫护': 'Che chở', '医药': 'Y dược', '长辈': 'Bậc trên',
  '将星': 'Sao tướng', '果决': 'Quả quyết', '孤克': 'Cô khắc',
  '开创': 'Khai sáng', '变动': 'Biến động', '破旧': 'Phá cũ',
};

/** Bản chất sao chính (tóm tắt cung Mệnh) */
export const VI_NATURE: Record<string, string> = {
  '帝王星': 'Sao đế vương', '智慧星': 'Sao trí tuệ', '贵人星': 'Sao quý nhân',
  '财帛星': 'Sao tài bạch', '福德星': 'Sao phúc đức', '桃花星': 'Sao đào hoa',
  '财库星': 'Sao kho tài', '财富星': 'Sao tài phú', '是非星': 'Sao thị phi',
  '印绶星': 'Sao ấn thụ', '荫庇星': 'Sao che chở', '将帅星': 'Sao tướng soái',
  '变动星': 'Sao biến động', '空宫': 'Cung trống',
};

/** Ngũ hành */
export const VI_ELEMENT: Record<string, string> = {
  '金': 'Kim',
  '木': 'Mộc',
  '水': 'Thủy',
  '火': 'Hỏa',
  '土': 'Thổ',
};
