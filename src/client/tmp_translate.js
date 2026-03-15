const fs = require('fs');
const path = require('path');

function updateStatisticsPage() {
  const filePath = 'd:\\THSP\\TVLS-AdministrativeManagement\\src\\client\\src\\app\\[locale]\\(dashboard)\\dashboard\\statistics\\page.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import
  if (!content.includes('useTranslations')) {
    content = content.replace('import { Download,', 'import { useTranslations } from "next-intl";\nimport { Download,');
  }

  // Add hook inside component
  content = content.replace('export default function StatisticsPage() {', 'export default function StatisticsPage() {\n  const t = useTranslations("Statistics");');

  // Replace text
  content = content.replace('Thống kê nhân sự', '{t("title")}');
  content = content.replace(/Dữ liệu nhân sự cập nhật đến ngày \{new Date\(\)\.toLocaleDateString\("vi-VN"\)\}/g, 
    '{t("description", { date: new Date().toLocaleDateString() })}');
  content = content.replace(/>Xuất báo cáo</g, '>{t("exportReport")}<');
  
  content = content.replace(/>Tổng quát</g, '>{t("overall")}<');
  content = content.replace(/>Tổng nhân sự</g, '>{t("totalStaff")}<');
  
  // Nam: {stats.byGender?.male || 0}
  content = content.replace(/Nam: /g, '{t("male")}: ');
  content = content.replace(/Nữ: /g, '{t("female")}: ');

  // teachers
  content = content.replace(/>Giáo viên</g, '>{t("teachers")}<');
  content = content.replace(/>Biên chế</g, '>{t("tenured")}<');
  content = content.replace(/>Hợp đồng</g, '>{t("contract")}<');
  content = content.replace(/>Nhân viên</g, '>{t("staff")}<');
  content = content.replace(/>Lương vùng</g, '>{t("regionalSalary")}<');

  content = content.replace(/>Ban giám hiệu</g, '>{t("managementBoard")}<');

  // Rows 2
  content = content.replace(/>Tình trạng nhân sự</g, '>{t("personnelStatus")}<');
  content = content.replace(/>Tháng hiện tại</g, '>{t("currentMonth")}<');

  content = content.replace(/\{s\.label\}/g, '{t(`status.${s.key}`)}');

  content = content.replace(/>Thống kê theo dân tộc</g, '>{t("ethnicityStats")}<');

  // Row 3
  content = content.replace(/Danh sách Tổ bộ môn \(\{deptData\.length\} tổ\)/g, '{t("departmentList", { count: deptData.length })}');
  content = content.replace(/>Tổ \/ Bộ phận</g, '>{t("department")}<');
  content = content.replace(/>Số lượng</g, '>{t("quantity")}<');
  content = content.replace(/>Tỷ lệ</g, '>{t("ratio")}<');

  content = content.replace(/Khác \(\{remainingDepts\.length\} tổ còn lại\)/g, '{t("other", { count: remainingDepts.length })}');
  
  content = content.replace(/\{showAllDepts \? "Thu gọn" : "Xem tất cả tổ bộ môn"\}/g, '{showAllDepts ? t("collapse") : t("viewAll")}');

  content = content.replace(/>Thống kê theo cấp học</g, '>{t("educationLevelStats")}<');

  fs.writeFileSync(filePath, content);
  console.log("Updated Statistics Page");
}

