import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type LessonSeed = {
  day: number;
  week: number;
  title: string;
  objective: string;
  summary: string;
  checklist: string[];
  prompts: string[];
  challenge: string;
  duration: number;
};

const LESSONS: LessonSeed[] = [
  {
    day: 1,
    week: 1,
    title: "Tư duy cắt liều là gì?",
    objective:
      "Hiểu đúng khái niệm cắt liều, vai trò và giới hạn trách nhiệm của người đứng quầy khi tư vấn thuốc không kê đơn.",
    summary:
      "Cắt liều không kê đơn là hoạt động tư vấn và cung cấp thuốc OTC dựa trên khai thác triệu chứng, không phải \"bán thuốc theo yêu cầu\". Người đứng quầy cần phân biệt rõ ranh giới giữa tư vấn hỗ trợ triệu chứng nhẹ và các trường hợp bắt buộc phải giới thiệu đi khám. Bài học mở đầu giúp bạn định hình lại tư duy: mỗi lượt tư vấn là một lần ra quyết định lâm sàng thu nhỏ, cần sự cẩn trọng và trách nhiệm nghề nghiệp.",
    checklist: [
      "Luôn hỏi trước khi bán — không tự động đưa thuốc theo tên khách yêu cầu",
      "Xác định triệu chứng chính và mức độ nghiêm trọng",
      "Xác định đối tượng đặc biệt (trẻ em, thai phụ, người già, bệnh nền)",
      "Cân nhắc giới hạn kiến thức và thời gian tư vấn tại quầy",
      "Ghi nhớ: \"Không chắc chắn thì chuyển tuyến\"",
    ],
    prompts: [
      "Anh/chị bị như vậy bao lâu rồi ạ?",
      "Ngoài triệu chứng này ra, anh/chị có thấy mệt, sốt hay khó chịu gì khác không?",
    ],
    challenge:
      "Viết lại 3 câu hỏi mở đầu bạn sẽ dùng để bắt đầu tư vấn cho một khách hàng mới bước vào quầy, thay vì hỏi ngay \"cần mua gì\".",
    duration: 12,
  },
  {
    day: 2,
    week: 1,
    title: "Nguyên tắc an toàn khi tư vấn thuốc không kê đơn",
    objective: "Nắm vững các nguyên tắc an toàn cốt lõi khi cắt liều OTC để giảm thiểu rủi ro cho khách hàng.",
    summary:
      "Có 5 nguyên tắc an toàn nền tảng: đúng người (kiểm tra chống chỉ định, dị ứng), đúng thuốc (chọn hoạt chất phù hợp triệu chứng), đúng liều (theo cân nặng, tuổi, chức năng gan thận), đúng thời gian (giới hạn số ngày tự điều trị), và đúng giới hạn (biết khi nào dừng và chuyển tuyến). Bài học đi sâu vào cách áp dụng 5 nguyên tắc này trong tình huống thực tế tại quầy.",
    checklist: [
      "Hỏi tiền sử dị ứng thuốc trước khi tư vấn",
      "Hỏi các thuốc đang sử dụng để tránh tương tác",
      "Chọn hoạt chất, hàm lượng phù hợp độ tuổi/cân nặng",
      "Quy định rõ số ngày tối đa tự điều trị trước khi cần tái khám",
      "Luôn dặn dò dấu hiệu cần ngưng thuốc và đi khám",
    ],
    prompts: [
      "Anh/chị có đang dùng thuốc điều trị bệnh nào khác không ạ?",
      "Anh/chị có tiền sử dị ứng thuốc hay thức ăn gì không?",
    ],
    challenge: "Liệt kê 5 nguyên tắc an toàn theo cách hiểu của riêng bạn và cho 1 ví dụ minh hoạ mỗi nguyên tắc.",
    duration: 15,
  },
  {
    day: 3,
    week: 1,
    title: "Bộ câu hỏi khai thác triệu chứng",
    objective: "Thành thạo bộ câu hỏi khai thác triệu chứng theo 5 nhóm để không bỏ sót thông tin quan trọng.",
    summary:
      "Khung khai thác triệu chứng theo trình tự cố định: khởi phát, vị trí, tính chất, mức độ, yếu tố ảnh hưởng và triệu chứng kèm theo — giúp bạn hỏi đủ, hỏi đúng chỉ trong 2-3 phút. Thay vì hỏi lan man, hãy đi theo trình tự cố định để vừa nhanh vừa không bỏ sót dấu hiệu cảnh báo.",
    checklist: [
      "Khởi phát: triệu chứng xuất hiện khi nào, đột ngột hay từ từ",
      "Vị trí: ở đâu, có lan không",
      "Tính chất: đau âm ỉ, đau nhói, ho khan hay có đờm...",
      "Mức độ: ảnh hưởng sinh hoạt ở mức nhẹ, vừa hay nặng",
      "Yếu tố ảnh hưởng: điều gì làm tăng/giảm triệu chứng",
      "Triệu chứng kèm theo: có dấu hiệu nào khác đi kèm không",
    ],
    prompts: [
      "Cơn đau/triệu chứng này xuất hiện đột ngột hay tăng dần vậy anh/chị?",
      "Có gì làm anh/chị thấy đỡ hơn hoặc nặng hơn không?",
    ],
    challenge: "Áp dụng khung khai thác 6 nhóm để viết ra kịch bản hỏi cho tình huống \"khách hàng kêu đau bụng\".",
    duration: 15,
  },
  {
    day: 4,
    week: 1,
    title: "Khai thác tiền sử bệnh và thuốc đang dùng",
    objective: "Biết cách khai thác tiền sử bệnh nền, dị ứng và thuốc đang sử dụng để tránh tương tác, chống chỉ định.",
    summary:
      "Rất nhiều sự cố khi cắt liều đến từ việc bỏ sót tiền sử. Bài học hướng dẫn cách hỏi khéo léo, không gây khó chịu cho khách nhưng vẫn thu thập đủ thông tin: bệnh nền (tăng huyết áp, tiểu đường, gan thận), thuốc đang dùng (kể cả thực phẩm chức năng), và tiền sử dị ứng.",
    checklist: [
      "Hỏi có đang điều trị bệnh mạn tính nào không",
      "Hỏi tên các thuốc/thực phẩm chức năng đang dùng",
      "Hỏi tiền sử dị ứng thuốc, thức ăn",
      "Hỏi tiền sử phẫu thuật/nhập viện gần đây nếu liên quan",
      "Ghi chú lại thông tin nếu khách hàng quen thuộc, quay lại nhiều lần",
    ],
    prompts: [
      "Anh/chị có bệnh mạn tính như huyết áp, tiểu đường, dạ dày... không ạ?",
      "Ngoài thuốc này, anh/chị có dùng thêm thực phẩm chức năng nào không?",
    ],
    challenge:
      "Ghi lại 1 tình huống bạn từng gặp (hoặc hình dung) mà việc hỏi tiền sử giúp tránh được một lựa chọn thuốc không phù hợp.",
    duration: 12,
  },
  {
    day: 5,
    week: 1,
    title: "Nhận diện dấu hiệu cần chuyển tuyến",
    objective: "Nhận diện chính xác các dấu hiệu cảnh báo (red flags) cần giới thiệu khách đi khám thay vì tự điều trị.",
    summary:
      "Không phải mọi triệu chứng đều nên \"cắt liều tại quầy\". Bài học liệt kê các nhóm dấu hiệu nguy hiểm chung: sốt cao kéo dài, đau dữ dội đột ngột, khó thở, chảy máu bất thường, triệu chứng ở trẻ nhỏ/thai phụ có yếu tố nguy cơ, và triệu chứng không cải thiện sau thời gian tự điều trị hợp lý.",
    checklist: [
      "Sốt trên 39°C kéo dài trên 3 ngày không đáp ứng thuốc hạ sốt",
      "Đau dữ dội, đột ngột, không rõ nguyên nhân",
      "Khó thở, tím tái, đau ngực",
      "Nôn/tiêu chảy kèm dấu hiệu mất nước rõ",
      "Không cải thiện sau thời gian tự điều trị hợp lý (thường 3-5 ngày)",
      "Đối tượng đặc biệt có thêm yếu tố nguy cơ (trẻ dưới 3 tháng sốt, thai phụ ra huyết...)",
    ],
    prompts: [
      "Anh/chị đã dùng thuốc này bao lâu mà chưa đỡ vậy ạ?",
      "Bé có bỏ bú/bỏ ăn hoặc lừ đừ không ạ?",
    ],
    challenge: "Liệt kê 5 dấu hiệu chuyển tuyến bạn thấy dễ bị bỏ sót nhất trong công việc hàng ngày và lý do.",
    duration: 15,
  },
  {
    day: 6,
    week: 1,
    title: "Kỹ năng giao tiếp và xây dựng lòng tin",
    objective: "Rèn kỹ năng giao tiếp để khách hàng cởi mở chia sẻ triệu chứng và tin tưởng lời khuyên của bạn.",
    summary:
      "Giao tiếp tốt không chỉ là lịch sự mà là kỹ năng khai thác thông tin. Bài học chia sẻ cách đặt câu hỏi mở, lắng nghe chủ động, tránh thuật ngữ chuyên môn gây khó hiểu, và cách xử lý khi khách hàng nóng vội chỉ muốn \"lấy thuốc quen dùng\".",
    checklist: [
      "Chào hỏi thân thiện, tạo cảm giác thoải mái trước khi hỏi bệnh",
      "Dùng câu hỏi mở thay vì câu hỏi đóng có/không",
      "Diễn giải lại triệu chứng để xác nhận đã hiểu đúng",
      "Giải thích ngắn gọn lý do đưa ra lựa chọn thuốc",
      "Xử lý khéo khi khách vội hoặc chỉ muốn mua theo tên thuốc quen",
    ],
    prompts: [
      "Để em/tôi hiểu đúng thì anh/chị đang gặp tình trạng... đúng không ạ?",
      "Em/tôi tư vấn thêm 1 phút để chọn đúng thuốc phù hợp nhất cho anh/chị nhé.",
    ],
    challenge:
      "Viết lại 1 đoạn hội thoại mẫu bạn sẽ dùng khi khách hàng nói \"cho tôi mua thuốc X, đừng hỏi nhiều\".",
    duration: 12,
  },
  {
    day: 7,
    week: 1,
    title: "Tổng kết tuần 1 — Xây khung tư vấn 4 bước",
    objective: "Tổng hợp kiến thức tuần 1 thành một khung tư vấn 4 bước áp dụng nhất quán cho mọi ca tại quầy.",
    summary:
      "Khung 4 bước: (1) Chào hỏi và khai thác triệu chứng, (2) Khai thác tiền sử và sàng lọc dấu hiệu nguy hiểm, (3) Ra quyết định — tư vấn thuốc OTC hoặc chuyển tuyến, (4) Dặn dò sử dụng và hẹn tái khám nếu cần. Đây sẽ là khung xương sống bạn sẽ tinh chỉnh trong suốt chương trình.",
    checklist: [
      "Bước 1: Chào hỏi, khai thác triệu chứng",
      "Bước 2: Khai thác tiền sử, sàng lọc dấu hiệu nguy hiểm",
      "Bước 3: Ra quyết định tư vấn thuốc hoặc chuyển tuyến",
      "Bước 4: Dặn dò sử dụng, liều dùng, thời gian tái khám",
      "Ghi nhớ khung 4 bước và luyện tập cho đến khi thành phản xạ",
    ],
    prompts: ["Case tuần này bạn gặp có áp dụng đủ 4 bước không? Bước nào bạn hay bỏ qua nhất?"],
    challenge: "Viết ra khung tư vấn 4 bước của riêng bạn bằng ngôn ngữ tự nhiên, dễ nhớ, để dán tại quầy làm việc.",
    duration: 15,
  },
  {
    day: 8,
    week: 2,
    title: "Cảm lạnh và cúm — phân biệt và xử trí",
    objective: "Phân biệt cảm lạnh thông thường và cúm mùa để tư vấn thuốc và dặn dò phù hợp.",
    summary:
      "Cảm lạnh thường khởi phát từ từ với nghẹt/sổ mũi, đau họng nhẹ, ít sốt; cúm khởi phát đột ngột với sốt cao, đau nhức cơ toàn thân, mệt mỏi rõ rệt. Việc phân biệt giúp tư vấn đúng nhóm thuốc và mức độ theo dõi cần thiết.",
    checklist: [
      "Hỏi thời điểm khởi phát: đột ngột hay từ từ",
      "Hỏi mức độ sốt và đau nhức cơ toàn thân",
      "Đánh giá mức độ ảnh hưởng sinh hoạt, khả năng đi làm/học",
      "Sàng lọc nhóm nguy cơ cao (người già, bệnh nền, thai phụ) cần thận trọng hơn với cúm",
      "Dặn dò nghỉ ngơi, bù nước, theo dõi dấu hiệu trở nặng",
    ],
    prompts: ["Anh/chị có bị sốt cao và đau nhức người nhiều không, hay chỉ nghẹt mũi thôi?"],
    challenge: "Viết bảng so sánh nhanh (dạng gạch đầu dòng) giữa cảm lạnh và cúm mà bạn có thể nhớ và áp dụng ngay.",
    duration: 15,
  },
  {
    day: 9,
    week: 2,
    title: "Ho — ho khan, ho có đờm, ho kéo dài",
    objective: "Tư vấn đúng nhóm thuốc ho theo tính chất ho và nhận diện ho cần chuyển tuyến.",
    summary:
      "Phân loại ho khan/ho có đờm quyết định nhóm hoạt chất phù hợp (giảm ho hay long đờm). Ho kéo dài trên 2-3 tuần, ho ra máu, ho kèm sụt cân hoặc sốt kéo dài là dấu hiệu cần chuyển khám chuyên khoa hô hấp.",
    checklist: [
      "Xác định ho khan hay ho có đờm, màu sắc đờm nếu có",
      "Hỏi thời gian ho đã kéo dài bao lâu",
      "Hỏi có kèm sốt, khó thở, đau ngực không",
      "Sàng lọc ho ra máu, sụt cân — dấu hiệu cần chuyển khám ngay",
      "Tư vấn đúng nhóm giảm ho hoặc long đờm theo tính chất ho",
    ],
    prompts: [
      "Ho của anh/chị là ho khan hay có đờm ạ? Đờm màu gì?",
      "Tình trạng ho này kéo dài bao lâu rồi ạ?",
    ],
    challenge: "Liệt kê 3 câu hỏi bạn sẽ dùng để quyết định tư vấn thuốc giảm ho hay thuốc long đờm cho khách.",
    duration: 15,
  },
  {
    day: 10,
    week: 2,
    title: "Đau họng, viêm họng",
    objective: "Khai thác và tư vấn phù hợp cho các trường hợp đau họng, viêm họng thông thường tại quầy.",
    summary:
      "Đau họng do virus thường tự khỏi sau vài ngày, có thể hỗ trợ giảm đau, kháng viêm tại chỗ. Cần cảnh giác viêm họng có mủ trắng, sốt cao, sưng hạch cổ rõ — nhóm này cần khám để loại trừ viêm họng do liên cầu khuẩn cần kháng sinh theo đơn.",
    checklist: [
      "Hỏi/quan sát tình trạng họng: đỏ, có mủ trắng hay không",
      "Hỏi kèm sốt, sưng hạch cổ, khó nuốt",
      "Hỏi thời gian đau họng đã kéo dài",
      "Tư vấn súc họng, viên ngậm, giảm đau tại chỗ cho ca nhẹ",
      "Chuyển khám nếu nghi ngờ viêm họng liên cầu hoặc kéo dài không đỡ",
    ],
    prompts: [
      "Họng anh/chị có nổi mủ trắng hay chỉ đỏ rát thôi ạ?",
      "Anh/chị có sốt hoặc sờ thấy hạch ở cổ sưng không?",
    ],
    challenge:
      "Mô tả 1 tình huống đau họng bạn sẽ tư vấn tự điều trị, và 1 tình huống bạn sẽ chuyển khám — nêu rõ lý do phân biệt.",
    duration: 12,
  },
  {
    day: 11,
    week: 2,
    title: "Sốt ở người lớn — cắt liều hạ sốt an toàn",
    objective: "Tư vấn hạ sốt an toàn cho người lớn, đúng liều, đúng khoảng cách giữa các liều.",
    summary:
      "Paracetamol là lựa chọn hàng đầu cho hạ sốt tại quầy, cần lưu ý liều tối đa mỗi ngày và khoảng cách giữa các liều để tránh quá liều gây độc gan. Cân nhắc nhóm giảm đau kháng viêm thận trọng ở người có bệnh dạ dày, thận. Sốt cao liên tục không đáp ứng thuốc là dấu hiệu cần chuyển khám.",
    checklist: [
      "Hỏi nhiệt độ sốt cao nhất và thời gian sốt đã kéo dài",
      "Hỏi tiền sử bệnh gan, dạ dày, thận trước khi chọn thuốc hạ sốt",
      "Tư vấn đúng liều, đúng khoảng cách giữa các liều",
      "Dặn dò không phối hợp nhiều chế phẩm chứa cùng hoạt chất hạ sốt",
      "Chuyển khám nếu sốt trên 3 ngày không đáp ứng hoặc kèm dấu hiệu nguy hiểm",
    ],
    prompts: [
      "Anh/chị đã uống thuốc hạ sốt nào chưa, cách đây bao lâu ạ?",
      "Anh/chị có bệnh về gan hoặc dạ dày không ạ?",
    ],
    challenge: "Viết lại liều hạ sốt tối đa/ngày và khoảng cách giữa các liều mà bạn sẽ luôn dặn dò khách hàng.",
    duration: 15,
  },
  {
    day: 12,
    week: 2,
    title: "Đau đầu — phân biệt thường và nguy hiểm",
    objective: "Phân biệt đau đầu căng thẳng thông thường với các dấu hiệu đau đầu nguy hiểm cần chuyển khám gấp.",
    summary:
      "Đau đầu căng thẳng, đau nửa đầu thông thường có thể hỗ trợ giảm đau tại quầy. Đau đầu dữ dội đột ngột \"như sét đánh\", kèm sốt cứng gáy, rối loạn ý thức, yếu liệt tay chân, hoặc đau đầu sau chấn thương là dấu hiệu cấp cứu cần chuyển viện ngay.",
    checklist: [
      "Hỏi tính chất đau đầu: âm ỉ, căng, hay dữ dội đột ngột",
      "Hỏi có kèm sốt, cứng gáy, nôn vọt, rối loạn nhìn/nói/yếu liệt không",
      "Hỏi tiền sử đau đầu tương tự trước đây",
      "Hỏi có chấn thương đầu gần đây không",
      "Chuyển cấp cứu ngay nếu có dấu hiệu thần kinh khu trú hoặc đau đầu \"sét đánh\"",
    ],
    prompts: [
      "Cơn đau đầu này có khác gì so với những lần đau đầu trước của anh/chị không?",
      "Anh/chị có thấy nhìn mờ, nói khó hay yếu tay chân bên nào không?",
    ],
    challenge: "Liệt kê 4 dấu hiệu đau đầu nguy hiểm bạn sẽ luôn hỏi để sàng lọc trước khi tư vấn thuốc giảm đau.",
    duration: 15,
  },
  {
    day: 13,
    week: 2,
    title: "Tiêu chảy cấp ở người lớn",
    objective: "Tư vấn xử trí tiêu chảy cấp, ưu tiên bù nước và nhận diện dấu hiệu mất nước nặng.",
    summary:
      "Bù nước - điện giải là ưu tiên hàng đầu trong tiêu chảy cấp, không phải cầm tiêu chảy ngay lập tức. Cần đánh giá dấu hiệu mất nước (khát nhiều, tiểu ít, chóng mặt) và sàng lọc tiêu chảy có máu, sốt cao — cần khám thay vì tự điều trị.",
    checklist: [
      "Hỏi số lần đi ngoài/ngày và tính chất phân",
      "Hỏi có sốt, đau bụng dữ dội, phân có máu không",
      "Đánh giá dấu hiệu mất nước: khát nhiều, tiểu ít, mệt lả",
      "Ưu tiên tư vấn oresol bù nước đúng cách pha và uống",
      "Chuyển khám nếu tiêu chảy có máu, sốt cao, hoặc mất nước nặng",
    ],
    prompts: [
      "Anh/chị đi ngoài bao nhiêu lần một ngày rồi ạ? Phân có máu hay nhầy không?",
      "Anh/chị có thấy khát nhiều, chóng mặt hay tiểu ít hơn bình thường không?",
    ],
    challenge: "Viết hướng dẫn pha và uống oresol đúng cách mà bạn sẽ dặn dò khách hàng từng bước.",
    duration: 15,
  },
  {
    day: 14,
    week: 2,
    title: "Đầy hơi, khó tiêu, trào ngược — Tổng kết tuần 2",
    objective: "Tư vấn các rối loạn tiêu hóa thường gặp và tổng kết các nhóm bệnh đã học trong tuần.",
    summary:
      "Đầy hơi, khó tiêu, trào ngược dạ dày thực quản là nhóm than phiền phổ biến. Cần phân biệt triệu chứng cơ năng thông thường với dấu hiệu cảnh báo như nuốt nghẹn, sụt cân, nôn ra máu, đi ngoài phân đen — cần chuyển khám chuyên khoa tiêu hóa.",
    checklist: [
      "Hỏi liên quan bữa ăn: xuất hiện sau ăn, ăn no, ăn cay/dầu mỡ",
      "Hỏi có ợ nóng, ợ chua, cảm giác nóng rát sau xương ức không",
      "Sàng lọc dấu hiệu cảnh báo: nuốt nghẹn, sụt cân, nôn máu, phân đen",
      "Tư vấn thuốc trung hòa/giảm tiết acid phù hợp cho ca nhẹ",
      "Dặn dò điều chỉnh thói quen ăn uống, sinh hoạt kèm theo",
    ],
    prompts: [
      "Triệu chứng này có xuất hiện nhiều hơn sau khi ăn no hoặc ăn cay không ạ?",
      "Anh/chị có sụt cân gần đây hoặc nuốt thấy vướng không?",
    ],
    challenge: "Tổng kết tuần 2 — liệt kê 3 nhóm bệnh bạn tự tin nhất và 1 nhóm bạn cần ôn lại thêm.",
    duration: 15,
  },
  {
    day: 15,
    week: 3,
    title: "Dị ứng da, mề đay",
    objective: "Tư vấn xử trí dị ứng da, mề đay thông thường và nhận diện phản vệ cần cấp cứu.",
    summary:
      "Mề đay, dị ứng da nhẹ có thể hỗ trợ giảm ngứa tại quầy. Cần sàng lọc ngay các dấu hiệu phản vệ: khó thở, sưng môi/lưỡi/họng, tụt huyết áp, chóng mặt — đây là cấp cứu cần xử trí và chuyển viện ngay lập tức.",
    checklist: [
      "Hỏi thời điểm khởi phát, có liên quan thức ăn/thuốc/côn trùng đốt không",
      "Hỏi/quan sát mức độ lan rộng của tổn thương da",
      "Sàng lọc dấu hiệu phản vệ: khó thở, sưng môi lưỡi, chóng mặt, tụt huyết áp",
      "Tư vấn kháng histamin cho ca mề đay/dị ứng da nhẹ",
      "Chuyển cấp cứu ngay nếu nghi ngờ phản vệ",
    ],
    prompts: [
      "Anh/chị có thấy khó thở, sưng môi hoặc lưỡi không?",
      "Trước khi nổi mề đay, anh/chị có ăn gì lạ hoặc bị côn trùng đốt không?",
    ],
    challenge: "Viết ra 3 dấu hiệu phản vệ bạn sẽ luôn kiểm tra đầu tiên khi khách hàng đến vì nổi mề đay đột ngột.",
    duration: 15,
  },
  {
    day: 16,
    week: 3,
    title: "Nấm da, hắc lào, lang ben",
    objective: "Nhận diện và tư vấn các bệnh nấm da thường gặp tại quầy.",
    summary:
      "Hắc lào (nấm da hình vòng, ngứa, viền đỏ rõ), lang ben (mảng da đổi màu, ít ngứa), nấm kẽ chân là các bệnh da phổ biến. Tư vấn thuốc bôi kháng nấm đúng cách, đủ thời gian điều trị (thường 2-4 tuần) và dặn dò vệ sinh để tránh tái phát.",
    checklist: [
      "Hỏi hình dạng, vị trí tổn thương và mức độ ngứa",
      "Hỏi thời gian xuất hiện và có lan rộng không",
      "Tư vấn thuốc bôi kháng nấm và thời gian điều trị đủ liệu trình",
      "Dặn dò vệ sinh da, giữ khô thoáng, tránh dùng chung đồ cá nhân",
      "Chuyển khám nếu tổn thương lan rộng, không đáp ứng sau 2 tuần điều trị",
    ],
    prompts: [
      "Vùng da này có viền đỏ rõ và ngứa nhiều không ạ?",
      "Anh/chị đã bôi thuốc gì trước đó chưa, dùng bao lâu rồi?",
    ],
    challenge: "Viết hướng dẫn sử dụng thuốc bôi kháng nấm đúng cách (tần suất, thời gian, lưu ý) mà bạn sẽ dặn khách.",
    duration: 12,
  },
  {
    day: 17,
    week: 3,
    title: "Mụn trứng cá — tư vấn cơ bản",
    objective: "Tư vấn cơ bản cho mụn trứng cá mức độ nhẹ-vừa và nhận biết khi cần chuyển khám da liễu.",
    summary:
      "Mụn trứng cá nhẹ-vừa có thể hỗ trợ bằng sản phẩm bôi ngoài da không kê đơn kèm hướng dẫn chăm sóc da đúng cách. Mụn nặng, có nang/nốt viêm sâu, để lại sẹo hoặc không đáp ứng sau thời gian dùng hợp lý cần chuyển khám da liễu.",
    checklist: [
      "Đánh giá mức độ mụn: ít nhân mụn hay viêm nhiều, có nang/nốt không",
      "Hỏi các sản phẩm chăm sóc da đang dùng",
      "Tư vấn sản phẩm hỗ trợ phù hợp mức độ nhẹ-vừa",
      "Dặn dò chăm sóc da cơ bản: rửa mặt đúng cách, không nặn mụn",
      "Chuyển khám da liễu nếu mụn nặng, có sẹo hoặc không đáp ứng",
    ],
    prompts: [
      "Tình trạng mụn này đã kéo dài bao lâu, có xu hướng nặng lên không?",
      "Anh/chị đang dùng sản phẩm chăm sóc da nào khác không?",
    ],
    challenge: "Viết 3 lời khuyên chăm sóc da cơ bản bạn sẽ dặn kèm khi tư vấn sản phẩm trị mụn nhẹ.",
    duration: 12,
  },
  {
    day: 18,
    week: 3,
    title: "Viêm âm đạo do nấm — dấu hiệu và tư vấn ban đầu",
    objective: "Nhận diện dấu hiệu viêm âm đạo do nấm và tư vấn ban đầu tế nhị, đúng mực.",
    summary:
      "Viêm âm đạo do nấm Candida thường có biểu hiện ngứa, khí hư trắng đục như phô mai, không mùi hoặc mùi nhẹ. Cần tư vấn tế nhị, riêng tư, hỏi các dấu hiệu giúp phân biệt với viêm nhiễm do nguyên nhân khác — cần chuyển khám phụ khoa nếu nghi ngờ.",
    checklist: [
      "Tạo không gian tư vấn riêng tư, tế nhị",
      "Hỏi tính chất khí hư: màu sắc, mùi, kèm ngứa hay không",
      "Hỏi đây là lần đầu hay tái phát nhiều lần",
      "Tư vấn thuốc đặt/bôi kháng nấm không kê đơn phù hợp cho ca điển hình, tái phát ít",
      "Chuyển khám phụ khoa nếu triệu chứng không điển hình, tái phát nhiều lần, hoặc kèm ra máu bất thường",
    ],
    prompts: [
      "Khí hư của chị có màu trắng đục, kèm ngứa nhiều không ạ?",
      "Đây là lần đầu chị gặp tình trạng này hay đã bị nhiều lần rồi ạ?",
    ],
    challenge:
      "Viết cách bạn sẽ mở đầu tư vấn một cách tế nhị, tạo sự thoải mái cho khách hàng nữ khi hỏi về triệu chứng phụ khoa.",
    duration: 15,
  },
  {
    day: 19,
    week: 3,
    title: "Rối loạn kinh nguyệt nhẹ — khi nào cần chuyển khám",
    objective: "Tư vấn hỗ trợ các rối loạn kinh nguyệt nhẹ và nhận biết dấu hiệu cần chuyển khám phụ khoa.",
    summary:
      "Đau bụng kinh nguyên phát mức độ nhẹ-vừa có thể hỗ trợ bằng giảm đau không kê đơn. Rong kinh kéo dài, đau bụng kinh dữ dội tăng dần, chu kỳ bất thường kéo dài, hoặc đau kèm sốt là dấu hiệu cần chuyển khám phụ khoa để loại trừ nguyên nhân bệnh lý.",
    checklist: [
      "Hỏi mức độ đau, có ảnh hưởng sinh hoạt hàng ngày không",
      "Hỏi tính đều đặn của chu kỳ kinh nguyệt",
      "Hỏi lượng máu kinh, có bất thường so với bình thường không",
      "Tư vấn giảm đau phù hợp cho đau bụng kinh nguyên phát nhẹ-vừa",
      "Chuyển khám phụ khoa nếu đau dữ dội tăng dần, rong kinh, hoặc chu kỳ bất thường kéo dài",
    ],
    prompts: [
      "Cơn đau bụng kinh này có ảnh hưởng đến sinh hoạt hàng ngày của chị không?",
      "Chu kỳ kinh của chị có đều đặn không, lượng máu có gì bất thường không?",
    ],
    challenge:
      "Liệt kê 3 dấu hiệu rối loạn kinh nguyệt bạn sẽ luôn khuyên khách hàng đi khám phụ khoa thay vì tự điều trị.",
    duration: 12,
  },
  {
    day: 20,
    week: 3,
    title: "Sốt ở trẻ em — cắt liều hạ sốt theo cân nặng",
    objective: "Tư vấn hạ sốt an toàn cho trẻ em, tính liều theo cân nặng và nhận diện dấu hiệu nguy hiểm ở trẻ.",
    summary:
      "Liều hạ sốt cho trẻ cần tính theo cân nặng (mg/kg), không theo tuổi ước lượng. Trẻ dưới 3 tháng tuổi sốt là dấu hiệu cần khám ngay, không tự điều trị. Cần dặn dò kỹ phụ huynh về dấu hiệu trở nặng: li bì, bỏ bú, co giật, phát ban bất thường.",
    checklist: [
      "Hỏi cân nặng của trẻ để tính liều chính xác (mg/kg)",
      "Hỏi tuổi của trẻ — trẻ dưới 3 tháng sốt cần chuyển khám ngay",
      "Hỏi nhiệt độ sốt cao nhất và đáp ứng với thuốc hạ sốt trước đó",
      "Sàng lọc dấu hiệu nguy hiểm: li bì, bỏ bú/bỏ ăn, co giật, phát ban",
      "Dặn dò rõ liều lượng, khoảng cách liều và cách theo dõi tại nhà",
    ],
    prompts: [
      "Bé nặng bao nhiêu ký để em/tôi tính đúng liều cho bé ạ?",
      "Bé có bú/ăn uống bình thường không hay lừ đừ, quấy khóc nhiều?",
    ],
    challenge: "Viết công thức tính liều hạ sốt theo cân nặng (mg/kg) mà bạn sẽ luôn áp dụng khi tư vấn cho phụ huynh.",
    duration: 15,
  },
  {
    day: 21,
    week: 3,
    title: "Tiêu chảy, ho ở trẻ em — Tổng kết tuần 3",
    objective: "Tư vấn tiêu chảy và ho ở trẻ em, tổng kết các kỹ năng tuần 3.",
    summary:
      "Ở trẻ em, bù nước đúng cách và theo dõi dấu hiệu mất nước là ưu tiên hàng đầu khi tiêu chảy. Với ho ở trẻ, cần thận trọng với các thuốc ho người lớn không phù hợp cho trẻ nhỏ. Luôn ưu tiên chuyển khám khi trẻ dưới 2 tuổi có triệu chứng kéo dài hoặc dấu hiệu bất thường.",
    checklist: [
      "Hỏi cân nặng, tuổi của trẻ trước khi tư vấn bất kỳ thuốc nào",
      "Với tiêu chảy: ưu tiên oresol, sàng lọc dấu hiệu mất nước ở trẻ",
      "Với ho: thận trọng nhóm thuốc phù hợp độ tuổi, tránh thuốc ho người lớn cho trẻ nhỏ",
      "Luôn dặn phụ huynh theo dõi sát và tái khám nếu trẻ trở nặng",
      "Chuyển khám ngay với trẻ dưới 2 tuổi có triệu chứng kéo dài hoặc bất thường",
    ],
    prompts: [
      "Bé được bao nhiêu tháng/tuổi rồi ạ, để em/tôi tư vấn thuốc phù hợp?",
      "Bé có dấu hiệu mệt lả, tiểu ít hay khóc không có nước mắt không ạ?",
    ],
    challenge: "Tổng kết tuần 3 — viết ra 1 nguyên tắc bạn sẽ luôn nhớ khi tư vấn cho trẻ em, khác với người lớn.",
    duration: 15,
  },
  {
    day: 22,
    week: 4,
    title: "Người cao tuổi — tương tác thuốc và bệnh nền",
    objective: "Tư vấn an toàn cho người cao tuổi có nhiều bệnh nền và đang dùng nhiều loại thuốc.",
    summary:
      "Người cao tuổi thường dùng nhiều thuốc cùng lúc, tăng nguy cơ tương tác thuốc và tác dụng phụ. Chức năng gan thận suy giảm theo tuổi cũng ảnh hưởng đến liều dùng. Cần khai thác kỹ danh sách thuốc đang dùng và thận trọng khi thêm bất kỳ thuốc không kê đơn nào.",
    checklist: [
      "Hỏi đầy đủ danh sách thuốc đang sử dụng (kê đơn và không kê đơn)",
      "Hỏi các bệnh nền: tim mạch, tiểu đường, gan thận",
      "Thận trọng với nhóm thuốc dễ tương tác",
      "Ưu tiên liều thấp, theo dõi sát khi tư vấn cho người cao tuổi",
      "Khuyến khích người nhà đi cùng để hỗ trợ theo dõi và tuân thủ",
    ],
    prompts: [
      "Bác đang dùng những loại thuốc nào cho bệnh huyết áp/tiểu đường ạ?",
      "Bác có ai đi cùng hôm nay để hỗ trợ theo dõi thuốc không ạ?",
    ],
    challenge: "Liệt kê 3 nhóm thuốc bạn sẽ đặc biệt thận trọng khi tư vấn cho người cao tuổi và lý do.",
    duration: 15,
  },
  {
    day: 23,
    week: 4,
    title: "Phụ nữ mang thai và cho con bú",
    objective: "Nắm nguyên tắc thận trọng khi tư vấn cho phụ nữ mang thai và cho con bú.",
    summary:
      "Nhiều hoạt chất không kê đơn không được khuyến cáo hoặc cần thận trọng trong thai kỳ và cho con bú. Nguyên tắc an toàn nhất là ưu tiên các biện pháp không dùng thuốc trước, chỉ tư vấn thuốc khi thực sự cần thiết với hoạt chất đã có dữ liệu an toàn rõ ràng, đồng thời khuyến khích tham khảo ý kiến bác sĩ sản khoa.",
    checklist: [
      "Hỏi tuổi thai (nếu đang mang thai) hoặc bé đang bú mẹ bao nhiêu tháng",
      "Ưu tiên tư vấn biện pháp không dùng thuốc trước",
      "Chỉ tư vấn hoạt chất có dữ liệu an toàn rõ ràng cho thai kỳ/cho con bú",
      "Khuyến khích tham khảo bác sĩ sản khoa nếu triệu chứng kéo dài hoặc cần dùng thuốc",
      "Tránh tự ý tư vấn thuốc chưa chắc chắn về độ an toàn",
    ],
    prompts: [
      "Chị đang mang thai được mấy tuần/tháng rồi ạ?",
      "Bé nhà mình đang bú mẹ hoàn toàn hay có dùng thêm sữa ngoài ạ?",
    ],
    challenge: "Viết ra nguyên tắc \"khi không chắc chắn\" bạn sẽ áp dụng khi tư vấn cho phụ nữ mang thai/cho con bú.",
    duration: 15,
  },
  {
    day: 24,
    week: 4,
    title: "Case khó — khách hàng mô tả mơ hồ",
    objective: "Rèn kỹ năng khai thác thông tin khi khách hàng mô tả triệu chứng mơ hồ, thiếu hợp tác.",
    summary:
      "Không phải khách hàng nào cũng mô tả triệu chứng rõ ràng. Bài học chia sẻ kỹ thuật đặt câu hỏi gợi mở, dùng ví dụ cụ thể để giúp khách hàng diễn đạt tốt hơn, và cách xử lý khi khách hàng ngại chia sẻ hoặc trả lời qua loa.",
    checklist: [
      "Dùng câu hỏi cụ thể, có ví dụ minh họa thay vì câu hỏi trừu tượng",
      "Quan sát biểu hiện, thái độ của khách để hỏi thêm phù hợp",
      "Kiên nhẫn, không vội kết luận khi thông tin chưa đủ rõ",
      "Xác nhận lại thông tin bằng cách diễn giải lại cho khách xác nhận",
      "Nếu vẫn không đủ thông tin để tư vấn an toàn, khuyên khách đi khám",
    ],
    prompts: [
      "Anh/chị có thể mô tả cụ thể hơn cảm giác đó giống như thế nào không, ví dụ như đau nhói hay âm ỉ?",
      "Nếu phải so sánh mức độ khó chịu từ 1-10 thì anh/chị thấy khoảng mấy điểm ạ?",
    ],
    challenge:
      "Viết lại 1 tình huống bạn từng gặp khách hàng mô tả mơ hồ và cách bạn (sẽ) xử lý để khai thác đủ thông tin.",
    duration: 15,
  },
  {
    day: 25,
    week: 4,
    title: "Case khó — khách tự yêu cầu thuốc theo tên",
    objective: "Xử lý khéo léo tình huống khách hàng yêu cầu mua thuốc cụ thể theo tên mà không muốn được hỏi thêm.",
    summary:
      "Đây là tình huống thường gặp và dễ khiến người bán hàng bỏ qua bước khai thác triệu chứng. Bài học hướng dẫn cách vừa tôn trọng yêu cầu khách hàng vừa đảm bảo an toàn — hỏi ngắn gọn nhưng đủ để phát hiện chống chỉ định hoặc tình huống cần chuyển tuyến.",
    checklist: [
      "Vẫn hỏi ngắn gọn triệu chứng và mục đích dùng thuốc dù khách yêu cầu theo tên",
      "Kiểm tra nhanh chống chỉ định, tương tác trước khi bán",
      "Giải thích ngắn gọn vì sao cần hỏi thêm (vì sự an toàn của khách)",
      "Tôn trọng quyết định của khách nhưng đảm bảo đã cảnh báo rủi ro nếu có",
      "Từ chối bán và giải thích rõ nếu phát hiện chống chỉ định nghiêm trọng",
    ],
    prompts: [
      "Dạ em/tôi lấy thuốc liền, nhưng cho em/tôi hỏi nhanh anh/chị dùng thuốc này để trị triệu chứng gì ạ?",
      "Anh/chị có đang dùng thuốc nào khác để em/tôi kiểm tra không bị trùng hoạt chất không ạ?",
    ],
    challenge:
      "Viết kịch bản 2-3 câu bạn sẽ nói để hỏi thêm thông tin mà không làm khách hàng khó chịu khi họ yêu cầu mua thuốc theo tên.",
    duration: 12,
  },
  {
    day: 26,
    week: 4,
    title: "Xây dựng quy trình tiếp nhận ca của riêng bạn",
    objective:
      "Tổng hợp toàn bộ kiến thức đã học để xây dựng một quy trình tiếp nhận ca hoàn chỉnh, phù hợp với môi trường làm việc của bạn.",
    summary:
      "Một quy trình tốt cần rõ ràng, dễ nhớ và có thể áp dụng nhất quán cho mọi ca. Bài học hướng dẫn cách hệ thống hóa các bước từ chào hỏi, khai thác, sàng lọc, ra quyết định đến dặn dò thành một quy trình chuẩn của riêng bạn hoặc của nhà thuốc.",
    checklist: [
      "Xác định các bước cố định trong quy trình tiếp nhận ca",
      "Chuẩn hóa bộ câu hỏi khai thác triệu chứng và tiền sử",
      "Chuẩn hóa danh sách dấu hiệu cần chuyển tuyến theo từng nhóm bệnh",
      "Xây dựng tiêu chí rõ ràng để quyết định tư vấn hay chuyển khám",
      "Thử áp dụng quy trình với 1 ca thực tế và điều chỉnh nếu cần",
    ],
    prompts: ["Quy trình hiện tại của bạn tại nơi làm việc đang thiếu bước nào so với những gì đã học?"],
    challenge: "Viết ra quy trình tiếp nhận ca đầy đủ (4-6 bước) mà bạn sẽ áp dụng tại nơi làm việc của mình.",
    duration: 18,
  },
  {
    day: 27,
    week: 4,
    title: "Xây dựng kịch bản dặn dò khách hàng chuẩn",
    objective: "Xây dựng kịch bản dặn dò khách hàng chuẩn, đầy đủ và dễ hiểu sau khi tư vấn thuốc.",
    summary:
      "Dặn dò là bước thường bị làm qua loa nhất nhưng lại quyết định hiệu quả điều trị và an toàn của khách hàng. Một kịch bản dặn dò tốt cần bao gồm: cách dùng, liều dùng, thời điểm dùng, tác dụng phụ cần lưu ý, và dấu hiệu cần tái khám.",
    checklist: [
      "Dặn rõ cách dùng, liều dùng, thời điểm dùng thuốc trong ngày",
      "Dặn thời gian tối đa tự điều trị trước khi cần tái khám",
      "Cảnh báo tác dụng phụ thường gặp cần theo dõi",
      "Dặn dò bảo quản thuốc đúng cách",
      "Xác nhận lại khách hàng đã hiểu rõ bằng cách hỏi lại ngắn gọn",
    ],
    prompts: ["Anh/chị nhắc lại giúp em/tôi cách dùng thuốc này để em/tôi chắc chắn anh/chị đã nắm rõ nhé."],
    challenge: "Viết kịch bản dặn dò chuẩn (5 câu) bạn sẽ dùng cho mọi ca tư vấn thuốc không kê đơn.",
    duration: 15,
  },
  {
    day: 28,
    week: 4,
    title: "Tổng kết 28 ngày — Cam kết hành động",
    objective:
      "Tổng kết toàn bộ hành trình 28 ngày và xây dựng cam kết hành động cụ thể để duy trì thói quen tư vấn an toàn.",
    summary:
      "Chúc mừng bạn đã hoàn thành hành trình 28 ngày! Đây là lúc nhìn lại những gì đã học — từ tư duy nền tảng, các nhóm bệnh thường gặp, đến quy trình và kịch bản dặn dò của riêng bạn. Hãy biến những kiến thức này thành thói quen áp dụng hàng ngày tại quầy.",
    checklist: [
      "Xem lại quy trình tiếp nhận ca đã xây dựng ở Ngày 26",
      "Xem lại kịch bản dặn dò đã xây dựng ở Ngày 27",
      "Liệt kê 3 thay đổi cụ thể bạn sẽ áp dụng ngay tuần tới",
      "Lưu lại các checklist, tài nguyên để tham khảo khi cần",
      "Chia sẻ hành trình của bạn với cộng đồng học viên",
    ],
    prompts: ["Điều gì trong 28 ngày qua đã thay đổi cách bạn tư vấn tại quầy nhiều nhất?"],
    challenge:
      "Viết cam kết hành động của bạn: 3 điều cụ thể bạn sẽ áp dụng ngay trong tuần tới sau khi hoàn thành chương trình.",
    duration: 15,
  },
];

