import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Điều khoản sử dụng</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Cập nhật lần cuối: tháng 01 năm 2026</p>
      </div>

      <div className="prose prose-slate max-w-none dark:prose-invert">
        <p>
          Chào mừng bạn đến với Hệ thống Quản lý Hành chính của Trường Thực hành Sư phạm – Đại học Trà Vinh.
          Bằng việc truy cập và sử dụng hệ thống này, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.
        </p>

        <h2>1. Phạm vi sử dụng</h2>
        <p>
          Hệ thống này chỉ dành cho cán bộ, giáo viên và nhân viên đang công tác tại Trường Thực hành Sư phạm –
          Đại học Trà Vinh. Mọi hành vi truy cập trái phép hoặc sử dụng sai mục đích đều bị nghiêm cấm.
        </p>

        <h2>2. Tài khoản người dùng</h2>
        <ul>
          <li>Mỗi người dùng chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
          <li>Không được chia sẻ tài khoản cho người khác sử dụng.</li>
          <li>Khi phát hiện tài khoản bị xâm phạm, người dùng phải thông báo ngay cho quản trị viên hệ thống.</li>
        </ul>

        <h2>3. Quy tắc sử dụng</h2>
        <ul>
          <li>Chỉ sử dụng hệ thống cho các công việc liên quan đến nhiệm vụ được giao.</li>
          <li>Không tải lên, chia sẻ hoặc phát tán thông tin sai lệch, vi phạm pháp luật.</li>
          <li>Không can thiệp, phá hoại hoặc làm gián đoạn hoạt động của hệ thống.</li>
          <li>Tôn trọng quyền riêng tư và dữ liệu cá nhân của đồng nghiệp.</li>
        </ul>

        <h2>4. Quyền và nghĩa vụ của nhà trường</h2>
        <p>
          Nhà trường có quyền tạm khóa hoặc thu hồi quyền truy cập của bất kỳ tài khoản nào vi phạm điều khoản
          sử dụng mà không cần thông báo trước. Nhà trường cam kết duy trì hệ thống hoạt động ổn định và bảo vệ
          dữ liệu người dùng theo quy định hiện hành.
        </p>

        <h2>5. Giới hạn trách nhiệm</h2>
        <p>
          Nhà trường không chịu trách nhiệm đối với các thiệt hại phát sinh do người dùng vi phạm điều khoản
          sử dụng hoặc do các sự cố kỹ thuật ngoài tầm kiểm soát.
        </p>

        <h2>6. Thay đổi điều khoản</h2>
        <p>
          Nhà trường có quyền cập nhật điều khoản sử dụng bất kỳ lúc nào. Người dùng sẽ được thông báo khi có
          thay đổi quan trọng. Việc tiếp tục sử dụng hệ thống sau khi điều khoản được cập nhật đồng nghĩa với
          việc bạn chấp nhận các thay đổi đó.
        </p>

        <h2>7. Liên hệ</h2>
        <p>
          Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ bộ phận quản trị hệ thống qua email nội bộ
          hoặc trực tiếp tại phòng Công nghệ thông tin – Trường Thực hành Sư phạm.
        </p>
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/privacy" className="text-primary hover:underline">Chính sách bảo mật</Link>
        <Link href="/guide" className="text-primary hover:underline">Hướng dẫn sử dụng</Link>
      </div>
    </div>
  );
}
