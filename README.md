> **Bản fork Việt hoá — chỉ dùng cá nhân**
>
> Đây là bản dịch tiếng Việt của [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu) (engine lập lá số Tử Vi Đẩu Số theo hệ Nghê Hải Hạ «Thiên Kỷ»), do tôi dịch để dùng cá nhân. Bản gốc tiếng Trung được giữ nguyên tại [README.zh-CN.md](./README.zh-CN.md).
>
> Giấy phép từng phần (không đổi so với repo gốc):
> - Code + tài liệu: **MIT** (xem [LICENSE](./LICENSE)) — dịch và dùng tự do, kể cả thương mại, chỉ cần giữ lại dòng bản quyền.
> - Bộ dữ liệu v3.0/v4.0: **CC BY 4.0** (xem [DATASET-LICENSE](./DATASET-LICENSE)) — dùng được kể cả thương mại, ghi rõ nguồn.
> - Cổ thư (Cốt Tủy Phú, Toàn Tập, Toàn Thư): **phạm vi công cộng**.
> - 1.848 trích dẫn «Thiên Kỷ» của Nghê Hải Hạ: **CC BY-NC-SA 4.0** — chỉ dùng phi thương mại. Bản dịch này chỉ phục vụ mục đích cá nhân, không quảng cáo, không thu phí.
>
> Ghi chú bản dịch: repo gốc chưa có hệ i18n nên bản này dịch trực tiếp chuỗi giao diện trong code (xem mục «Ghi chú bản dịch» ở cuối file). Tên sao, cung, can chi dùng theo cách gọi Hán–Việt quen thuộc trong Tử Vi Việt Nam; tên riêng, số liệu và đường link giữ nguyên.

<div align="center">

# Tử Vi Đẩu Số · Engine lập lá số mã nguồn mở

### Thuật toán là trí tuệ truyền thống công khai, không nên bị nhốt trong tường rào

