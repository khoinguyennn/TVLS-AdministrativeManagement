import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Chính sách bảo mật</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Cập nhật lần cuối: tháng 01 năm 2026</p>
      </div>

      <div className="prose prose-slate max-w-none dark:prose-invert">
        <p>
          Trường Thực hành Sư phạm – Đại học Trà Vinh cam kết bảo vệ quyền riêng tư và thông tin cá nhân của
          tất cả người dùng trong hệ thống quản lý hành chính nội bộ.
        </p>

        <h2>1. Thông tin chúng tôi thu thập</h2>
        <ul>
          <li>Thông tin định danh: họ tên, mã cán bộ, địa chỉ email công vụ.</li>
          <li>Thông tin liên lạc: số điện thoại, địa chỉ nơi ở (nếu được cung cấp).</li>
          <li>Dữ liệu hoạt động: lịch sử đăng nhập, thao tác trên hệ thống, nhật ký công việc.</li>
          <li>Hồ sơ nhân sự: bằng cấp, hợp đồng lao động, quá trình công tác.</li>
        </ul>

        <h2>2. Mục đích sử dụng thông tin</h2>
        <ul>
          <li>Quản lý hồ sơ nhân sự và các nghiệp vụ hành chính nội bộ.</li>
          <li>Xử lý đơn xin nghỉ phép, công lệnh và báo hỏng thiết bị.</li>
          <li>Liên lạc nội bộ giữa các bộ phận trong trường.</li>
          <li>Thống kê, báo cáo phục vụ công tác quản lý của Ban Giám hiệu.</li>
        </ul>

        <h2>3. Bảo mật thông tin</h2>
        <p>
          Hệ thống áp dụng các biện pháp bảo mật kỹ thuật bao gồm mã hóa mật khẩu, xác thực JWT, phân quyền
          theo vai trò (admin, manager, teacher, technician) và ghi nhật ký truy cập. Chỉ những người có thẩm
          quyền mới được phép xem thông tin nhạy cảm.
        </p>

        <h2>4. Chia sẻ thông tin</h2>
        <p>
          Thông tin cá nhân của người dùng không được chia sẻ với bên thứ ba vì bất kỳ mục đích thương mại nào.
          Dữ liệu chỉ được sử dụng trong phạm vi nội bộ nhà trường, trừ trường hợp có yêu cầu từ cơ quan nhà
          nước có thẩm quyền theo quy định pháp luật.
        </p>

        <h2>5. Quyền của người dùng</h2>
        <ul>
          <li>Quyền truy cập và xem thông tin cá nhân của mình.</li>
          <li>Quyền yêu cầu chỉnh sửa thông tin không chính xác.</li>
          <li>Quyền yêu cầu xóa tài khoản khi không còn công tác tại trường.</li>
        </ul>

        <h2>6. Lưu trữ dữ liệu</h2>
        <p>
          Dữ liệu được lưu trữ trên máy chủ nội bộ của nhà trường. Sau khi cán bộ, giáo viên thôi việc, dữ liệu
          sẽ được lưu trữ theo quy định lưu trữ hồ sơ của Bộ Giáo dục và Đào tạo.
        </p>

        <h2>7. Liên hệ</h2>
        <p>
          Nếu có bất kỳ thắc mắc nào về chính sách bảo mật, vui lòng liên hệ phòng Công nghệ thông tin –
          Trường Thực hành Sư phạm, Đại học Trà Vinh.
        </p>
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/terms" className="text-primary hover:underline">Điều khoản sử dụng</Link>
        <Link href="/guide" className="text-primary hover:underline">Hướng dẫn sử dụng</Link>
      </div>
    </div>
  );
}
