import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Hướng dẫn sử dụng</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Hệ thống Quản lý Hành chính – Trường Thực hành Sư phạm, Đại học Trà Vinh
        </p>
      </div>

      <div className="prose prose-slate max-w-none dark:prose-invert">
        <h2>1. Đăng nhập hệ thống</h2>
        <p>
          Truy cập hệ thống bằng địa chỉ email công vụ và mật khẩu được cấp bởi quản trị viên. Nếu quên mật khẩu,
          liên hệ quản trị viên để được cấp lại.
        </p>
        <ul>
          <li>Nhập email và mật khẩu tại trang đăng nhập.</li>
          <li>Nhấn <strong>Đăng nhập</strong> để vào hệ thống.</li>
          <li>Hệ thống hỗ trợ đăng nhập bằng tài khoản Google (nếu được cấu hình).</li>
        </ul>

        <h2>2. Quản lý hồ sơ cá nhân</h2>
        <p>
          Vào <strong>Hồ sơ cá nhân</strong> để xem và cập nhật thông tin cá nhân, ảnh đại diện và chữ ký số.
        </p>
        <ul>
          <li>Cập nhật ảnh đại diện: nhấn vào ảnh hiện tại và chọn ảnh mới.</li>
          <li>Đổi mật khẩu: vào <strong>Cài đặt tài khoản</strong> &gt; <strong>Đổi mật khẩu</strong>.</li>
          <li>Thiết lập chữ ký số tại mục <strong>Chữ ký số</strong>.</li>
        </ul>

        <h2>3. Xin nghỉ phép</h2>
        <ul>
          <li>Vào <strong>Quản lý nghỉ phép</strong> &gt; nhấn <strong>Tạo đơn nghỉ phép</strong>.</li>
          <li>Chọn loại nghỉ phép, ngày bắt đầu, ngày kết thúc và nhập lý do.</li>
          <li>Nhấn <strong>Gửi đơn</strong> để chuyển đơn đến người phê duyệt.</li>
          <li>Theo dõi trạng thái đơn tại danh sách nghỉ phép (Chờ duyệt / Đã duyệt / Từ chối).</li>
        </ul>

        <h2>4. Tạo và theo dõi công lệnh</h2>
        <ul>
          <li>Vào <strong>Quản lý công lệnh</strong> &gt; nhấn <strong>Tạo công lệnh</strong>.</li>
          <li>Điền tiêu đề, nội dung công việc, người phụ trách và thời gian thực hiện.</li>
          <li>Sau khi tạo, công lệnh sẽ ở trạng thái <strong>Chờ duyệt</strong>.</li>
          <li>Ban Giám hiệu hoặc quản lý sẽ phê duyệt và ký duyệt điện tử.</li>
        </ul>

        <h2>5. Báo hỏng thiết bị</h2>
        <ul>
          <li>Vào <strong>Báo hỏng thiết bị</strong> &gt; nhấn <strong>Tạo phiếu báo hỏng</strong>.</li>
          <li>Chọn thiết bị bị hỏng, mô tả lỗi và đính kèm ảnh (nếu có).</li>
          <li>Phiếu sẽ được chuyển đến kỹ thuật viên xử lý.</li>
          <li>Theo dõi tiến trình sửa chữa tại danh sách báo hỏng.</li>
        </ul>

        <h2>6. Sử dụng Trợ lý AI</h2>
        <p>
          Nhấn vào biểu tượng robot ở góc dưới bên phải màn hình để mở cửa sổ trợ lý AI. Trợ lý có thể giúp:
        </p>
        <ul>
          <li>Tra cứu thông tin nhân sự, số điện thoại, email đồng nghiệp.</li>
          <li>Kiểm tra lịch nghỉ phép, số ngày phép còn lại.</li>
          <li>Xem danh sách thiết bị hỏng và trạng thái sửa chữa.</li>
          <li>Tra cứu công lệnh được giao.</li>
          <li>Hướng dẫn điều hướng đến các tính năng trong hệ thống.</li>
        </ul>
        <p>Trợ lý hỗ trợ cả tiếng Việt và tiếng Anh.</p>

        <h2>7. Hỗ trợ kỹ thuật</h2>
        <p>
          Nếu gặp sự cố kỹ thuật hoặc cần hỗ trợ thêm, vui lòng liên hệ phòng Công nghệ thông tin –
          Trường Thực hành Sư phạm, Đại học Trà Vinh hoặc sử dụng tính năng báo hỏng trong hệ thống.
        </p>
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/terms" className="text-primary hover:underline">Điều khoản sử dụng</Link>
        <Link href="/privacy" className="text-primary hover:underline">Chính sách bảo mật</Link>
      </div>
    </div>
  );
}