type ChallengeSeed = { day: number; title: string; description: string; level: "easy" | "medium" | "hard"; estimatedTime: string };

const CHALLENGES: ChallengeSeed[] = LESSONS.map((lesson) => {
  const level: "easy" | "medium" | "hard" = lesson.week === 1 ? "easy" : lesson.week === 4 ? "hard" : "medium";
  return {
    day: lesson.day,
    title: `Thử thách Ngày ${lesson.day}: ${lesson.title}`,
    description: lesson.challenge,
    level,
    estimatedTime: `${Math.max(10, lesson.duration - 3)} phút`,
  };
});

type CaseSeed = {
  slug: string;
  category: string;
  title: string;
  description: string;
  questions: string[];
  additional: string;
  management: string;
  redFlags: string[];
  counseling: string;
};

const CASE_STUDIES: CaseSeed[] = [
  {
    slug: "ho-hap-ho-khan-keo-dai",
    category: "ho-hap",
    title: "Ho khan kéo dài 2 tuần, không sốt",
    description:
      "Khách hàng nữ, 32 tuổi, đến quầy mua thuốc ho. Cho biết ho khan, không đờm, đã kéo dài khoảng 2 tuần, không sốt, không sụt cân. Trước đó có đợt cảm cúm nhẹ đã hết.",
    questions: [
      "Ho đã kéo dài bao lâu, có xu hướng nặng lên hay giảm dần?",
      "Ho có kèm sốt, khó thở, đau ngực không?",
      "Trước đó có bị cảm cúm, viêm họng gì không?",
      "Có tiền sử hen suyễn, trào ngược dạ dày hay dị ứng không?",
    ],
    additional:
      "Khách cho biết ho nhiều về đêm, không sốt, không khó thở. Có tiền sử trào ngược dạ dày nhẹ trước đây. Không hút thuốc lá.",
    management:
      "Ho khan kéo dài sau nhiễm virus đường hô hấp trên (ho hậu nhiễm) là tình trạng khá phổ biến, có thể kéo dài 3-8 tuần. Có thể tư vấn thuốc giảm ho khan không kê đơn trong thời gian ngắn. Tuy nhiên vì ho đã kéo dài 2 tuần và có yếu tố trào ngược, nên khuyên khách theo dõi thêm — nếu ho không giảm sau 3-4 tuần hoặc xuất hiện thêm triệu chứng, cần khám chuyên khoa hô hấp để loại trừ nguyên nhân khác.",
    redFlags: [
      "Ho ra máu",
      "Sốt cao kéo dài kèm ho",
      "Sụt cân không rõ nguyên nhân",
      "Khó thở, đau ngực",
      "Ho kéo dài trên 3-4 tuần không cải thiện",
    ],
    counseling:
      "Dặn khách theo dõi tính chất ho, tránh các yếu tố kích thích như khói bụi, đồ ăn cay nóng gần giờ ngủ (do có trào ngược). Nếu ho không giảm sau 1-2 tuần dùng thuốc hỗ trợ hoặc xuất hiện sốt, ho ra máu, khó thở — cần đi khám ngay.",
  },
  {
    slug: "ho-hap-tre-ho-dom-sot-nhe",
    category: "ho-hap",
    title: "Trẻ 4 tuổi ho có đờm kèm sốt nhẹ",
    description:
      "Phụ huynh đưa bé trai 4 tuổi đến quầy, bé ho có đờm 3 ngày nay, sốt nhẹ 37.8-38°C, vẫn ăn uống chơi bình thường.",
    questions: [
      "Bé sốt cao nhất bao nhiêu độ, đã dùng thuốc hạ sốt chưa?",
      "Bé có bú/ăn uống, chơi đùa bình thường không hay lừ đừ?",
      "Đờm của bé màu gì, bé có khó thở, thở nhanh không?",
      "Bé có tiền sử hen, dị ứng hay bệnh nền gì không?",
    ],
    additional:
      "Bé vẫn ăn chơi bình thường, không thở nhanh hay rút lõm ngực. Sốt đáp ứng tốt với thuốc hạ sốt. Không có tiền sử hen hay dị ứng.",
    management:
      "Đây là tình trạng viêm đường hô hấp trên thông thường ở trẻ, mức độ nhẹ vì bé vẫn ăn chơi bình thường, không có dấu hiệu suy hô hấp. Có thể tư vấn hạ sốt đúng liều theo cân nặng và thuốc ho phù hợp độ tuổi. Dặn phụ huynh theo dõi sát tại nhà.",
    redFlags: [
      "Thở nhanh, thở rít, rút lõm lồng ngực",
      "Sốt cao trên 39°C không đáp ứng thuốc hạ sốt",
      "Bé lừ đừ, bỏ bú/bỏ ăn",
      "Tím tái quanh môi",
      "Sốt kéo dài trên 3 ngày không cải thiện",
    ],
    counseling:
      "Dặn phụ huynh cho bé uống đủ nước, hạ sốt đúng liều theo cân nặng, theo dõi nhịp thở của bé. Nếu bé thở nhanh, mệt hơn, bỏ ăn hoặc sốt kéo dài không đáp ứng thuốc, cần đưa bé đi khám ngay, không tự điều trị kéo dài tại nhà.",
  },
  {
    slug: "tieu-hoa-dau-thuong-vi",
    category: "tieu-hoa",
    title: "Đau bụng vùng thượng vị, ợ nóng sau ăn",
    description:
      "Khách hàng nam, 45 tuổi, đến mua thuốc dạ dày. Đau âm ỉ vùng thượng vị, kèm ợ nóng, xuất hiện nhiều sau bữa ăn no hoặc ăn cay, đã vài tuần nay.",
    questions: [
      "Cơn đau có liên quan đến bữa ăn không, xuất hiện trước hay sau khi ăn?",
      "Có ợ nóng, ợ chua, cảm giác nóng rát sau xương ức không?",
      "Có sụt cân, nuốt nghẹn, hoặc đi ngoài phân đen không?",
      "Có đang dùng thuốc giảm đau kháng viêm thường xuyên không?",
    ],
    additional:
      "Đau xuất hiện nhiều sau ăn no, kèm ợ chua. Không sụt cân, không nuốt nghẹn, phân bình thường. Khách có thói quen uống cà phê nhiều và hay thức khuya do công việc.",
    management:
      "Triệu chứng phù hợp với trào ngược dạ dày thực quản hoặc viêm dạ dày mức độ nhẹ liên quan thói quen ăn uống sinh hoạt. Có thể tư vấn thuốc trung hòa/giảm tiết acid không kê đơn trong thời gian ngắn kèm điều chỉnh thói quen ăn uống. Vì không có dấu hiệu cảnh báo, có thể theo dõi thêm, nhưng nếu không cải thiện sau 1-2 tuần cần khám chuyên khoa tiêu hóa.",
    redFlags: [
      "Nuốt nghẹn, nuốt đau",
      "Sụt cân không rõ nguyên nhân",
      "Nôn ra máu hoặc dịch như bã cà phê",
      "Đi ngoài phân đen",
      "Đau dữ dội không đáp ứng thuốc",
    ],
    counseling:
      "Dặn khách hạn chế ăn quá no, tránh đồ ăn cay nóng nhiều dầu mỡ, hạn chế cà phê/rượu bia, không nằm ngay sau ăn, nâng cao đầu giường khi ngủ nếu hay ợ nóng về đêm. Tái khám nếu triệu chứng không cải thiện sau 1-2 tuần.",
  },
  {
    slug: "tieu-hoa-tieu-chay-cap",
    category: "tieu-hoa",
    title: "Tiêu chảy cấp sau khi ăn ở hàng quán",
    description:
      "Khách hàng nữ, 28 tuổi, tiêu chảy nhiều lần từ tối hôm qua sau khi ăn hải sản ở quán ăn, kèm đau bụng quặn, chưa sốt.",
    questions: [
      "Đi ngoài bao nhiêu lần rồi, phân có máu hay nhầy không?",
      "Có sốt, nôn ói kèm theo không?",
      "Có dấu hiệu khát nhiều, tiểu ít, chóng mặt không?",
      "Có ai khác cùng ăn cũng bị triệu chứng tương tự không?",
    ],
    additional:
      "Đi ngoài khoảng 6 lần từ tối qua, phân lỏng không máu. Có nôn ói 2 lần. Cảm thấy hơi khát, chưa chóng mặt nhiều. Có 1 người ăn cùng cũng có triệu chứng tương tự.",
    management:
      "Nghi ngờ ngộ độc thực phẩm/tiêu chảy cấp do nhiễm khuẩn từ thức ăn. Ưu tiên bù nước điện giải bằng oresol pha đúng cách, uống từng ngụm nhỏ nhiều lần đặc biệt sau mỗi lần đi ngoài hoặc nôn. Có thể tư vấn thêm men vi sinh hỗ trợ. Vì đã có dấu hiệu mất nước nhẹ (khát), cần theo dõi sát và dặn dò dấu hiệu cần đi khám ngay nếu nặng hơn.",
    redFlags: [
      "Phân có máu hoặc nhầy nhiều",
      "Sốt cao trên 39°C",
      "Dấu hiệu mất nước nặng: mắt trũng, da nhăn, tiểu rất ít hoặc không tiểu",
      "Đau bụng dữ dội khu trú",
      "Tiêu chảy kéo dài trên 3 ngày không cải thiện",
    ],
    counseling:
      "Hướng dẫn pha oresol đúng tỷ lệ theo hướng dẫn trên bao bì, uống từng ngụm nhỏ liên tục, không pha loãng hoặc đặc hơn khuyến cáo. Ăn thức ăn dễ tiêu, tránh đồ dầu mỡ, sữa trong vài ngày. Quay lại tái khám ngay nếu tiêu chảy nặng hơn, có máu, sốt cao, hoặc dấu hiệu mất nước rõ.",
  },
  {
    slug: "da-lieu-me-day-hai-san",
    category: "da-lieu",
    title: "Nổi mề đay toàn thân sau khi ăn hải sản",
    description:
      "Khách hàng nam, 25 tuổi, nổi mẩn ngứa toàn thân khoảng 1 giờ sau khi ăn tôm, không khó thở, tỉnh táo hoàn toàn.",
    questions: [
      "Có thấy khó thở, sưng môi, lưỡi, hoặc cổ họng không?",
      "Mẩn ngứa lan rộng đến đâu, có kèm chóng mặt không?",
      "Đây có phải lần đầu bị dị ứng hải sản không?",
      "Ngoài hải sản có ăn/tiếp xúc gì khác lạ không?",
    ],
    additional:
      "Không khó thở, không sưng môi lưỡi, tỉnh táo, sinh hiệu ổn định. Đây là lần thứ 2 bị dị ứng sau ăn tôm, lần trước cũng tự hết sau vài giờ.",
    management:
      "Đây là mề đay dị ứng thức ăn mức độ nhẹ, không có dấu hiệu phản vệ. Có thể tư vấn thuốc kháng histamin không kê đơn để giảm ngứa và mẩn. Dặn khách theo dõi sát trong vài giờ tới vì phản ứng dị ứng đôi khi có thể tiến triển nặng hơn.",
    redFlags: [
      "Khó thở, thở rít, cảm giác nghẹn ở cổ họng",
      "Sưng môi, lưỡi, mặt",
      "Chóng mặt, choáng váng, tụt huyết áp",
      "Mẩn lan nhanh kèm cảm giác mệt lả bất thường",
      "Tiền sử từng bị phản vệ nặng trước đây",
    ],
    counseling:
      "Dặn khách uống thuốc kháng histamin theo đúng liều, tránh ăn hải sản/tôm trong thời gian tới vì đã xác định là tác nhân dị ứng. Nếu xuất hiện khó thở, sưng mặt/môi, hoặc mẩn ngứa nặng hơn phải đến cấp cứu ngay lập tức, không chần chừ.",
  },
  {
    slug: "da-lieu-lang-ben",
    category: "da-lieu",
    title: "Mảng da đổi màu ở lưng, nghi lang ben",
    description:
      "Khách hàng nam, 22 tuổi, sinh viên, phát hiện nhiều mảng da trắng hồng nhỏ ở lưng và ngực, hơi ngứa nhẹ khi ra mồ hôi, xuất hiện khoảng 1 tháng nay.",
    questions: [
      "Các mảng da này có ngứa nhiều không, đặc biệt khi ra mồ hôi?",
      "Đã bôi thuốc gì trước đó chưa?",
      "Có ai trong gia đình/bạn cùng phòng bị tương tự không?",
      "Vùng da này có lan rộng thêm không?",
    ],
    additional:
      "Mảng da hơi ngứa khi ra mồ hôi, không đau, chưa bôi thuốc gì. Sinh hoạt ở ký túc xá, ra mồ hôi nhiều do khí hậu nóng ẩm.",
    management:
      "Biểu hiện phù hợp với lang ben — bệnh da liễu lành tính, phổ biến ở người ra mồ hôi nhiều, khí hậu nóng ẩm. Có thể tư vấn thuốc bôi/dầu gội kháng nấm dùng ngoài da theo đúng liệu trình. Dặn dò cần kiên trì vì mảng da đổi màu có thể cải thiện chậm dù đã hết nấm.",
    redFlags: [
      "Tổn thương lan rộng nhanh, kèm sưng đau",
      "Có mủ hoặc dấu hiệu bội nhiễm",
      "Không đáp ứng sau 3-4 tuần điều trị đúng cách",
      "Kèm sốt hoặc triệu chứng toàn thân",
    ],
    counseling:
      "Hướng dẫn dùng thuốc/dầu kháng nấm đúng liệu trình, giữ da khô thoáng, thay quần áo thường xuyên khi ra mồ hôi nhiều, tránh dùng chung khăn/quần áo với người khác. Dặn khách kiên trì vì màu da có thể cần vài tháng để đều màu trở lại sau khi hết nấm.",
  },
  {
    slug: "phu-khoa-viem-nam",
    category: "phu-khoa",
    title: "Ngứa vùng kín kèm khí hư trắng đục",
    description:
      "Khách hàng nữ, 29 tuổi, đến quầy tế nhị hỏi về tình trạng ngứa vùng kín kèm khí hư trắng đục như phô mai khoảng 3 ngày nay, không mùi hôi rõ.",
    questions: [
      "Khí hư có mùi hôi bất thường không?",
      "Đây là lần đầu hay đã từng bị tình trạng tương tự trước đây?",
      "Có đang mang thai hoặc mới dùng kháng sinh gần đây không?",
      "Có ra máu bất thường ngoài kỳ kinh không?",
    ],
    additional:
      "Khí hư không mùi hôi rõ rệt, chỉ ngứa nhiều. Đã từng bị 1 lần cách đây nửa năm, tự hết sau khi dùng thuốc đặt. Mới dùng một đợt kháng sinh điều trị viêm họng cách đây 1 tuần. Không mang thai, không ra máu bất thường.",
    management:
      "Biểu hiện điển hình của viêm âm đạo do nấm Candida, có thể liên quan đến việc mới dùng kháng sinh làm mất cân bằng hệ vi sinh. Vì triệu chứng điển hình và đã từng đáp ứng tốt với điều trị trước đây, có thể tư vấn thuốc đặt/kem bôi kháng nấm không kê đơn theo đúng hướng dẫn. Nếu không cải thiện hoặc tái phát nhiều lần cần khám phụ khoa để đánh giá kỹ hơn.",
    redFlags: [
      "Khí hư có mùi hôi nồng, màu vàng/xanh bất thường",
      "Ra máu âm đạo bất thường ngoài kỳ kinh",
      "Đau bụng dưới nhiều kèm sốt",
      "Tái phát nhiều lần trong thời gian ngắn (trên 4 lần/năm)",
      "Đang mang thai",
    ],
    counseling:
      "Hướng dẫn đặt thuốc đúng cách, đủ liệu trình dù triệu chứng đã giảm. Dặn giữ vệ sinh vùng kín đúng cách, mặc đồ lót thoáng khí, tránh thụt rửa sâu. Nếu triệu chứng không cải thiện sau liệu trình hoặc tái phát thường xuyên, khuyên khám phụ khoa để tìm nguyên nhân và điều trị triệt để hơn.",
  },
  {
    slug: "phu-khoa-dau-bung-kinh",
    category: "phu-khoa",
    title: "Đau bụng kinh ngày càng dữ dội hơn theo thời gian",
    description:
      "Khách hàng nữ, 34 tuổi, đến mua thuốc giảm đau bụng kinh, cho biết mức độ đau những tháng gần đây tăng dần, ảnh hưởng đến công việc, khác với trước đây.",
    questions: [
      "Mức độ đau này so với những chu kỳ trước có tăng lên không?",
      "Đau có ảnh hưởng đến sinh hoạt, phải nghỉ làm không?",
      "Lượng máu kinh có gì thay đổi so với trước không?",
      "Đau có xuất hiện cả ngoài kỳ kinh không?",
    ],
    additional:
      "Khách cho biết 6 tháng gần đây đau tăng dần rõ rệt, phải nghỉ làm 1-2 ngày mỗi kỳ kinh, khác hẳn trước đây. Lượng máu kinh cũng nhiều hơn trước, đôi khi thấy đau âm ỉ cả ngoài kỳ kinh.",
    management:
      "Đau bụng kinh tăng dần theo thời gian, kèm thay đổi lượng máu kinh và đau ngoài kỳ kinh là dấu hiệu không điển hình của đau bụng kinh nguyên phát thông thường, cần cảnh giác nguyên nhân bệnh lý. Không nên chỉ tư vấn giảm đau đơn thuần mà cần khuyên khách khám phụ khoa để được đánh giá và chẩn đoán chính xác.",
    redFlags: [
      "Đau tăng dần theo thời gian, khác với trước đây",
      "Lượng máu kinh thay đổi nhiều, rong kinh",
      "Đau xuất hiện cả ngoài kỳ kinh",
      "Đau ảnh hưởng nghiêm trọng đến sinh hoạt, công việc",
      "Đau kèm sốt hoặc khí hư bất thường",
    ],
    counseling:
      "Có thể tư vấn giảm đau tạm thời cho kỳ kinh hiện tại, nhưng cần giải thích rõ và khuyến khích khách đi khám phụ khoa sớm để tìm nguyên nhân, vì tính chất đau tăng dần là dấu hiệu không nên chủ quan tự điều trị kéo dài.",
  },
  {
    slug: "tre-em-sot-cao",
    category: "tre-em",
    title: "Trẻ 18 tháng sốt cao 39.5°C",
    description:
      "Phụ huynh bế bé gái 18 tháng đến quầy trong tình trạng lo lắng, bé sốt 39.5°C từ sáng, đã cho uống hạ sốt nhưng sốt vẫn cao.",
    questions: [
      "Bé nặng bao nhiêu ký để tính đúng liều thuốc?",
      "Đã cho uống thuốc hạ sốt gì, liều bao nhiêu, cách đây bao lâu?",
      "Bé có bú/ăn uống bình thường, có lừ đừ hay quấy khóc nhiều không?",
      "Bé có phát ban, co giật, hoặc nôn ói không?",
    ],
    additional:
      "Bé nặng 11kg, đã uống paracetamol cách đây 3 tiếng nhưng liều dùng không rõ do người nhà tự ước lượng. Bé quấy khóc nhiều, bú kém hơn bình thường, chưa co giật, chưa phát ban.",
    management:
      "Trẻ sốt cao 39.5°C không đáp ứng tốt với hạ sốt, kèm bú kém là dấu hiệu cần thận trọng. Cần hướng dẫn phụ huynh liều paracetamol chính xác theo cân nặng, kiểm tra lại liều đã dùng có đúng không. Vì bé dưới 2 tuổi sốt cao kèm bú kém, quấy khóc nhiều, nên khuyên phụ huynh đưa bé đi khám sớm thay vì tiếp tục tự theo dõi tại nhà.",
    redFlags: [
      "Trẻ dưới 3 tháng tuổi sốt bất kỳ mức độ nào",
      "Sốt cao không đáp ứng thuốc hạ sốt sau nhiều giờ",
      "Co giật do sốt",
      "Bú kém, bỏ bú, li bì khó đánh thức",
      "Phát ban bất thường kèm sốt",
    ],
    counseling:
      "Hướng dẫn tính lại liều paracetamol chính xác theo cân nặng 11kg, đảm bảo khoảng cách giữa các liều đúng quy định. Chườm ấm, mặc thoáng cho bé, bù đủ nước. Dặn phụ huynh nếu sau khi dùng đúng liều mà sốt không giảm trong 4-6 giờ, hoặc bé mệt hơn, cần đưa đi khám ngay, không chờ đợi thêm.",
  },
  {
    slug: "tre-em-tieu-chay-sot",
    category: "tre-em",
    title: "Bé 5 tuổi tiêu chảy 4 lần/ngày kèm sốt nhẹ",
    description:
      "Phụ huynh đưa bé trai 5 tuổi đến quầy, bé đi ngoài phân lỏng 4 lần trong ngày, sốt nhẹ 37.8°C, vẫn chơi đùa nhưng ăn uống kém hơn.",
    questions: [
      "Bé đi ngoài bao nhiêu lần rồi, phân có máu hay nhầy không?",
      "Bé có nôn ói kèm theo không?",
      "Bé có dấu hiệu khát nhiều, tiểu ít, môi khô không?",
      "Bé có ăn gì lạ hoặc đi học/đi chơi ăn ngoài gần đây không?",
    ],
    additional:
      "Phân lỏng không máu, không nhầy. Bé không nôn, vẫn chơi đùa nhưng ăn uống kém hơn thường ngày. Chưa thấy dấu hiệu mất nước rõ. Trước đó có ăn ở căng tin trường.",
    management:
      "Tình trạng tiêu chảy cấp mức độ nhẹ, bé vẫn tỉnh táo, chơi đùa bình thường, chưa có dấu hiệu mất nước. Ưu tiên tư vấn bù nước bằng oresol pha đúng cách theo hướng dẫn, cho bé uống từng ngụm nhỏ. Có thể tư vấn thêm men vi sinh hỗ trợ. Dặn phụ huynh theo dõi sát tại nhà và tái khám nếu có dấu hiệu trở nặng.",
    redFlags: [
      "Phân có máu hoặc nhầy nhiều",
      "Nôn ói liên tục không giữ được nước/thức ăn",
      "Dấu hiệu mất nước: môi khô, mắt trũng, tiểu rất ít, khóc không có nước mắt",
      "Sốt cao trên 39°C",
      "Bé lừ đừ, li bì bất thường",
    ],
    counseling:
      "Hướng dẫn phụ huynh pha oresol đúng tỷ lệ, cho bé uống từng ngụm nhỏ sau mỗi lần đi ngoài. Cho bé ăn thức ăn dễ tiêu, chia nhỏ bữa. Theo dõi sát số lần đi ngoài, tình trạng tiểu tiện và mức độ tỉnh táo của bé. Đưa bé đi khám ngay nếu xuất hiện các dấu hiệu mất nước hoặc tiêu chảy nặng hơn.",
  },
  {
    slug: "nguoi-gia-dau-dau-nhieu-thuoc",
    category: "nguoi-gia-benh-nen",
    title: "Cụ ông 70 tuổi đau đầu, đang điều trị huyết áp và tiểu đường",
    description:
      "Cụ ông 70 tuổi đến mua thuốc giảm đau đầu, cho biết đang điều trị tăng huyết áp và tiểu đường type 2, hiện dùng 3 loại thuốc kê đơn hàng ngày.",
    questions: [
      "Bác đang dùng những thuốc gì cho huyết áp và tiểu đường?",
      "Cơn đau đầu này có khác gì so với thường ngày không?",
      "Bác đã đo huyết áp gần đây chưa, chỉ số bao nhiêu?",
      "Bác có tiền sử bệnh gan, thận hay dạ dày không?",
    ],
    additional:
      "Cụ đang dùng thuốc hạ áp, thuốc hạ đường huyết, và một thuốc chống đông liều thấp. Đau đầu âm ỉ, đã từng bị tương tự khi huyết áp tăng cao trước đây. Chưa đo huyết áp hôm nay.",
    management:
      "Vì cụ có nhiều bệnh nền và đang dùng thuốc chống đông, cần đặc biệt thận trọng với nhóm giảm đau kháng viêm do nguy cơ tương tác và tăng nguy cơ chảy máu, kích ứng dạ dày. Nên ưu tiên đo huyết áp trước để loại trừ đau đầu do tăng huyết áp — nếu huyết áp cao, xử trí huyết áp là ưu tiên hàng đầu. Nếu cần giảm đau, ưu tiên lựa chọn ít tương tác hơn với liều thấp.",
    redFlags: [
      "Huyết áp đo được rất cao (trên 180/120mmHg)",
      "Đau đầu dữ dội đột ngột khác thường",
      "Kèm yếu liệt, nói khó, nhìn mờ",
      "Đau đầu không đáp ứng sau khi kiểm soát huyết áp",
      "Dấu hiệu chảy máu bất thường (do đang dùng thuốc chống đông)",
    ],
    counseling:
      "Khuyên cụ đo huyết áp ngay tại quầy hoặc cơ sở y tế gần nhất trước khi dùng bất kỳ thuốc giảm đau nào. Dặn dò tránh tự ý dùng thuốc giảm đau kháng viêm do đang dùng thuốc chống đông. Nhắc cụ tái khám định kỳ và mang theo đơn thuốc đang dùng khi đi khám để bác sĩ cân nhắc tương tác.",
  },
  {
    slug: "nguoi-gia-mat-ngu",
    category: "nguoi-gia-benh-nen",
    title: "Bà cụ 68 tuổi mất ngủ kéo dài, đang điều trị tim mạch",
    description:
      "Bà cụ 68 tuổi hỏi mua thuốc hỗ trợ giấc ngủ, cho biết mất ngủ kéo dài vài tuần nay, đang điều trị bệnh tim mạch.",
    questions: [
      "Bà đang dùng những thuốc tim mạch nào hàng ngày?",
      "Mất ngủ này liên quan đến lo lắng, căng thẳng hay có nguyên nhân khác không?",
      "Bà có triệu chứng khó thở khi nằm hoặc phải ngồi dậy giữa đêm không?",
      "Bà có đang dùng thuốc lợi tiểu không, có phải thức dậy đi tiểu đêm nhiều không?",
    ],
    additional:
      "Bà đang dùng thuốc lợi tiểu và thuốc chẹn beta cho bệnh tim. Mất ngủ chủ yếu do lo lắng chăm sóc chồng bệnh và phải thức dậy tiểu đêm 2-3 lần do thuốc lợi tiểu dùng vào buổi tối. Không khó thở khi nằm ngủ.",
    management:
      "Mất ngủ ở đây có nguyên nhân rõ ràng liên quan yếu tố tâm lý và tác dụng phụ tiểu đêm từ thuốc lợi tiểu dùng buổi tối. Cần thận trọng khi tư vấn thuốc an thần/hỗ trợ ngủ không kê đơn cho người cao tuổi có bệnh tim mạch do nguy cơ tương tác và tác dụng phụ (chóng mặt, té ngã). Nên ưu tiên tư vấn điều chỉnh giờ uống thuốc lợi tiểu và các biện pháp vệ sinh giấc ngủ không dùng thuốc trước.",
    redFlags: [
      "Khó thở khi nằm, phải ngồi dậy giữa đêm để thở",
      "Đau ngực kèm mất ngủ",
      "Chóng mặt, từng bị té ngã gần đây",
      "Mất ngủ kèm trầm cảm rõ rệt, có ý nghĩ tiêu cực",
      "Phù chân tăng lên bất thường",
    ],
    counseling:
      "Khuyên bà trao đổi với bác sĩ điều trị về việc chuyển giờ uống thuốc lợi tiểu sang buổi sáng để giảm tiểu đêm. Tư vấn các biện pháp vệ sinh giấc ngủ: hạn chế caffeine buổi chiều tối, tạo thói quen ngủ đúng giờ, thư giãn trước khi ngủ. Nếu mất ngủ kéo dài ảnh hưởng nhiều đến sức khỏe, khuyên khám để được đánh giá phù hợp, thận trọng với thuốc an thần khi đang dùng nhiều thuốc tim mạch.",
  },
];