function updateAgeStatisticsPage() {
  const filePath = 'd:\\THSP\\TVLS-AdministrativeManagement\\src\\client\\src\\app\\[locale]\\(dashboard)\\dashboard\\statistics\\age\\page.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('useTranslations')) {
    content = content.replace('import { Download, Info, TrendingUp } from "lucide-react";', 'import { useTranslations } from "next-intl";\nimport { Download, Info, TrendingUp } from "lucide-react";');
  }

  content = content.replace('export default function AgeStatisticsPage() {', 'export default function AgeStatisticsPage() {\n  const t = useTranslations("AgeStatistics");');

  // Title & description
  content = content.replace(/>Thống kê nhân sự theo độ tuổi</g, '>{t("title")}<');
  content = content.replace(/>\s*Dữ liệu cập nhật dựa trên hệ thống quản lý nhân sự tập trung\s*</g, '>{t("description")}<');

  // Filters logic
  // The FILTER_OPTIONS array is outside component, we need to map over it inside the component.
  // Instead of rewriting the array map, let's just translate the labels in JSX using the value.
  content = content.replace(/\{opt\.label\}/g, '{opt.value === "all_no_gvhd" ? t("filters.all") : opt.value === "Giáo viên" ? t("filters.teacher") : opt.value === "Nhân viên" ? t("filters.staff") : t("filters.contractTeacher")}');

  // Chart
  content = content.replace(/>\s*Biểu đồ phân bổ độ tuổi\s*</g, '>{t("chartTitle")}<');
  content = content.replace(/>\s*Đơn vị: Nhân sự\s*</g, '>{t("unit")}<');
  content = content.replace(/"Nhân sự"/g, 't("staffUnit")');

  // Summary
  content = content.replace(/>\s*Tổng số nhân sự\s*</g, '>{t("totalStaff")}<');
  content = content.replace(/>\s*Cập nhật hôm nay\s*</g, '>{t("updatedToday")}<');
  content = content.replace(/>\s*Độ tuổi phổ biến\s*</g, '>{t("mostCommonAge")}<');
  content = content.replace(/% Tổng số/g, '{t("percentTotal")}');

  // Table
  content = content.replace(/>\s*Thống kê chi tiết theo cấp học\s*</g, '>{t("detailedStats")}<');
  content = content.replace(/>\s*Xuất dữ liệu Excel\s*</g, '>{t("exportData")}<');
  content = content.replace(/>\s*Cấp học \/ Đơn vị\s*</g, '>{t("educationUnit")}<');
  content = content.replace(/>\s*Tổng cộng\s*</g, '>{t("total")}<');

  // Insights
  content = content.replace(/>\s*Nhận xét chuyên môn\s*</g, '>{t("insights")}<');
  content = content.replace(/>\s*Cơ cấu nhân sự tập trung chủ yếu ở độ tuổi vàng \(30-49 tuổi\)\. Đây là nguồn lực\s*giàu kinh nghiệm và đang trong giai đoạn cống hiến cao nhất cho nhà trường\.\s*</g, '>{t("insightsDesc", { ageRange: "30-49" })}<');

  content = content.replace(/>\s*Dự báo nhân sự\s*</g, '>{t("forecast")}<');
  content = content.replace(/>\s*Tỷ lệ nhân sự trẻ \(dưới 30 tuổi\) cần được chú trọng tuyển dụng thêm trong giai\s*đoạn tới để đảm bảo tính kế thừa liên tục cho các cấp học\.\s*</g, '>{t("forecastDesc")}<');

  fs.writeFileSync(filePath, content);
  console.log("Updated Age Statistics Page");
}