[![CI](https://github.com/Renhuai123/ziwei-doushu/actions/workflows/ci.yml/badge.svg)](https://github.com/Renhuai123/ziwei-doushu/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](./LICENSE)
[![Dataset: CC BY 4.0](https://img.shields.io/badge/dataset-CC%20BY%204.0-green.svg)](./DATASET-LICENSE)

**Tiếng Việt** · [中文](./README.zh-CN.md) · [English](./README.en.md)

</div>

**I. Ý tưởng dự án**: Tử Vi Đẩu Số là báu vật của mệnh lý truyền thống Trung Hoa, thầy Nghê Hải Hạ đã hệ thống hoá trường phái Tử Vi Đẩu Số chính tông trong «Thiên Kỷ». Chúng tôi mong qua công nghệ để nhiều người tiếp cận và học môn này hơn.

Mở mã nguồn thuật toán lập lá số và kho tri thức, vì chúng tôi tin rằng: **thuật toán là trí tuệ truyền thống công khai, không nên bị nhốt trong tường rào**. Giá trị thật nằm ở chiều sâu luận giải, ở việc mài giũa trải nghiệm người dùng và ở tích luỹ vận hành bền bỉ.

**II. Thông tin dự án**: Hệ thống lập lá số Tử Vi Đẩu Số theo hệ giảng dạy «Thiên Kỷ» của Nghê Hải Hạ, gồm thuật toán lập lá số đầy đủ, hệ Tứ Hóa, kho tri thức cách cục, dữ liệu cổ thư nguyên văn, cùng một bộ dữ liệu luận giải Tử Vi Đẩu Số mã nguồn mở hoàn chỉnh: **bộ dữ liệu luận giải v4.0 — 675 nghìn lá số × 13 chiều = 8,77 triệu đoạn luận giải, chính văn khoảng 20,4 tỉ chữ, giải nén 56,6 GB** (phát hành 15/10/2026).

| Bộ dữ liệu | Lá số | Số đoạn luận giải | Sau giải nén | Bao phủ năm | Số chữ luận giải mỗi lá |
|---|---|---|---|---|---|
| **Bộ dữ liệu luận giải v4.0** (15/10/2026) | **674.976** | **8.774.688** | **56,6 GB** | **1950–2026** (chỉ ngày thật) | **khoảng 30.000 chữ** |
| Bộ dữ liệu mẫu v3.0 | 518.400 | 6.739.200 | 33,1 GB | 1924–1983 | khoảng 21.000 chữ |
| Thay đổi | +30% | +30% | **+71%** | +17 năm | +44% |

<sub>Số chữ mỗi lá của v3.0 ước tính theo mẫu 2.160 lá, các con số còn lại thống kê toàn bộ; cả hai bản mỗi lá đều có 13 chiều.</sub>

Trải nghiệm trực tuyến: [ouranic.cn](https://ouranic.cn/?from=gh-readme), lập lá số, AI luận giải, lịch sử lá số đều mở.

> **Lưu ý: về luận đoán lục thân**
>
> Tử Vi Đẩu Số khi luận lục thân (cha mẹ, anh em, con cái…) có giới hạn nhất định. Thầy Nghê trong «Thiên Kỷ» có nói: «Đẩu số luận lục thân vốn kém hơn một chút.» ([2 thượng · 00:25:27](https://www.bilibili.com/video/BV1KJsLekEfA?p=3&t=1527)) Trong thuật số truyền thống, Thiết Bản Thần Số có ưu thế riêng trong việc đối chiếu lục thân ([2 thượng · 00:03:15](https://www.bilibili.com/video/BV1KJsLekEfA?p=3&t=195)); thầy Nghê vẫn lấy Tử Vi Đẩu Số làm cốt lõi, vì nó có thể kết hợp địa lý, môi trường và nhân sự để luận đoán tổng hợp, thành hệ thống hoàn chỉnh «trên biết thiên văn, dưới biết địa lý, giữa biết nhân sự» ([2 thượng · 00:25:43](https://www.bilibili.com/video/BV1KJsLekEfA?p=3&t=1543)). Vì vậy, phân tích liên quan đến lục thân chỉ để tham khảo; trên [ouranic.cn](https://ouranic.cn/?from=gh-readme), ba chiều cha mẹ, anh em, con cái cũng có cùng lưu ý này.

---

## Mục lục

| | Chương | Một câu |
|---|------|--------|
| I | [Đợt cập nhật này](#i-đợt-cập-nhật-này-15102026) | Câu luận 13 chiều hiệu đính từng câu theo lời thầy Nghê và «Toàn Thư», phát hành bộ dữ liệu 675 nghìn lá số × 13 chiều v4.0 |
| II·mới | [Bộ dữ liệu luận giải 13 chiều v4.0](#ii-mới-bộ-dữ-liệu-luận-giải-13-chiều-v40-15102026) | Bản câu luận mới 15/10/2026, 675 nghìn lá số, tải theo năm |
| II | [Bộ dữ liệu mẫu 518 nghìn lá số](#ii-bộ-dữ-liệu-mẫu-518-nghìn-lá-số) | Quy cách, tải về, công dụng, giấy phép |
| III | [Bắt đầu nhanh](#iii-bắt-đầu-nhanh) | Clone về là chạy được |
| IV | [Engine lập lá số](#iv-engine-lập-lá-số) | Làm được gì, file chia thế nào, dữ liệu cổ thư |
| V | [Lời gốc «Thiên Kỷ · Tử Vi Đẩu Số» của thầy Nghê](#v-lời-gốc-thiên-kỷ--tử-vi-đẩu-số-của-thầy-nghê) | 14 bài + 2 đoạn bổ sung, 1.848 câu, xem tổng quan trong một hình, câu nào cũng phát lại được |
| VI | [Giao diện chỉ là bản Demo](#vi-giao-diện-chỉ-là-bản-demo) | Không phải bộ giao diện trên mạng, khác biệt ghi rõ |
| VII | [Ranh giới mã nguồn mở](#vii-ranh-giới-mã-nguồn-mở-gì-không-nằm-trong-này) | Cái gì mở, cái gì không mở |
| VIII | [Nhịp bảo trì và đóng góp](#viii-nhịp-bảo-trì-và-đóng-góp) | Nhịp đồng bộ, khẩu kính issue / PR |
| IX | [Giấy phép](#ix-giấy-phép) | Code MIT / dữ liệu CC BY 4.0 / cổ thư công cộng / lời thầy Nghê phi thương mại |
| X | [Về dự án và liên hệ](#x-về-dự-án-và-liên-hệ) | Ý tưởng dự án, công nghệ, liên hệ |

---

## I. Đợt cập nhật này (15/10/2026)

Đợt này theo kịp bản phát hành của website ngày 15/10/2026 (phiên bản nội dung website `ca268829f7a9`):

![Tổng quan đợt cập nhật](./docs/update-20261015.png)

**1. Phát hành bộ dữ liệu luận giải 13 chiều v4.0** —— 674.976 lá số (mỗi ngày thật trong lịch 1950–2026 × 12 giờ × nam/nữ) × 13 chiều = **8.774.688 đoạn luận giải**, chính văn khoảng 20,4 tỉ chữ. Sau giải nén 56,6 GB (v3.0 là 33,1 GB, tăng 71%), sau nén chỉ 161 MB, chia theo năm thành 77 file, có thể chỉ tải năm cần dùng, hoặc tải một lần gói tổng toàn bộ các năm. Tải về xem [Release v4.0-13d](https://github.com/Renhuai123/ziwei-doushu/releases/tag/v4.0-13d), quy cách và trường dữ liệu xem [chương II·mới](#ii-mới-bộ-dữ-liệu-luận-giải-13-chiều-v40-15102026). Trước khi phát hành, 77 file được giải nén từng file và đối chiếu từng byte với dữ liệu gốc, khớp hoàn toàn.

**2. Câu luận 13 chiều hiệu đính từng câu theo lời thầy Nghê và nguyên văn «Toàn Thư»** (kho câu luận vẫn không mở, kết quả hiệu đính thể hiện trong bộ dữ liệu v4.0):

- Câu nào ghi là lời thầy Nghê hay «Toàn Thư» mà tra không ra nguồn thì xoá hoặc thay bằng lời gốc tra được từng chữ; lời thầy Nghê ghi rõ «Thiên Kỷ» tập mấy, phút giây nào
- Xoá các câu về Tứ Hóa không thể xảy ra (như Thất Sát hóa Quyền, Tử Vi hóa Kỵ); câu luận chỉ đúng trong điều kiện nào đó thì bổ sung điều kiện
- Câu kiểu «lúc mạnh thì… lúc hãm thì…» nói cả hai đầu thì sửa thành chỉ hiển thị trường hợp đúng với lá số đó
- Sức khỏe: tạng phủ nào cần lưu ý thì đổi theo cách nhìn của thầy Nghê — xem toàn lá, sao sát tụ nhiều nhất ở cung nào thì lấy địa chi của cung đó ứng với tạng phủ; không suy tạng theo ngũ hành của sao nữa
- Mục «Cổ thư dẫn chứng» trong kho tri thức của website tăng từ 244 lên 405 chỗ, chỗ nào cũng tra được từng chữ trong nguyên văn «Tử Vi Đẩu Số Toàn Thư»

**3. Engine lập lá số đồng bộ** ([PR #39](https://github.com/Renhuai123/ziwei-doushu/pull/39)) —— `dst-cn.ts` thêm `chinaDSTSpan(year)` để tra khoảng thời gian giờ mùa hè của Trung Quốc theo năm; `cities.ts` bổ sung kinh độ của các đơn vị cấp huyện trực thuộc tỉnh và các thành phố thuộc Binh đoàn Tân Cương (Thần Nông Giá, các thành phố/huyện Hải Nam, A Lạp Nhĩ…), chọn các thành phố này làm nơi sinh thì hiệu chỉnh giờ mặt trời thật vẫn dùng được.

**4. Giấy phép** —— [`DATASET-LICENSE`](./DATASET-LICENSE) mở rộng phạm vi áp dụng sang v4.0; ghi rõ lời thầy Nghê trích trong phần luận giải không nằm trong phạm vi cấp phép dữ liệu, nhất quán với CC BY-NC-SA 4.0 của chương V về lời thầy Nghê. Bộ dữ liệu mẫu v3.0 và điều khoản của nó không đổi.

> **Bổ sung 08/11/2026**: Mở kho công khai mới **[nishi-ziwei-video-reading](https://github.com/Renhuai123/nishi-ziwei-video-reading)** — dùng nhiều mô hình lớn đọc kỹ từng khung hình 17 tập «Thiên Kỷ» phần Tử Vi của thầy Nghê, tổng cộng 1,6 triệu khung hình; phương án, script, điểm kiểm tra và các lỗi đã vấp đều công khai toàn bộ quá trình, vừa làm vừa cập nhật, động thái gần đây xem ở đó.

> **Bổ sung 02/11/2026**: Đổi ngày cuối giờ Tý muộn sang tính theo **giờ mặt trời thật**, cùng khẩu kính với chi giờ (#63) — đã nhập nơi sinh thì 23:30 giờ đồng hồ tại kinh đông 100° (giờ mặt trời thật 22:10, giờ Hợi) ở lại ngày hôm đó, không còn xếp thành «giờ Hợi ngày hôm sau» nữa; không nhập nơi sinh thì không hiệu chỉnh, kết quả giữ nguyên, trên ouranic.cn cũng cùng khẩu kính này. Tham số tháng nhuận ghi sai thì báo lỗi ngay tại chỗ, không lặng lẽ xếp «về tháng này» như trước (#71). Cảm ơn Bortlesboat, xunguangzlj-cloud đã đóng góp, Verchiel666 đã soát lại.

> **Bổ sung 31/10/2026**: Nền tảng trực tuyến đổi tên thành **OURANIC**, địa chỉ chuyển từ metisziwei.com sang **[ouranic.cn](https://ouranic.cn/?from=gh-readme)** (đơn vị vận hành: Công ty TNHH Công nghệ Bắc Kinh Vương Đa Ngư, số ICP Kinh 2026069066-1); địa chỉ cũ sẽ tự chuyển hướng, code, dữ liệu và giấy phép của kho này không đổi.

> **Bổ sung 27/10/2026**: Engine lập lá số đồng bộ — `true-solar-time.ts` hỗ trợ nơi sinh ở nước ngoài: truyền `utcOffsetMinutes` (độ lệch chuẩn cố định theo múi giờ của nơi sinh), hiệu chỉnh kinh độ theo kinh tuyến trung tâm của múi giờ địa phương; trong nước không truyền thì kết quả từng bit không đổi; thêm `clock-adjust.ts` để đổi số đọc đồng hồ thành giờ chuẩn khi có giờ mùa hè hoặc múi giờ năm đó khác bây giờ (qua ngày thì không đổi, giao cho người dùng tự xử). Nhân tiện sửa: engine giờ mùa hè Trung Quốc **chỉ phán đoán, không bao giờ tự trừ**, trước đây bảng «Khả năng của engine» ghi «tự trừ» là sai.

> **Bổ sung 24/10/2026**: Ý tưởng dự án dời lên đầu trang — dưới tiêu đề đặt giữa một câu «Thuật toán là trí tuệ truyền thống công khai, không nên bị nhốt trong tường rào», tiếp theo là hai đoạn ý tưởng gốc (đánh dấu «Ý tưởng dự án» trước), đoạn giới thiệu cũ đánh dấu «Thông tin dự án» ở trước; chương X «Ý tưởng dự án» đổi thành trỏ lên đầu trang.

> **Bổ sung 20/10/2026**: Độ sáng sao mặc định đổi sang «Đẩu Số Toàn Thư», giống mặc định của phần mềm lập lá số chính thống; «Hiệu chỉnh hiện đại v2» trước đây vẫn chọn được trong cài đặt trường phái; bổ sung độ sáng cho Thiên Diêu, Thiên Hình, Thiên Hỉ, Đại Hao, Giải Thần, Tiệt Không, Phụ Tiệt, Tuần Không; Nguyệt Đức không ghi độ sáng nữa. Dùng 5 lá chuẩn vàng đối chiếu từng cung, sao nhập cung và độ sáng đều khớp hoàn toàn. Lưu ý: bộ dữ liệu v4.0 (15/10) được tạo theo mặc định cũ «Hiệu chỉnh hiện đại v2», nên chữ độ sáng và một ít câu luận đổi theo độ sáng sẽ khác mặc định mới.

> **Bổ sung 06–07/10/2026**: README thêm «Lưu ý: về luận đoán lục thân» (lời thầy Nghê + đường dẫn nguồn, cả bản Trung và bản Anh); link website thêm mã kênh `?from=`; đồng bộ hiệu đính ngữ liệu lời thầy Nghê (chủ tinh Nam Đẩu, Bắc Đẩu thuộc về đâu).

### Đợt cập nhật trước (21/09/2026)

> **Bổ sung 03/10/2026**: Lời gốc «Thiên Kỷ · Tử Vi Đẩu Số» của thầy Nghê (1.848 câu) tách thành chương riêng (chương V); hợp nhất đóng góp ngoài #29 (kiểm tra số thứ tự giờ); engine từ chối ngày dương lịch không tồn tại, bộ dữ liệu bổ sung khẩu kính trường và vấn đề đã biết; nộp package-lock.json; địa chỉ site đổi thành cấu hình được; demo hợp bàn đổi sang dùng engine nội bộ để lập lá số, khi thiếu API AI thì báo rõ; bổ sung hướng dẫn đóng góp, quy tắc ứng xử, mẫu issue và PR; thêm giới thiệu tiếng Anh [README.en.md](./README.en.md); bỏ hai gói triển khai không dùng đến (vercel CLI, @cloudflare/next-on-pages), số dependency giảm từ 483 xuống 185; sau đó nâng lên Next.js 16 để vá lỗ hổng postcss, cảnh báo bảo mật của GitHub từ 51 cảnh báo về 0.

![Tổng quan đợt cập nhật](./docs/update-20260921.png)

Sau ba tháng, kho này hoàn thành một đợt cập nhật đầy đủ ([PR #28](https://github.com/Renhuai123/ziwei-doushu/pull/28), 26 file, +2736 / −108 dòng):

**1. Engine lập lá số đồng bộ với khẩu kính trên mạng** —— `algorithm.ts` từ 181 dòng lên 641 dòng, ngoài ra cập nhật sihua / types / constants / patterns / cities / famous; thêm 8 module mới (1.367 dòng):

| Module | Tác dụng |
|------|------|
| `true-solar-time.ts` | Hiệu chỉnh giờ mặt trời thật (chênh kinh độ + phương trình thời gian) |
| `dst-cn.ts` | Giờ mùa hè Trung Quốc 1986–1991 |
| `clock-adjust.ts` | Đổi số đọc đồng hồ thành giờ chuẩn (giờ mùa hè / múi giờ năm đó khác bây giờ) |
| `lunar-solar.ts` | Đổi âm lịch / dương lịch và kẹp biên tháng nhuận |
| `school-data.ts` / `school-tables.generated.ts` / `school-config.ts` | Dữ liệu độ sáng sao theo trường phái, bảng đối chiếu, cấu hình khẩu kính tháng nhuận và giờ Tý muộn |
| `shier-shen.ts` | Thập nhị thần sát |
| `yunxian-context.ts` | Ngữ cảnh vận hạn (kể cả xử lý hạn trẻ em) |

**2. Bổ sung kiểm thử hồi quy và CI** —— Trước đây kho này không có test nào. Giờ có 5 test hồi quy lập lá số, `npm test` chạy một lệnh là xong, mỗi lần push và PR đều chạy tự động trên GitHub Actions.

**3. Sửa lỗi chú thích giờ trong mẫu bị lệch** ([#26](https://github.com/Renhuai123/ziwei-doushu/issues/26)) —— Trong `famous.ts`, 11 mẫu người nổi tiếng có 7 mẫu mà chú thích giờ không khớp với chỉ số `hour` (`hour` từ trước đến nay vẫn là **chỉ số địa chi của giờ 0–11**, không phải giờ đồng hồ 0–23). Đã sửa và thêm test hồi quy để ghim lại.

**4. Issue tồn đọng từ 18 issue dọn về 4 issue**, còn lại đều là việc đang đi tiếp.

**5. Tài liệu và giấy phép** —— Thêm [`DATASET-LICENSE`](./DATASET-LICENSE); README bổ sung danh sách khả năng của engine, nhịp bảo trì, ranh giới mã nguồn mở; sửa hai chỗ mô tả không đúng sự thật (bộ dữ liệu «khẩu kính hoàn toàn giống trên mạng», giao diện là «frontend Next.js 15 đầy đủ»).

---

## II·mới. Bộ dữ liệu luận giải 13 chiều v4.0 (15/10/2026)

> **Vị trí tải: bên phải kho này, [Releases → v4.0-13d](https://github.com/Renhuai123/ziwei-doushu/releases/tag/v4.0-13d)**

v4.0 được tạo lại bằng kho câu luận của website bản 15/10/2026: câu luận của 13 chiều phân tích đã hiệu đính từng câu theo bản ghi lời thầy Nghê Hải Hạ trong «Thiên Kỷ» và nguyên văn «Tử Vi Đẩu Số Toàn Thư» — trích dẫn nào tra không ra nguồn thì xoá hoặc thay bằng lời gốc tra được từng chữ (lời thầy Nghê ghi rõ tập «Thiên Kỷ» và mã thời gian), câu về Tứ Hóa không thể xảy ra thì xoá, câu luận có điều kiện thì ghi rõ điều kiện.

### Quy cách

| Hạng mục | Giải thích |
|------|------|
| Số lá | **674.976 lá** (dương lịch 1950–2026 × số ngày thật mỗi tháng × 12 giờ × nam/nữ) |
| Số đoạn luận giải | **8.774.688 đoạn** (mỗi lá 13 chiều) |
| Các chiều | Tổng quan mệnh cách, tính cách, tình cảm, sự nghiệp, tài vận, sức khỏe, anh em, con cái, di chuyển, giao thiệp, điền trạch, phúc đức, cha mẹ |
| Kích thước | Sau giải nén 56,6 GB; sau nén 161 MB (77 file theo năm, zstd; ngoài ra có gói tổng toàn bộ các năm `ziwei-interp-v4-all.tar`) |
| Chính văn | Khoảng 20,4 tỉ chữ, mỗi lá khoảng 30.000 chữ |
| Cách tạo | Engine lập lá số + kho câu luận tạo ra một cách xác định, không qua AI, cùng một đầu vào luôn cho cùng một đầu ra |
| Phiên bản nội dung | `ca268829f7a9` (cùng ANALYSIS_CONTENT_VERSION với website thời điểm đó) |

**Mỗi dòng một lá** (JSON Lines), các trường:

| Trường | Ý nghĩa |
|------|------|
| `k` | Khoá: `YYYY-MM-DD-số thứ tự giờ-giới tính`, ví dụ `1990-01-01-0-male` |
| `y` / `m` / `d` | Ngày sinh **dương lịch**; chỉ chứa ngày thật (không còn kiểu 30 tháng 2 nữa) |
| `h` | **Số thứ tự giờ 0–11** (Tý = 0 …… Hợi = 11), không phải giờ đồng hồ; bảng đối chiếu xem mục trước |
| `g` | `male` / `female` |
| `ms` | Sao chính đầu tiên của cung Mệnh; cung Mệnh không có sao chính thì là `null` |
| `t` | Số chữ từng chiều |
| `c` | Toàn văn luận giải 13 chiều (Markdown), khoá là `overview` / `personality` / `love` / `career` / `wealth` / `health` / `family` / `children` / `move` / `friends` / `home` / `spirit` / `parents` |

**Lưu ý về khẩu kính**
- Đây là luận giải ở góc nhìn lá số gốc; những câu trên website viết lại theo tuổi hiện tại của người đọc, đoạn quy tắc của thầy Nghê gắn thêm ở cuối mỗi chiều, và phần AI luận giải đều không nằm trong bộ dữ liệu.
- Lập lá số trực tiếp theo số thứ tự giờ, chưa hiệu chỉnh giờ mặt trời thật theo nơi sinh.

### Tải về và giải nén

```bash
# Tải hết một lần: gh release download v4.0-13d --repo Renhuai123/ziwei-doushu -p "ziwei-interp-v4-all.tar"
# Chỉ cần vài năm thì chỉ tải các năm đó, ví dụ năm 1990
zstd -d --long=27 year-1990.jsonl.zst          # được year-1990.jsonl
shasum -a 256 -c SHA256SUMS.txt --ignore-missing # kiểm tra
```

`--long=27` bắt buộc phải có (lúc nén đã dùng cửa sổ dài). Trên Windows có thể dùng zstd.exe trong [gói phát hành chính thức của zstd](https://github.com/facebook/zstd/releases), tham số như nhau.

### Lưu ý về trích dẫn

Lời gốc «Thiên Kỷ» của Nghê Hải Hạ được trích trong phần luận giải **không thuộc phạm vi cấp phép của bộ dữ liệu này**: đó là những trích dẫn ngắn, ghi rõ tập và mã thời gian để ghi rõ câu luận lấy từ đâu, bản quyền thuộc về chủ sở hữu gốc; muốn dùng riêng hàng loạt các lời gốc đó thì xử lý theo [CC BY-NC-SA 4.0](./docs/tianji-ziwei/LICENSE.md) ở chương V về lời thầy Nghê. Nguyên văn «Tử Vi Đẩu Số Toàn Thư» thuộc phạm vi công cộng.

### Giấy phép

Giống v3.0: **CC BY 4.0, dùng thương mại tự do, yêu cầu duy nhất là giữ lại ghi nguồn** (trừ lời thầy Nghê trong mục «Lưu ý về trích dẫn» ở trên), điều khoản đầy đủ xem [DATASET-LICENSE](./DATASET-LICENSE). Khi trích dẫn xin ghi:

> Dự án này đã dùng **Bộ dữ liệu luận giải Tử Vi Đẩu Số mã nguồn mở v4.0** (674.976 lá số × 13 chiều)
> Nguồn: https://github.com/Renhuai123/ziwei-doushu
> Tác giả: 王多鱼AI

---

## II. Bộ dữ liệu mẫu 518 nghìn lá số

> **Vị trí tải: bên phải kho này, trang [Releases](https://github.com/Renhuai123/ziwei-doushu/releases/tag/v3.0-samples)**

Chúng tôi mở mã nguồn một bộ dữ liệu mẫu lá số Tử Vi Đẩu Số hoàn chỉnh, bao phủ **518 nghìn tổ hợp lập lá số** (năm 60 × tháng 12 × ngày 30 × giờ 12 × giới tính 2), mỗi mẫu gồm cấu trúc lá số đầy đủ và văn bản luận giải theo hệ Nghê Hải Hạ.

### 2.1 Quy cách dữ liệu

| Hạng mục | Giải thích |
|------|------|
| Số mẫu | **518.400 mẫu** |
| Tổng kích thước | Sau nén 5,5 GB (chia 3 phần), sau giải nén 33,1 GB |
| Hệ phái | Tử Vi Đẩu Số chính tông «Thiên Kỷ» của Nghê Hải Hạ (phái Phi Tinh thuần tuý đã gỡ xuống) |
| Nội dung | JSON lá số + văn bản luận giải 13 chủ đề (tổng quan mệnh cách, tài vận, sự nghiệp, tình cảm, sức khỏe…) |
| Kiểm chứng | Khác biệt nam/nữ mệnh 100%, sức khỏe có Tý Ngọ lưu chú 100%, mệnh nữ có dưỡng sinh phụ khoa 100% |
| Khẩu kính | Do **engine lập lá số v3 + kho câu luận thời điểm đó** tạo ra; engine trên mạng đang cập nhật liên tục, đầu ra bản mới có thể khác bộ dữ liệu này |

**Khẩu kính trường dữ liệu** (mỗi mẫu được tạo từ `birthInfo`, hay bị đọc nhầm nhất là `hour`):

| Trường | Ý nghĩa |
|------|------|
| `birthInfo.year` / `month` / `day` | Ngày sinh **dương lịch**: năm 1924–1983 (một giáp Tý đầy đủ), mỗi tháng lấy ngày 1–30 |
| `birthInfo.hour` | **Số thứ tự giờ 0–11**, không phải giờ đồng hồ 0–23: Tý = 0, Sửu = 1 …… Hợi = 11 |
| `birthInfo.gender` | `male` / `female` |
| `birthInfo.longitude` | Cố định 120 (kinh đông 120°, chưa hiệu chỉnh giờ mặt trời thật theo từng nơi) |
| Tên file `YYYY-MM-DD-hHH-giới tính.json` | Trong đó `hHH` cũng là số thứ tự giờ, ví dụ `h11` là giờ Hợi, không phải 11 giờ sáng |

Bảng đối chiếu số thứ tự giờ và giờ đồng hồ:

| Số thứ tự | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Giờ | Tý | Sửu | Dần | Mão | Thìn | Tỵ | Ngọ | Mùi | Thân | Dậu | Tuất | Hợi |
| Giờ đồng hồ | 23–1 | 1–3 | 3–5 | 5–7 | 7–9 | 9–11 | 11–13 | 13–15 | 15–17 | 17–19 | 19–21 | 21–23 |

Sinh 23:00–23:59 (giờ Tý muộn) thì lập lá số theo ngày hôm sau, giờ lấy số 0; sinh 00:00–00:59 (giờ Tý sớm) thì lập theo ngày hôm đó, giờ cũng lấy số 0.

**Vấn đề đã biết: khoảng 2.520 mẫu có ngày không tồn tại.** Lúc tạo, tháng nào cũng lấy ngày 1–30 nên cả 30 tháng 2 và 29 tháng 2 của năm không nhuận cũng được tạo mẫu, tổng cộng 105 ngày × 12 giờ × 2 giới tính = 2.520 mẫu, chiếm 0,49%. Engine v3 gặp các ngày này không báo lỗi mà dời sang ngày 1–2 tháng 3 để lập lá số, nên nội dung các mẫu này trùng với mẫu ngày 1–2 tháng 3 tương ứng. Khi dùng xin lọc bỏ: `month = 2` và `day = 30`, hoặc `month = 2` và `day = 29` mà năm đó không phải năm nhuận. Engine từ 03/10/2026 sẽ từ chối thẳng ngày không tồn tại, bộ dữ liệu bản sau sẽ không còn các mẫu này nữa.

### 2.2 Cách tải

Vào [Releases](https://github.com/Renhuai123/ziwei-doushu/releases/tag/v3.0-samples) để tải các file sau:

```
ziwei-samples-v3-part1.zip.001  (1,9 GB)
ziwei-samples-v3-part2.zip.002  (1,9 GB)
ziwei-samples-v3-part3.zip.003  (1,8 GB)
SHA256SUMS.txt                  (file kiểm tra)
```

Tải về rồi gộp và giải nén:

```bash
# macOS / Linux
cat ziwei-samples-v3-part*.zip.* > combined.zip
unzip combined.zip

# Windows (PowerShell)
Get-Content ziwei-samples-v3-part*.zip.* -Encoding Byte -ReadCount 0 | Set-Content combined.zip -Encoding Byte
Expand-Archive combined.zip
```

### 2.3 Công dụng

- Ngữ liệu huấn luyện để fine-tune mô hình nhỏ (518 nghìn cặp input-output)
- Nguồn truy xuất RAG cho hội thoại AI
- Đối chiếu baseline A/B sau khi sửa `patterns.ts`
- Nghiên cứu Tử Vi Đẩu Số và phân tích dữ liệu

### 2.4 Giấy phép dữ liệu và trích dẫn

📂 **Hoàn toàn mã nguồn mở · Dùng thương mại tự do** —— Bạn có thể dùng bộ dữ liệu này trong bất kỳ dự án nào, bao gồm nhưng không giới hạn:

- Sản phẩm thương mại / SaaS / ứng dụng trả phí
- Fine-tune mô hình AI (mô hình mở hay đóng đều được)
- Phát triển tiếp, tái phân phối, tạo bộ dữ liệu phái sinh
- Nghiên cứu học thuật, blog kỹ thuật, khoá học giảng dạy

Không cần trả phí, không cần đăng ký, không cần báo trước.

**Yêu cầu duy nhất là giữ lại ghi nguồn dữ liệu (attribution)**:

> Dự án này đã dùng **Bộ dữ liệu mẫu Tử Vi Đẩu Số mã nguồn mở v3.0** (518.400 mẫu)
> Nguồn: https://github.com/Renhuai123/ziwei-doushu
> Tác giả: 王多鱼AI

Đặt ở đâu cũng được:

- **Trang web / sản phẩm**: trang About / Về chúng tôi / Nguồn dữ liệu / chân trang, ghi một dòng link là đủ
- **Mô hình AI**: trường "Training Data" trong Model Card hoặc Dataset Card
- **Bài báo học thuật**: phần tài liệu tham khảo hoặc lời cảm ơn
- **Bộ dữ liệu phát hành lại**: ghi nguồn thượng nguồn trong README hoặc file metadata

Chỉ một yêu cầu đó, còn lại đều tự do. Điều khoản đầy đủ xem [DATASET-LICENSE](./DATASET-LICENSE). Mong bộ dữ liệu này giúp bạn làm ra thứ hay ho — làm xong nhớ lên Tiểu Hồng Thư / Douyin / Xianyu **@王多鱼AI** chào một tiếng 👋

---

## III. Bắt đầu nhanh

```bash
# Clone
git clone https://github.com/Renhuai123/ziwei-doushu.git
cd ziwei-doushu

# Cài dependency
npm install

# Cấu hình biến môi trường (chỉ xem lập lá số thì bỏ qua; cấu hình AI chỉ dùng khi bạn tự triển khai các route /api/*)
cp .env.example .env.local

# Chạy máy chủ phát triển
npm run dev
```

Kiểm tra tại máy:

```bash
npm run typecheck   # Kiểm tra kiểu TypeScript toàn bộ
npm test            # Hồi quy engine lập lá số (768 lá × các luật sắt của Tử Vi, giờ mùa hè, biên Lập Xuân, Hồng Loan Thiên Hỉ, giờ mẫu nhất quán, biên số thứ tự giờ, ngày hợp lệ, cùng cung song Tứ Hóa)
```

Mỗi lần push và PR đều chạy cùng bộ kiểm tra đó trên GitHub Actions (xem [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).

> **Lưu ý: bản mã nguồn mở không có route API backend.** Lập lá số, hiển thị lá số, lập hợp bàn đều chạy trong trình duyệt bằng engine của kho này, **không cần bất kỳ API Key nào**. AI luận giải (`/api/interpret`) và phân tích hợp bàn bằng AI (`/api/heming`) cần bạn tự triển khai route; chưa triển khai thì hai chỗ đó sẽ báo thẳng «bản mã nguồn mở không có route này», có cấu hình API Key cũng không dùng được (issue #30 cũng vì lý do này).

---

## IV. Engine lập lá số

Lõi lập lá số nằm hết trong `lib/ziwei/`.

### 4.1 Làm được gì (khác các thư viện lập lá số thường gặp ở đâu)

| Khả năng | Giải thích |
|------|------|
| **Hiệu chỉnh giờ mặt trời thật** | Tính chênh lệch theo kinh độ nơi sinh + phương trình thời gian, tránh lệch một giờ vì đông–tây |
| **Giờ mùa hè Trung Quốc** | Tự phán đoán khoảng giờ mùa hè 1986–1991 (chỉ phán đoán, không tự trừ; số đọc đồng hồ do người dùng xác nhận rồi mới dùng `clock-adjust.ts` đổi thành giờ chuẩn) |
| **Bốn khẩu kính tháng nhuận** | Tháng nhuận về tháng trước / về tháng sau / cắt theo ngày / theo tháng này, cấu hình được, không đóng cứng theo một phái |
| **Giờ Tý muộn đổi ngày** | 23:00–23:59 lập theo ngày hôm sau, 00:00–00:59 lập theo ngày hôm đó; đã nhập nơi sinh thì phán đoán theo giờ mặt trời thật (cùng khẩu kính với chi giờ); chiến lược đổi ngày chuyển được |
| **Độ sáng sao 7 bậc** | Miếu / Vượng / Đắc / Lợi / Bình / Bất / Hãm, ngoài ra giữ 3 bậc phân loại thô để hiển thị rút gọn |
| **Độ sáng chuyển được theo trường phái** | Các trường phái (kể cả các bản khác nhau của phần mềm lập lá số chính thống) phán độ sáng sao phụ không giống nhau, nên làm thành công tắc chứ không viết chết |
| **Tứ Hóa và phi tinh** | Tứ Hóa năm sinh, Tứ Hóa đại hạn / lưu niên, phi tinh tự hóa |
| **Thập nhị thần sát** | Tầng bản mệnh khởi theo chi năm sinh, tầng lưu niên đổi sang khởi theo chi năm lưu niên |
| **Nhận diện cách cục** | Kho quy tắc hơn 1.100 dòng (Tử Phủ đồng cung, Nhật Nguyệt tịnh minh, Thất Sát triều đẩu…) |

### 4.2 File chia thế nào

| File | Giải thích |
|------|------|
| `algorithm.ts` | Quy trình lập lá số đầy đủ: an cung Mệnh, định ngũ hành cục, an 14 sao chính, an sao phụ, xếp đại hạn lưu niên |
| `constants.ts` | Thiên can địa chi, 14 sao chính, hằng số sao phụ |
| `sihua.ts` | Hệ Tứ Hóa phi tinh (Lộc Quyền Khoa Kỵ), kèm bảng đối chiếu Tứ Hóa theo từng thiên can |
| `patterns.ts` | **Kho tri thức cách cục hơn 1.100 dòng**: quy tắc nhận diện các cách cục kinh điển như Tử Phủ đồng cung, Nhật Nguyệt tịnh minh, Thất Sát triều đẩu |
| `heming-knowledge.ts` | Phương pháp luận hợp bàn: logic so sánh hai lá số theo hệ thầy Nghê |
| `types.ts` | Định nghĩa kiểu TypeScript |
| `cities.ts` | Kinh vĩ độ các thành phố Trung Quốc, dùng hiệu chỉnh giờ mặt trời thật |
| `famous.ts` | Dữ liệu mẫu lá số người nổi tiếng trong lịch sử |
| `school-data.ts` / `school-tables.generated.ts` / `school-config.ts` | Dữ liệu độ sáng sao theo trường phái, bảng đối chiếu, cấu hình khẩu kính tháng nhuận và giờ Tý muộn |
| `shier-shen.ts` | Thập nhị thần sát (bản mệnh khởi theo chi năm sinh, tầng lưu niên khởi theo chi năm lưu niên) |
| `true-solar-time.ts` | Hiệu chỉnh giờ mặt trời thật (chênh kinh độ + phương trình thời gian) |
| `dst-cn.ts` | Năm và khoảng giờ mùa hè Trung Quốc 1986–1991 |
| `clock-adjust.ts` | Đổi số đọc đồng hồ thành giờ chuẩn theo từng phút (qua ngày thì không đổi) |
| `yunxian-context.ts` | Ngữ cảnh vận hạn (kể cả xử lý hạn trẻ em) |
| `lunar-solar.ts` | Đổi âm lịch / dương lịch và kẹp biên tháng nhuận |

### 4.3 Cổ thư nguyên văn (`lib/classics/`)

- **Cốt Tủy Phú** (`gusuifu.ts`) — ca quyết cốt lõi của Tử Vi Đẩu Số
- **Tử Vi Đẩu Số Toàn Tập** (`quanji.ts`) — bản cổ đời Thanh
- **Tử Vi Đẩu Số Toàn Thư** (`quanshu.ts`) — bản truyền của Trần Hy Di

### 4.4 Sơ đồ tri thức SEO (`lib/seo/`)

Dữ liệu tri thức có cấu trúc 14 sao chính × 12 cung vị, dùng để tạo nội dung hoặc xây kho tri thức.

---

## V. Lời gốc «Thiên Kỷ · Tử Vi Đẩu Số» của thầy Nghê

![Một hình xem hết «Thiên Kỷ · Tử Vi Đẩu Số» của Nghê Hải Hạ](./docs/tianji-ziwei/overview.png)

Lời gốc «Thiên Kỷ» phần Tử Vi Đẩu Số của Nghê Hải Hạ tổng cộng **1.848 câu**: chính khoá 14 bài (bài 2–15 nửa đầu) cộng 2 đoạn bổ sung, chia theo bài thành 16 file, đặt trong [`docs/tianji-ziwei/`](./docs/tianji-ziwei/). Câu nào cũng kèm thời gian xuất xứ, bấm vào là nhảy về đúng giây đó trong video gốc trên Bilibili.

- **Cách đọc**: tìm chủ đề muốn xem trong hình tổng quan trên, rồi bấm vào bài tương ứng, ví dụ [5 thượng](./docs/tianji-ziwei/5%E4%B8%8A.md) (Tử Vi tại Tý), [13 thượng](./docs/tianji-ziwei/13%E4%B8%8A.md) (Sát Phá Lang, Khoa Quyền Lộc tam hội).
- **Lấy từ đâu**: lấy từ kho chị em [nihai-tianji-corpus](https://github.com/Renhuai123/nihai-tianji-corpus), lấy kho ngữ liệu làm chuẩn, sẽ đồng bộ theo kho ngữ liệu.
- **Dùng thương mại được không**: **Không**. Nội dung chương này dùng riêng giấy phép CC BY-NC-SA 4.0, xem chi tiết ở [IX. Giấy phép](#ix-giấy-phép).

---

## VI. Giao diện chỉ là bản Demo

Code giao diện nằm trong `app/` và `components/`. Giao diện trong kho là **một ví dụ tối thiểu chạy được**, tác dụng là chạy engine lập lá số lên, vẽ lá số ra, để bạn tiện làm sản phẩm của riêng mình trên nền đó. **Giao diện của bản thương mại trên mạng không nằm trong phạm vi mã nguồn mở**, hai bên chênh nhau rất lớn:

| Trang / Component | Trong kho này (Demo) | Bản thương mại trên mạng |
|------|------|------|
| Trang lập lá số `app/chart/page.tsx` | 75 dòng | 1227 dòng |
| Panel luận giải `InsightPanel` | 467 dòng | 5088 dòng |
| Ô lá số `ChartBoard` | 285 dòng | 1334 dòng |
| Ô cung `PalaceCell` | 201 dòng | 1192 dòng |
| Trang hợp bàn `app/heming/page.tsx` | 368 dòng | 1937 dòng |

**Demo chạy thông được**: form thông tin sinh, ô lá số và chi tiết cung vị, chuyển Bản mệnh / Đại hạn / Lưu niên, trình đọc cổ thư (tìm kiếm toàn văn), bách khoa mệnh lý (14 sao chính × 12 cung vị), giao diện sáng/tối, tương thích di động.

**Demo không có**: giao diện tương tác làm lại trên mạng, AI luận giải dạng stream, sơ đồ hợp bàn, thẻ chia sẻ, và **bản thân nội dung câu luận** (`db-analysis.ts` chỉ là bản giữ chỗ). Nghĩa là Demo vẽ được lá số, nhưng không đưa ra được bộ luận giải như trên mạng.

---

## VII. Ranh giới mã nguồn mở: gì không nằm trong này

| | Nội dung |
|---|---|
| ✅ **Mã nguồn mở** | Engine lập lá số (`lib/ziwei/`), cổ thư nguyên văn thuộc phạm vi công cộng (`lib/classics/`), sơ đồ tri thức SEO (`lib/seo/`), giao diện Demo, bộ dữ liệu mẫu 518 nghìn lá số, bộ dữ liệu luận giải 13 chiều v4.0 |
| ❌ **Không mở** | Kho câu luận (`lib/ziwei/db-analysis.ts` chỉ là bản giữ chỗ, trên mạng là hơn mười nghìn dòng câu luận 13 chủ đề), prompt AI luận giải, API backend (`/api/interpret`…), hệ người dùng (đăng nhập / thành viên / thanh toán), an toàn phía server (chữ ký, chống spam, watermark), cấu hình triển khai |

Nếu bạn cần khả năng AI luận giải, có thể tham khảo kho tri thức trong `lib/ziwei/patterns.ts` và `heming-knowledge.ts`, kết hợp với bất kỳ LLM nào để tự xây prompt.

---

## VIII. Nhịp bảo trì và đóng góp

Kho này là **ảnh chụp mở của engine lập lá số + bộ dữ liệu**, không phải một sản phẩm mã nguồn mở có người bảo trì toàn thời gian, nói rõ để mọi người khỏi đoán:

- **Đồng bộ engine**: theo đợt phát hành trên mạng để đồng bộ tầng engine trong `lib/ziwei/` và gắn tag; kho câu luận, AI luận giải, frontend của trang thương mại không nằm trong phạm vi đồng bộ.
- **Issue**: sẽ đọc, nhưng trả lời có thể không kịp; issue có bước tái hiện hoặc ví dụ lá số cụ thể (năm tháng ngày giờ + giới tính + chỗ nào sai) được ưu tiên xử lý.
- **PR**: hoan nghênh, nhất là kiểm thử hồi quy, sửa khẩu kính, tài liệu. Thay đổi nào động đến khẩu kính lập lá số xin kèm căn cứ (nguyên văn cổ thư hoặc đối chiếu kiểm chứng được).

---

## IX. Giấy phép

Kho này chia bốn phần cấp phép. Ba phần đầu là giấy phép thoáng, **dùng thương mại không giới hạn**; riêng mục lời thầy Nghê **không được dùng thương mại**:

| Nội dung | Giấy phép | Nói gọn |
|------|------|------|
| **Code** (`lib/`, `app/`, `components/`) | [MIT License](./LICENSE) | Cứ lấy mà dùng, giữ lại file LICENSE là được |
| **Dữ liệu** (trong Releases: bộ dữ liệu mẫu 518 nghìn lá số v3.0, bộ dữ liệu luận giải 13 chiều v4.0) | [CC BY 4.0](./DATASET-LICENSE) · Yêu cầu attribution | Dùng thương mại cũng được, **ghi rõ nguồn dữ liệu là được** |
| **Cổ thư nguyên văn** (Cốt Tủy Phú, Tử Vi Đẩu Số Toàn Tập / Toàn Thư…) | Public Domain | Sách cổ đều thuộc phạm vi công cộng, không có bản quyền |
| **Lời thầy Nghê** ([`docs/tianji-ziwei/`](./docs/tianji-ziwei/)) | [CC BY-NC-SA 4.0](./docs/tianji-ziwei/LICENSE.md) | Được trích dẫn, đăng lại, ghi rõ nguồn; **không dùng thương mại**, bản chỉnh sửa dùng cùng giấy phép |

**Một câu**: code và dữ liệu cứ lấy mà dùng, thương mại cũng được, chỉ cần kèm link nguồn; lời thầy Nghê chỉ dùng cho học tập nghiên cứu phi thương mại (lời thầy Nghê trích trong phần luận giải của bộ dữ liệu cũng không nằm trong phạm vi cấp phép dữ liệu).

---

## X. Về dự án và liên hệ

### Ý tưởng dự án

Xem đầu trang. Muốn tự dựng? Code ở hết đây, cứ lấy mà dùng. Ngại phiền? Vào [ouranic.cn](https://ouranic.cn/?from=gh-readme) dùng trực tiếp.

### Công nghệ

- **Framework**: Next.js 16 (App Router)
- **Ngôn ngữ**: TypeScript
- **Kiểu dáng**: Tailwind CSS + hệ thiết kế CSS Variables
- **Lập lá số**: dựa trên [iztro](https://github.com/SylarLong/iztro) + lunar-javascript
- **Hoạt ảnh**: Framer Motion

### Liên hệ

- Nền tảng trực tuyến: [ouranic.cn](https://ouranic.cn/?from=gh-readme) (đã hoàn tất đăng ký ICP: Kinh ICP bị 2026069066-1)
- Góp ý, báo lỗi: xem [CONTRIBUTING.md](./CONTRIBUTING.md); trao đổi sử dụng xin vào [khu thảo luận](https://github.com/Renhuai123/ziwei-doushu/discussions)
- 💕 Bàn tay nhỏ phát tài bấm một cái: Tiểu Hồng Thư / Douyin / Xianyu / X theo dõi **王多鱼AI** để xem lên sóng sớm nhất + mở khoá thêm nhiều kiến thức Tử Vi～

---

## Ghi chú bản dịch (bản fork Việt hoá)

- Repo gốc viết bằng tiếng Trung và chưa có hệ thống i18n (không dùng next-intl hay file locale). Bản này dịch **trực tiếp chuỗi hiển thị trong code** — tức chuỗi tiếng Trung trong component/page được thay bằng tiếng Việt tại chỗ, không đổi tên biến, key hay logic. Nếu sau này muốn làm i18n đúng chuẩn (chuyển được Trung/Việt), đó là một bước riêng.
- Tên sao, cung, can chi, Tứ Hóa chỉ tra cứu khi hiển thị, qua bảng tra trong [`lib/ziwei/vi-names.ts`](./lib/ziwei/vi-names.ts) — key gốc không đổi nên engine, test hồi quy và dữ liệu không bị ảnh hưởng. Tên nào chưa có trong bảng sẽ hiển thị nguyên tên gốc.
- Nội dung **chưa dịch trong vòng này**: kho tri thức chi tiết (14 sao × 13 cung), bộ dữ liệu luận giải, 1.848 trích dẫn «Thiên Kỷ», trang hợp bàn, trang điều khoản/riêng tư, và cửa sổ thông báo khuyến mãi của site gốc.
- Nơi sinh trong form lập lá số: repo gốc chỉ có tỉnh/thành Trung Quốc. Bản này thêm mục **Việt Nam** (Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Hải Phòng, Cần Thơ, Huế, Nha Trang, Đà Lạt, Vinh, Quy Nhơn…) kèm kinh độ để hiệu chỉnh giờ mặt trời thật. Lưu ý: engine mặc định nhập giờ theo **giờ Bắc Kinh (UTC+8)** — người sinh ở Việt Nam (UTC+7) cần cộng thêm 1 giờ trước khi nhập, rồi chọn thành phố Việt Nam để hiệu chỉnh kinh độ.