type ResourceSeed = { slug: string; title: string; type: string; category: string; description: string; content: string };

const RESOURCES: ResourceSeed[] = [
  {
    slug: "checklist-tu-van-nhanh",
    title: "Checklist tư vấn nhanh tại quầy",
    type: "checklist",
    category: "chung",
    description: "8 bước áp dụng cho mọi ca tư vấn thuốc không kê đơn tại quầy.",
    content: `CHECKLIST TƯ VẤN NHANH TẠI QUẦY

1. Chào hỏi thân thiện, tạo cảm giác thoải mái cho khách hàng
2. Hỏi triệu chứng chính: khởi phát, vị trí, tính chất, mức độ
3. Hỏi triệu chứng kèm theo và yếu tố tăng/giảm
4. Hỏi tiền sử bệnh nền, dị ứng, thuốc đang dùng
5. Sàng lọc dấu hiệu cần chuyển tuyến (red flags)
6. Xác định đối tượng đặc biệt: trẻ em, thai phụ, người già, bệnh nền
7. Ra quyết định: tư vấn thuốc OTC phù hợp hoặc chuyển khám
8. Dặn dò cách dùng, liều dùng, thời gian tái khám nếu cần

Ghi nhớ: Không chắc chắn thì chuyển tuyến.`,
  },
  {
    slug: "checklist-dau-hieu-chuyen-tuyen",
    title: "Checklist sàng lọc dấu hiệu chuyển tuyến",
    type: "checklist",
    category: "chung",
    description: "Danh sách nhanh các dấu hiệu cảnh báo cần chuyển khách đi khám ngay.",
    content: `CHECKLIST DẤU HIỆU CẦN CHUYỂN TUYẾN

Toàn thân:
- Sốt cao trên 39°C kéo dài trên 3 ngày không đáp ứng thuốc
- Mệt lả, không cải thiện sau thời gian tự điều trị hợp lý (3-5 ngày)

Hô hấp:
- Khó thở, thở nhanh, tím tái, đau ngực
- Ho ra máu, ho kéo dài trên 3 tuần

Tiêu hóa:
- Nôn ra máu, đi ngoài phân đen hoặc có máu
- Đau bụng dữ dội, sụt cân không rõ nguyên nhân

Thần kinh:
- Đau đầu dữ dội đột ngột, yếu liệt, nói khó, nhìn mờ
- Co giật, rối loạn ý thức

Da / Dị ứng:
- Khó thở, sưng môi lưỡi họng, tụt huyết áp (nghi phản vệ)

Đối tượng đặc biệt:
- Trẻ dưới 3 tháng tuổi sốt bất kỳ mức độ nào
- Thai phụ ra huyết bất thường, đau bụng dữ dội
- Người cao tuổi có dấu hiệu bất thường kèm nhiều bệnh nền`,
  },
  {
    slug: "bo-cau-hoi-opqrst",
    title: "Bộ câu hỏi khai thác triệu chứng",
    type: "question-set",
    category: "chung",
    description: "Bộ câu hỏi theo trình tự 6 nhóm giúp khai thác triệu chứng nhanh và đầy đủ.",
    content: `BỘ CÂU HỎI KHAI THÁC TRIỆU CHỨNG

1. Khởi phát: "Triệu chứng này xuất hiện khi nào, đột ngột hay từ từ ạ?"
2. Vị trí: "Vị trí cụ thể ở đâu, có lan sang chỗ khác không?"
3. Tính chất: "Cảm giác đó là đau âm ỉ, đau nhói, hay nóng rát?"
4. Mức độ: "Mức độ ảnh hưởng đến sinh hoạt của anh/chị như thế nào?"
5. Yếu tố ảnh hưởng: "Có gì làm anh/chị thấy đỡ hơn hoặc nặng hơn không?"
6. Triệu chứng kèm theo: "Ngoài triệu chứng này, anh/chị có thấy mệt, sốt hay khó chịu gì khác không?"`,
  },
  {
    slug: "bo-cau-hoi-tien-su",
    title: "Bộ câu hỏi khai thác tiền sử và đối tượng đặc biệt",
    type: "question-set",
    category: "chung",
    description: "Câu hỏi giúp sàng lọc tiền sử bệnh, dị ứng và các đối tượng cần thận trọng.",
    content: `BỘ CÂU HỎI KHAI THÁC TIỀN SỬ

Bệnh nền & thuốc đang dùng:
- "Anh/chị có bệnh mạn tính như huyết áp, tiểu đường, dạ dày... không ạ?"
- "Anh/chị có đang dùng thuốc điều trị bệnh nào khác không?"
- "Anh/chị có tiền sử dị ứng thuốc hay thức ăn gì không?"

Đối tượng đặc biệt:
- "Chị có đang mang thai hoặc cho con bú không ạ?"
- "Bé nặng bao nhiêu ký, được bao nhiêu tháng/tuổi rồi ạ?"
- "Bác có ai đi cùng hôm nay để hỗ trợ theo dõi thuốc không ạ?"`,
  },
  {
    slug: "mau-quy-trinh-tiep-nhan-ca",
    title: "Mẫu quy trình tiếp nhận ca tại quầy",
    type: "process",
    category: "chung",
    description: "Quy trình chuẩn 4 bước để áp dụng nhất quán cho mọi ca tư vấn.",
    content: `MẪU QUY TRÌNH TIẾP NHẬN CA TẠI QUẦY

Bước 1 — Chào hỏi & khai thác triệu chứng
Chào hỏi thân thiện, dùng bộ câu hỏi khai thác triệu chứng theo trình tự cố định.

Bước 2 — Khai thác tiền sử & sàng lọc nguy cơ
Hỏi bệnh nền, dị ứng, thuốc đang dùng. Đối chiếu với checklist dấu hiệu chuyển tuyến.

Bước 3 — Ra quyết định
Nếu không có dấu hiệu nguy hiểm: tư vấn thuốc OTC phù hợp.
Nếu có dấu hiệu cảnh báo: giải thích rõ và khuyên khách đi khám.

Bước 4 — Dặn dò & theo dõi
Dặn cách dùng, liều dùng, tác dụng phụ cần lưu ý và thời điểm cần tái khám.
Xác nhận lại khách đã hiểu rõ trước khi kết thúc tư vấn.`,
  },
  {
    slug: "mau-quy-trinh-chuyen-tuyen",
    title: "Mẫu quy trình xử trí ca cần chuyển tuyến",
    type: "process",
    category: "chung",
    description: "Các bước xử trí khi phát hiện ca có dấu hiệu cần chuyển khám.",
    content: `MẪU QUY TRÌNH XỬ TRÍ CA CẦN CHUYỂN TUYẾN

1. Giữ bình tĩnh, không gây hoang mang cho khách hàng
2. Giải thích rõ ràng, dễ hiểu lý do cần đi khám (không dùng thuật ngữ chuyên môn)
3. Nếu là dấu hiệu cấp cứu (khó thở, phản vệ, đau ngực dữ dội...): hướng dẫn đến cơ sở y tế gần nhất ngay lập tức
4. Nếu là dấu hiệu cần khám sớm nhưng không cấp cứu: khuyên đặt lịch khám trong 1-2 ngày tới
5. Có thể hỗ trợ xử trí triệu chứng tạm thời trong lúc chờ khám nếu an toàn
6. Dặn dò các dấu hiệu cần quay lại/gọi cấp cứu ngay nếu triệu chứng nặng hơn`,
  },
  {
    slug: "mau-dan-do-dung-thuoc",
    title: "Mẫu dặn dò khách hàng khi dùng thuốc",
    type: "counseling-note",
    category: "chung",
    description: "Kịch bản dặn dò chuẩn 5 điểm cho mọi ca tư vấn thuốc không kê đơn.",
    content: `MẪU DẶN DÒ KHÁCH HÀNG KHI DÙNG THUỐC

1. "Anh/chị uống thuốc này [số lần] lần/ngày, mỗi lần cách nhau ít nhất [số giờ] tiếng."
2. "Uống sau khi ăn để tránh khó chịu dạ dày" (nếu áp dụng).
3. "Nếu dùng quá [số ngày] mà không đỡ, anh/chị nên đi khám thêm nhé."
4. "Trong quá trình dùng nếu thấy [tác dụng phụ cần lưu ý], hãy ngưng thuốc và liên hệ lại."
5. "Anh/chị nhắc lại giúp em/tôi cách dùng để em/tôi chắc chắn mình đã tư vấn rõ ràng nhé."`,
  },
  {
    slug: "mau-dan-do-cho-tre-em",
    title: "Mẫu dặn dò dành cho phụ huynh khi mua thuốc cho trẻ",
    type: "counseling-note",
    category: "tre-em",
    description: "Kịch bản dặn dò riêng cho phụ huynh khi tư vấn thuốc cho trẻ em.",
    content: `MẪU DẶN DÒ CHO PHỤ HUYNH

1. "Liều thuốc này được tính theo cân nặng [số] kg của bé, ba/mẹ nhớ đo đúng dụng cụ đong kèm theo."
2. "Cho bé uống cách nhau ít nhất [số giờ] tiếng, không quá [số lần] lần trong 24 giờ."
3. "Theo dõi bé có bú/ăn uống bình thường không, có lừ đừ hay quấy khóc bất thường không."
4. "Nếu bé sốt cao không hạ sau khi dùng đúng liều, hoặc có dấu hiệu co giật, bỏ bú, phát ban — đưa bé đi khám ngay."
5. "Bảo quản thuốc xa tầm tay trẻ em, kiểm tra hạn dùng trước mỗi lần sử dụng."`,
  },
];