function updateMyProfilePage() {
  const filePath = 'd:\\THSP\\TVLS-AdministrativeManagement\\src\\client\\src\\app\\[locale]\\(dashboard)\\dashboard\\my-profile\\page.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('useTranslations')) {
    content = content.replace('import { Info,', 'import { useTranslations } from "next-intl";\nimport { Info,');
  }

  content = content.replace('export default function MyProfilePage() {', 'export default function MyProfilePage() {\n  const t = useTranslations("MyProfile");\n  const tCommon = useTranslations("Common");');

  // Strings
  content = content.replace(/>\s*Xuất hồ sơ\s*</g, '>{t("exportProfile")}<');
  // "Tính năng xuất hồ sơ đang được phát triển." - omit for now
  
  content = content.replace(/>\s*Lưu thay đổi\s*</g, '>{t("saveChanges")}<');
  content = content.replace(/value: "personal", label: "Thông tin cá nhân"/g, 'value: "personal", label: t("personalInfo")');
  content = content.replace(/value: "organization", label: "Tổ chức"/g, 'value: "organization", label: t("organization")');
  content = content.replace(/value: "work", label: "Công tác"/g, 'value: "work", label: t("workInfo")');
  content = content.replace(/value: "salary", label: "Phụ cấp lương"/g, 'value: "salary", label: t("salaryAllowance")');
  content = content.replace(/value: "qualification", label: "Trình độ"/g, 'value: "qualification", label: t("qualifications")');
  content = content.replace(/value: "evaluation", label: "Đánh giá"/g, 'value: "evaluation", label: t("evaluation")');
  content = content.replace(/value: "bank", label: "Ngân hàng"/g, 'value: "bank", label: t("bankInfo")');

  content = content.replace(/>Thông tin cơ bản</g, '>{t("basicInfo")}<');
  content = content.replace(/>Đặc điểm & Trạng thái</g, '>{t("characteristicsAndStatus")}<');
  content = content.replace(/>Liên hệ & Địa chỉ</g, '>{t("contactAndAddress")}<');

  content = content.replace(/>\s*Mã định danh\s*</g, '>{t("identifier")}<');
  content = content.replace(/>\s*Giới tính\s*</g, '>{t("gender")}<');
  
  // Select values
  content = content.replace(/>Nam</g, '>{t("male")}<');
  content = content.replace(/>Nữ</g, '>{t("female")}<');
  // Avoid replacing "Khác" everywhere carelessly, but there's a few. Let's just do standard strings.
  content = content.replace(/>\s*Ngày sinh\s*</g, '>{t("birthDate")}<');
  content = content.replace(/>\s*Số CMT\/CCCD\s*</g, '>{t("idCardNumber")}<');
  content = content.replace(/>\s*Ngày cấp\s*</g, '>{t("issueDate")}<');
  content = content.replace(/>\s*Nơi cấp\s*</g, '>{t("issuePlace")}<');
  
  content = content.replace(/>\s*Dân tộc\s*</g, '>{t("ethnicity")}<');
  content = content.replace(/>\s*Tôn giáo\s*</g, '>{t("religion")}<');
  content = content.replace(/>\s*Trạng thái CB\s*</g, '>{t("status")}<');
  
  content = content.replace(/>Đang công tác</g, '>{t("working")}<');
  content = content.replace(/>Nghỉ việc</g, '>{t("resigned")}<');
  // Transferred -> leave alone or ignore if not in dict
  // Maternity leave -> "onLeave"? Dict says "onLeave" : "On Leave"

  content = content.replace(/>\s*Ngày tuyển dụng\s*</g, '>{t("hireDate")}<');
  content = content.replace(/>\s*Quê quán\s*</g, '>{t("hometown")}<');

  // Input placeholders
  content = content.replace(/placeholder="Tỉnh\/Thành phố"/g, 'placeholder={t("provinceCity")}');
  content = content.replace(/placeholder="Xã\/Phường"/g, 'placeholder={t("ward")}'); // actually ward
  content = content.replace(/placeholder="Phường\/Xã"/g, 'placeholder={t("ward")}');
  // "Quận / Huyện" is not explicitly in place in the form I see, there is "Tỉnh", "Xã/Phường" and "Tổ/Thôn"

  content = content.replace(/>\s*Số điện thoại\s*</g, '>{t("phoneNumber")}<');
  content = content.replace(/>\s*Địa chỉ thường trú\s*</g, '>{t("permanentAddress")}<');

  content = content.replace(/>\s*Vui lòng kiểm tra kỹ các thông tin định danh \(CCCD, Ngày\s*sinh\) trước khi lưu\. Các thay đổi quan trọng sẽ cần được\s*phê duyệt bởi quản trị viên\.\s*</g, '>{t("verifyIdCardAlert")}<');

  fs.writeFileSync(filePath, content);
  console.log("Updated My Profile Page");
}

updateStatisticsPage();
updateAgeStatisticsPage();
updateMyProfilePage();
