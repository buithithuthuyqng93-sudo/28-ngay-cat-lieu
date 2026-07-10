export type WeekMeta = {
  number: 1 | 2 | 3 | 4;
  title: string;
  dayRange: string;
  startDay: number;
  endDay: number;
  description: string;
};

export const WEEKS: WeekMeta[] = [
  {
    number: 1,
    title: "Nền tảng tư duy cắt liều",
    dayRange: "Ngày 1 - 7",
    startDay: 1,
    endDay: 7,
    description:
      "Xây tư duy khai thác triệu chứng, nguyên tắc an toàn khi tư vấn không kê đơn và kỹ năng giao tiếp nền tảng tại quầy.",
  },
  {
    number: 2,
    title: "Nhóm bệnh thường gặp tại quầy",
    dayRange: "Ngày 8 - 14",
    startDay: 8,
    endDay: 14,
    description:
      "Hô hấp, tiêu hóa, sốt đau — xử trí thành thạo các nhóm triệu chứng khách hàng hỏi nhiều nhất mỗi ngày.",
  },
  {
    number: 3,
    title: "Da liễu, phụ khoa, trẻ em",
    dayRange: "Ngày 15 - 21",
    startDay: 15,
    endDay: 21,
    description:
      "Rèn luyện với các case cần sự tinh tế và thận trọng đặc biệt: da liễu, phụ khoa, nhi khoa.",
  },
  {
    number: 4,
    title: "Thực chiến và xây quy trình riêng",
    dayRange: "Ngày 22 - 28",
    startDay: 22,
    endDay: 28,
    description:
      "Tổng hợp case khó, người già - bệnh nền, và xây dựng quy trình tư vấn của riêng bạn để áp dụng ngay tại quầy.",
  },
];
