/**
 * lib/ziwei/db-analysis —— 开源占位版（论断内容库不在开源范围）
 *
 * 线上完整版包含 14 主星 × 13 宫位语境的详细命理论断（一句话定调 / 核心论断 /
 * 命盘依据 / 经典出处），属于核心内容、不随排盘引擎开源。此文件仅保留 SEO
 * 知识页框架所需的「类型 + 宫位/主题标签」（紫微斗数通用术语，非独有内容），
 * 论断内容库 STAR_DB 置空 —— 因此知识库详情页会生成 0 条静态路由。
 *
 * 排盘内核（安星算法、四化、格局识别、古籍原文）完全开放，
 * 见 lib/ziwei 下的 algorithm.ts / patterns.ts / sihua.ts 等。
 */

export type TopicKey =
  | 'overview' | 'personality' | 'love' | 'career' | 'wealth' | 'health'
  | 'family' | 'children' | 'move' | 'friends' | 'home' | 'spirit' | 'parents';

// iztro zh-CN 宫位名：命宫保留「宫」字，其余无「宫」字，「交友」在 iztro 里叫「仆役」
export const TOPIC_PALACE_NAME: Record<TopicKey, string> = {
  overview:    '命宫',
  personality: '命宫',
  love:        '夫妻',
  career:      '官禄',
  wealth:      '财帛',
  health:      '疾厄',
  family:      '兄弟',
  children:    '子女',
  move:        '迁移',
  friends:     '仆役',
  home:        '田宅',
  spirit:      '福德',
  parents:     '父母',
};

export const TOPIC_LABEL: Record<TopicKey, string> = {
  overview:    'Mệnh cách tổng quan',
  personality: 'Đặc điểm tính cách',
  love:        'Tình cảm hôn nhân',
  career:      'Sự nghiệp',
  wealth:      'Tài vận',
  health:      'Tình trạng sức khỏe',
  family:      'Anh em – hợp tác',
  children:    'Duyên con cái',
  move:        'Di chuyển – xuất ngoại',
  friends:     'Quan hệ – quý nhân',
  home:        'Điền trạch – bất động sản',
  spirit:      'Tinh thần – phúc đức',
  parents:     'Cha mẹ – bậc trên',
};

/**
 * 论断内容库（14 主星 × 各宫位语境的详细断语）——核心内容，不在开源范围。
 * 此处置空；知识库 SEO 页因 `exists=false` 生成 0 条静态详情路由，但列表框架仍可运行。
 *
 * ── MẪU (10/11/2026) — 1 mục duy nhất để xem khung viết ────────────────
 * Nội dung dưới đây do AI soạn thảo theo cổ thư trong repo (《Tử Vi Đẩu Số
 * Toàn Thư》chương Mệnh cung), CHƯA qua kiểm chứng chuyên môn — chỉ để xem
 * khung, chưa phải bản chốt. Marker tiếng Việt đã được parser chấp nhận
 * (xem lib/seo/knowledge.ts); muốn viết bằng marker gốc tiếng Trung cũng được.
 * Đủ bộ là 14 sao × 13 chủ đề = 182 mục; làm dần từng mục vẫn chạy được.
 */