async function main() {
  console.log("Seeding lessons...");
  const lessonByDay = new Map<number, string>();
  for (const lesson of LESSONS) {
    const { checklist, prompts, ...rest } = lesson;
    const record = await prisma.lesson.upsert({
      where: { day: lesson.day },
      update: { ...rest, checklist, prompts, videoUrl: "" },
      create: { ...rest, checklist, prompts, videoUrl: "" },
    });
    lessonByDay.set(lesson.day, record.id);
  }

  console.log("Seeding challenges...");
  for (const challenge of CHALLENGES) {
    await prisma.challenge.upsert({
      where: { day: challenge.day },
      update: { ...challenge, lessonId: lessonByDay.get(challenge.day) },
      create: { ...challenge, lessonId: lessonByDay.get(challenge.day) },
    });
  }

  console.log("Seeding case studies...");
  for (const c of CASE_STUDIES) {
    await prisma.caseStudy.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  console.log("Seeding resources...");
  for (const r of RESOURCES) {
    await prisma.resource.upsert({ where: { slug: r.slug }, update: r, create: r });
  }

  console.log("Seeding demo accounts...");
  const demoPasswordHash = await bcrypt.hash("hoctap123", 10);
  const demoCreatedAt = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000);
  const demoPaidAt = demoCreatedAt;

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@capliu28ngay.vn" },
    update: { passwordHash: demoPasswordHash, createdAt: demoCreatedAt, paidAt: demoPaidAt },
    create: {
      name: "Nguyễn Minh Anh",
      email: "demo@capliu28ngay.vn",
      passwordHash: demoPasswordHash,
      createdAt: demoCreatedAt,
      paidAt: demoPaidAt,
    },
  });

  const otherPasswordHash = await bcrypt.hash("khongdangnhap", 10);
  const communityAuthors = await Promise.all([
    prisma.user.upsert({
      where: { email: "hong.duocsi@capliu28ngay.vn" },
      update: {},
      create: { name: "Trần Thị Hồng — Dược sĩ, Nhà thuốc An Khang", email: "hong.duocsi@capliu28ngay.vn", passwordHash: otherPasswordHash },
    }),
    prisma.user.upsert({
      where: { email: "minh.sinhvien@capliu28ngay.vn" },
      update: {},
      create: { name: "Lê Văn Minh — Sinh viên Dược năm 4", email: "minh.sinhvien@capliu28ngay.vn", passwordHash: otherPasswordHash },
    }),
  ]);

  console.log("Seeding demo progress & submissions...");
  const msPerDay = 24 * 60 * 60 * 1000;
  const now = Date.now();

  for (let day = 1; day <= 8; day++) {
    const lessonId = lessonByDay.get(day);
    if (!lessonId) continue;
    const completedAt = new Date(now - (8 - day) * msPerDay);
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: demoUser.id, lessonId } },
      update: { completedAt },
      create: { userId: demoUser.id, lessonId, completedAt },
    });
  }

  const demoSubmissions: { day: number; type: "text" | "link"; content: string; featured?: boolean }[] = [
    {
      day: 1,
      type: "text",
      content:
        "3 câu hỏi mở đầu của tôi: (1) Anh/chị đang gặp vấn đề gì để em hỗ trợ ạ? (2) Tình trạng này xuất hiện từ khi nào rồi ạ? (3) Ngoài triệu chứng này anh/chị còn thấy khó chịu gì khác không ạ?",
    },
    {
      day: 2,
      type: "text",
      content:
        "5 nguyên tắc an toàn tôi áp dụng: đúng người (hỏi dị ứng trước), đúng thuốc (chọn theo triệu chứng), đúng liều (theo cân nặng/tuổi), đúng thời gian (tối đa 3-5 ngày tự điều trị), đúng giới hạn (chuyển khám khi không chắc chắn).",
    },
    {
      day: 3,
      type: "text",
      content:
        "Kịch bản hỏi đau bụng: Đau từ khi nào? Đau ở vị trí nào, có lan không? Đau âm ỉ hay quặn từng cơn? Mức độ ảnh hưởng sinh hoạt ra sao? Có sốt, nôn, tiêu chảy kèm theo không?",
    },
    {
      day: 4,
      type: "text",
      content:
        "Có lần một khách hàng lớn tuổi hỏi mua thuốc giảm đau, sau khi hỏi tiền sử mới biết bác đang uống thuốc chống đông máu — nên tôi đã tư vấn loại giảm đau an toàn hơn thay vì loại có thể gây tương tác.",
    },
    {
      day: 5,
      type: "text",
      content:
        "5 dấu hiệu dễ bỏ sót: sốt kéo dài ở trẻ nhỏ, đau đầu khác thường ở người có tiền sử huyết áp, tiêu chảy kèm mất nước ở người già, ho kéo dài không rõ nguyên nhân, mẩn ngứa lan nhanh nghi dị ứng nặng.",
    },
    {
      day: 6,
      type: "text",
      content:
        "Khi khách nói \"cho tôi thuốc X thôi đừng hỏi nhiều\", tôi sẽ nói: \"Dạ em lấy liền cho anh/chị, chỉ xin hỏi nhanh 1 câu để chắc chắn thuốc phù hợp và an toàn cho mình thôi ạ.\"",
    },
    {
      day: 7,
      type: "text",
      content:
        "Khung 4 bước của tôi: Hỏi kỹ - Sàng lọc nguy cơ - Chọn thuốc phù hợp - Dặn dò rõ ràng. Tôi sẽ in ra dán ở quầy để nhắc bản thân áp dụng mỗi ca.",
      featured: true,
    },
    {
      day: 8,
      type: "link",
      content: "https://drive.google.com/example-bang-so-sanh-cam-cum",
      featured: true,
    },
  ];

  for (const s of demoSubmissions) {
    const challenge = await prisma.challenge.findUnique({ where: { day: s.day } });
    if (!challenge) continue;
    await prisma.submission.upsert({
      where: { userId_challengeId: { userId: demoUser.id, challengeId: challenge.id } },
      update: { type: s.type, content: s.content, featured: s.featured ?? false },
      create: { userId: demoUser.id, challengeId: challenge.id, type: s.type, content: s.content, featured: s.featured ?? false },
    });
  }

  const communitySubmissions = [
    {
      userId: communityAuthors[0].id,
      day: 11,
      type: "text" as const,
      content:
        "Liều paracetamol tối đa cho người lớn tôi luôn dặn là không quá 4g/ngày, mỗi liều cách nhau tối thiểu 4-6 giờ, và nhắc khách kiểm tra không dùng trùng hoạt chất với thuốc cảm khác.",
      featured: true,
    },
    {
      userId: communityAuthors[1].id,
      day: 20,
      type: "text" as const,
      content:
        "Công thức tôi áp dụng: liều paracetamol 10-15mg/kg/lần, cách nhau 4-6 giờ, tối đa 4 lần/ngày. Tôi luôn hỏi cân nặng thay vì áng chừng theo tuổi để tính chính xác hơn.",
      featured: true,
    },
    {
      userId: communityAuthors[0].id,
      day: 27,
      type: "text" as const,
      content:
        "Kịch bản dặn dò 5 câu của tôi đã giúp khách nhớ cách dùng thuốc tốt hơn hẳn, đặc biệt câu cuối nhờ khách nhắc lại — nhiều khách trước đó hiểu sai liều dùng mà tôi không hề biết.",
    },
  ];

  for (const s of communitySubmissions) {
    const challenge = await prisma.challenge.findUnique({ where: { day: s.day } });
    if (!challenge) continue;
    await prisma.submission.upsert({
      where: { userId_challengeId: { userId: s.userId, challengeId: challenge.id } },
      update: { type: s.type, content: s.content, featured: s.featured ?? false },
      create: { userId: s.userId, challengeId: challenge.id, type: s.type, content: s.content, featured: s.featured ?? false },
    });
  }

  console.log("Seed completed.");
  console.log("Demo login: demo@capliu28ngay.vn / hoctap123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