export const STAR_DB: Record<string, unknown> = {
  '紫微': {
    mingGong: `**【Định tính】**
Tử Vi là Đế tinh, hóa khí vi tôn — sao đứng đầu trong 14 chính tinh. Nhập Mệnh chủ khí chất tôn quý, có khả năng lãnh đạo bẩm sinh, thích đứng ở vị trí cao, hợp làm chủ, quản lý, gánh vác việc lớn. Nhưng Đế tinh cần quần thần phù trợ: gặp cát tinh thì quý cách thành hình; đơn độc một mình thì chí lớn mà khó thành, dễ thành "vua không triều thần".

**【Luận đoán cốt lõi】**
Về tính cách, người Tử Vi thủ Mệnh tự trọng cao, coi trọng danh dự và thể diện, có trách nhiệm, thích được tôn trọng. Quyết đoán, có tầm nhìn, nhưng đôi khi bảo thủ, khó nghe lời trái ý; càng lớn tuổi càng vững vàng.

Độ sáng quyết định mức độ phát huy. Theo bảng độ sáng của repo (đối chiếu Toàn Thư), Tử Vi miếu tại Tý, Thìn, Tỵ, Hợi thì khí chất đế vương rõ, làm việc lớn thuận lợi; đắc địa vẫn tốt; bình tại Tuất thì khí thế giảm, cần cát tinh nâng đỡ. Lạc hãm thì chí cao mà lực chưa tới, đời nhiều thử thách — nhưng như Toàn Thư nói, người lạc hãm có hai chữ "không cam chịu" thúc đẩy, ngược lại có thể làm nên việc mà mệnh cách miếu vượng không làm được.

Gặp cát tinh thì quý: Tả Phụ, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt, Lộc Tồn hội về thì quý nhân không dứt, hợp vị trí cao. Đồng cung Thiên Phủ (tại Dần, Thân) thì vừa có uy vừa có kho; đồng cung Thất Sát (Tỵ, Hợi) thì uy nghiêm quả quyết, hợp quân sự, quản lý, khởi nghiệp; đồng cung Tham Lang (Mão, Dậu) thì đa tài, giao tiếp rộng, tình cảm phong phú; đồng cung Phá Quân (Sửu, Mùi) thì khai sáng, phá cũ lập mới.

Gặp sát tinh thì quý khí giảm: Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp, Hóa Kỵ xung phá thì dễ cô độc, áp lực, làm việc lớn hay gặp trở lực. Tử Vi sợ nhất đơn độc gặp sát tinh mà không có cát tinh giải, và Hóa Kỵ đồng cung hay xung phá làm tổn danh dự.

**【Căn cứ lá số】**
Tử Vi an tại Mệnh thì tam hợp cố định: cung Tài Bạch tất có Vũ Khúc, cung Quan Lộc tất có Liêm Trinh. Vì vậy phải xem đồng thời Vũ Khúc (tiền bạc, "quốc khố") và Liêm Trinh (sự nghiệp, "triều thần") mới biết Đế tinh có thực lực hay chỉ có hư danh.

Xem độ sáng của Tử Vi tại chi Mệnh theo bảng độ sáng (Miếu / Vượng / Đắc / Bình / Hãm). Xem cát tinh Tả Phụ, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt có hội về Mệnh, Quan Lộc, Tài Bạch, Thiên Di hay không; xem sát tinh Kình, Đà, Hỏa, Linh, Không, Kiếp và Hóa Kỵ nằm ở đâu trong tam phương tứ chính.

Xem Thân cư đâu: Thân cư Quan Lộc thì sự nghiệp là nơi gửi gắm cả đời; Thân cư Tài Bạch thì tiền bạc là trọng tâm; Thân cư Thiên Di thì ra ngoài, đi xa mới phát.

**【Xuất xứ cổ thư】**
《Tử Vi Đẩu Số Toàn Thư》 (La Hồng Tiên biên, đời Minh), chương "Thập nhị cung luận · Mệnh cung": "命宫者，一身之根本，万事之枢纽。命宫定，则一生格局定。看命宫先看主星，次看辅煞，再看四化与三方四正之会照。" (Mệnh cung là gốc của một đời, then chốt của vạn sự. Mệnh cung đã định thì cách cục cả đời đã định. Xem Mệnh cung trước xem sao chính, sau xem phụ sát, rồi xem Tứ Hóa và tam phương tứ chính hội chiếu.)

Cùng chương: "命宫主星庙旺，主先天优势，做事事半功倍；落陷则主先天劣势，但反主大成——落陷之人有"不甘"二字推动，反能爆发出庙旺命格做不到的逆袭。" (Sao chính ở Mệnh cung miếu vượng thì chủ có ưu thế bẩm sinh, làm việc được nửa công gấp bội; lạc hãm thì chủ có bất lợi bẩm sinh, nhưng ngược lại chủ nên việc lớn — người lạc hãm có hai chữ "không cam chịu" thúc đẩy, ngược lại có thể bùng phát làm nên điều mà mệnh cách miếu vượng không làm được.)

Cùng chương: "命宫见六吉星（左辅右弼文昌文曲天魁天钺），主一生贵人不绝；命宫见六煞星（擎羊陀罗火星铃星地空地劫），主多波折磨砺，但若能忍过，反成大器。" (Mệnh cung gặp Lục Cát tinh thì chủ cả đời quý nhân không dứt; gặp Lục Sát tinh thì chủ nhiều sóng gió mài giũa, nhưng nếu nhẫn được qua, ngược lại thành đại khí.)`,
  },
};
