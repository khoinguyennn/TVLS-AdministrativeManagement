import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DB } from '@database';
import { Op } from 'sequelize';

export class ChatbotService {
  private genAI: GoogleGenAI;

  constructor() {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  public async chat(message: string, userRole: string, userId: number): Promise<string> {
    if (!message) throw new HttpException(400, 'Nội dung tin nhắn không được để trống');

    const context = await this.gatherContext(userRole, message, userId);

    const currentDate = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' });

    // Combine context with system instructions
    const systemPrompt = `
      You are an internal AI assistant of Trường Thực hành Sư phạm (Administrative Management System).
      Today is: ${currentDate}.
      Your task is to answer questions from school staff based on the system data provided.
      
      IMPORTANT INSTRUCTIONS:
      1. ONLY use data provided in the CONTEXT section below to answer.
      2. If the information is NOT in the CONTEXT, reply: "I don't have information about this in the system." (in the same language as the user). Never fabricate or guess information.
      3. LANGUAGE DETECTION: Detect the language of the user's message and ALWAYS reply in the SAME language.
         - If the user writes in Vietnamese: reply in Vietnamese, address them as "thầy/cô", refer to yourself as "tôi" or "em".
         - If the user writes in English: reply in English, address them as "you" or "sir/ma'am", refer to yourself as "I".
         - If mixed: follow the dominant language.
      4. Be polite, concise and professional. You may use markdown for formatting (bullet points, bold text).
      5. If the question involves sensitive data or is outside the user's permissions (based on the provided context), politely decline.
      
      --- BEGIN SYSTEM CONTEXT ---
      ${context}
      --- END CONTEXT ---
    `;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Tôi đã hiểu vai trò và hướng dẫn của mình. Tôi sẵn sàng trả lời các câu hỏi dựa trên dữ liệu hệ thống được cung cấp.' }] },
          { role: 'user', parts: [{ text: message }] }
        ]
      });

      return response.text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new HttpException(500, 'Không thể kết nối với AI. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
    }
  }

  private async gatherContext(userRole: string, message: string, userId: number): Promise<string> {
    let contextParts: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Intent detection based on keywords to save token quota (Vietnamese + English)
    const isStaffQuery = /(nhân sự|ai|người|giáo viên|sđt|số điện thoại|liệt kê|danh sách|nhân viên|danh bạ|thông tin|hồ sơ|liên hệ|email|chức vụ|staff|personnel|employee|teacher|phone|contact|directory|profile|position|who is|who are|find|search|lookup|user|name|person|member)/i.test(lowerMessage);
    const isLeaveQuery = /(nghỉ phép|nghỉ|phép|vắng|leave|day off|absent|vacation|time off|on leave)/i.test(lowerMessage);
    const isDeviceQuery = /(thiết bị|máy|phòng|hỏng|sửa|tình trạng|chuột|bàn phím|màn hình|máy chiếu|điều hòa|máy lạnh|device|equipment|broken|repair|room|status|mouse|keyboard|monitor|projector|air conditioner)/i.test(lowerMessage);
    const isWorkOrderQuery = /(công lệnh|nhiệm vụ|phân công|work order|work orders|my order|my task|task|assignment|assigned|pending approval)/i.test(lowerMessage);
    const isHelpQuery = /(hướng dẫn|cách sử dụng|chức năng|làm sao|làm thế nào|ở đâu|help|how to|guide|feature|where|what can|instruction)/i.test(lowerMessage);

    // 1. Thông tin nhân sự (admin, manager, teacher, technician)
    if (['admin', 'manager', 'teacher', 'technician'].includes(userRole) && isStaffQuery) {
      contextParts.push(await this.getStaffContext());
    }

    // 2. Thông tin nghỉ phép (admin, manager, teacher)
    if (['admin', 'manager', 'teacher'].includes(userRole) && isLeaveQuery) {
      contextParts.push(await this.getLeaveContext(userRole === 'teacher', userId));
    }

    // 3. Thông tin thiết bị & báo hỏng (admin, manager, technician)
    if (['admin', 'manager', 'technician'].includes(userRole) && isDeviceQuery) {
      contextParts.push(await this.getDeviceContext());
      contextParts.push(await this.getDeviceReportContext());
    }

    // 4. Thông tin công lệnh (tất cả, nhưng người thường chỉ thấy của mình)
    if (['admin', 'manager', 'teacher', 'technician'].includes(userRole) && isWorkOrderQuery) {
      contextParts.push(await this.getWorkOrderContext(userRole, userId));
    }

    // 5. Tính năng trợ giúp / hướng dẫn (tất cả mọi người)
    if (isHelpQuery) {
      contextParts.push(this.getHelpContext(userRole));
    }

    if (contextParts.length === 0) {
      return "Hệ thống: Câu hỏi mang tính giao tiếp chung hoặc không tìm thấy từ khóa tương ứng để xuất dữ liệu (hãy hỏi cụ thể về nhân sự, thiết bị, nghỉ phép hoặc công lệnh).";
    }

    return contextParts.join('\n\n');
  }

  private async getStaffContext(): Promise<string> {
    try {
      const staffProfiles = await DB.StaffProfiles.findAll({
        include: [
          { model: DB.Users, as: 'user', attributes: ['email', 'fullName', 'status'] },
          { model: DB.StaffPositions, as: 'position' },
          { model: DB.StaffAddresses, as: 'addresses', where: { addressType: 'contact' }, required: false }
        ]
      });

      if (staffProfiles.length === 0) return 'Dữ liệu nhân sự: Không có dữ liệu.';

      const staffList = staffProfiles.map(s => {
        const p: any = s; // Type cast for nested relates
        const phone = p.addresses && p.addresses.length > 0 ? p.addresses[0].phone : 'Chưa cập nhật';
        const position = p.position?.jobPosition || 'Chưa cập nhật';
        return `- Tên: ${p.user?.fullName || 'N/A'}, Email: ${p.user?.email || 'N/A'}, Mã CB: ${s.staffCode}, SĐT: ${phone}, Vị trí: ${position}, Trạng thái: ${s.staffStatus === 'working' ? 'Đang làm việc' : 'Nghỉ việc/Nghỉ thai sản'}`;
      });

      return `DỮ LIỆU NHÂN SỰ:\n${staffList.join('\n')}`;
    } catch (e) {
      console.error(e);
      return 'Dữ liệu nhân sự: Lỗi khi truy xuất.';
    }
  }

  private async getLeaveContext(limitToActive: boolean, userId: number): Promise<string> {
    try {
      // Get today and upcoming leaves
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const queryOpts: any = {
        where: {
          status: { [Op.in]: ['pending', 'approved'] },
          endDate: { [Op.gte]: today }
        },
        include: [
          { model: DB.Users, as: 'user', attributes: ['fullName'] },
          { model: DB.LeaveTypes, as: 'leaveType', attributes: ['name'] }
        ]
      };

      const leaves = await DB.LeaveRequests.findAll(queryOpts);

      let leaveContext = '';
      if (leaves.length === 0) {
        leaveContext = 'DỮ LIỆU NGHỈ PHÉP (hiện tại và sắp tới): Không có ai xin nghỉ phép.';
      } else {
        const statusMap: Record<string, string> = {
          'pending': 'Chờ duyệt',
          'approved': 'Đã duyệt'
        };

        const leaveList = leaves.map(l => {
          const req: any = l;
          return `- Người nghỉ: ${req.user?.fullName}, Loại: ${req.leaveType?.name}, Từ: ${l.startDate} Đến: ${l.endDate}, Trạng thái: ${statusMap[l.status as string] || l.status}`;
        });

        leaveContext = `DỮ LIỆU NGHỈ PHÉP (những người đang và sắp nghỉ):\n${leaveList.join('\n')}`;
      }

      // Lấy thông tin số ngày phép còn lại của người dùng hiện tại
      const currentYear = today.getFullYear();
      const balance = await DB.LeaveBalances.findOne({
        where: { userId: userId, year: currentYear }
      });

      if (balance) {
        leaveContext += `\n\nTHÔNG TIN NGHỈ PHÉP CÁ NHÂN (CỦA CHÍNH NGƯỜI ĐANG HỎI BẠN):\n- Năm: ${currentYear}\n- Tổng số ngày phép được nghỉ: ${balance.totalDays} ngày\n- Số ngày đã nghỉ: ${balance.usedDays} ngày\n- Số ngày phép CÒN LẠI: ${balance.totalDays - balance.usedDays} ngày`;
      } else {
        leaveContext += `\n\nTHÔNG TIN NGHỈ PHÉP CÁ NHÂN (CỦA CHÍNH NGƯỜI ĐANG HỎI BẠN):\nKhông tìm thấy dữ liệu ngày phép.`;
      }

      return leaveContext;
    } catch (e) {
      console.error(e);
      return 'Dữ liệu nghỉ phép: Lỗi khi truy xuất.';
    }
  }

  private async getDeviceContext(): Promise<string> {
    try {
      const devices = await DB.Devices.findAll({
        include: [
          {
            model: DB.Rooms,
            as: 'room',
            include: [{ model: DB.Buildings, as: 'building' }]
          }
        ]
      });

      if (devices.length === 0) return 'DỮ LIỆU THIẾT BỊ: Không có dữ liệu.';

      const deviceList = devices.map(d => {
        const dev: any = d;
        const location = dev.room ? `Phòng ${dev.room.name} (${dev.room.building?.name || ''})` : 'Chưa xếp phòng';
        const statusMap = { 'active': 'Hoạt động', 'under_repair': 'Đang sửa chữa', 'waiting_replacement': 'Chờ thay thế', 'broken': 'Hỏng' };
        return `- Thiết bị: ${d.name}, Vị trí: ${location}, Trạng thái: ${statusMap[d.status] || d.status}`;
      });

      return `DỮ LIỆU THIẾT BỊ:\n${deviceList.join('\n')}`;
    } catch (e) {
      console.error(e);
      return 'Dữ liệu thiết bị: Lỗi khi truy xuất.';
    }
  }

  private async getDeviceReportContext(): Promise<string> {
    try {
      const reports = await DB.DeviceReports.findAll({
        where: {
          status: { [Op.ne]: 'completed' } // Only unfinished reports
        },
        include: [
          {
            model: DB.Devices,
            as: 'device',
            attributes: ['name'],
            include: [
              {
                model: DB.Rooms, as: 'room', attributes: ['name'],
                include: [{ model: DB.Buildings, as: 'building', attributes: ['name'] }]
              }
            ]
          },
          { model: DB.Users, as: 'reporter', attributes: ['fullName'] },
          { model: DB.Users, as: 'assignee', attributes: ['fullName'] }
        ]
      });

      if (reports.length === 0) return 'DỮ LIỆU BÁO HỎNG (mới/đang xử lý): Không có báo hỏng nào chưa hoàn thành.';

      const statusMap = {
        'pending': 'Chờ tiếp nhận', 'received': 'Đã tiếp nhận', 'repairing': 'Đang sửa chữa',
        'repaired': 'Đã sửa xong', 'waiting_replacement': 'Chờ thay thế', 'unfixable': 'Không sửa được',
        'recheck_required': 'Cần kiểm tra lại'
      };

      const reportList = reports.map(r => {
        const rep: any = r;
        const location = rep.device?.room ? ` (Phòng ${rep.device.room.name} - ${rep.device.room.building?.name || ''})` : '';
        return `- Phiếu #${r.id}: Thiết bị: "${rep.device?.name}"${location}, Người báo: ${rep.reporter?.fullName}, Kỹ thuật viên xử lý: ${rep.assignee?.fullName || 'Chưa phân công'}, Trạng thái: ${statusMap[r.status] || r.status}, Mô tả lỗi: ${r.description}`;
      });

      return `DỮ LIỆU BÁO HỎNG (đang chờ và đang xử lý):\n${reportList.join('\n')}`;
    } catch (e) {
      console.error(e);
      return 'Dữ liệu báo hỏng: Lỗi khi truy xuất.';
    }
  }

  private async getWorkOrderContext(userRole: string, userId: number): Promise<string> {
    try {
      const whereClause = ['admin', 'manager'].includes(userRole) ? {} : {
        [Op.or]: [{ createdBy: userId }, { assignedTo: userId }]
      };

      const orders = await DB.WorkOrders.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: 50,
        include: [
          { model: DB.Users, as: 'creator', attributes: ['fullName'] },
          { model: DB.Users, as: 'assignee', attributes: ['fullName'] }
        ]
      });

      if (orders.length === 0) return 'DỮ LIỆU CÔNG LỆNH: Không có công lệnh nào.';

      const statusMap: Record<string, string> = {
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt',
        'in_progress': 'Đang thực hiện',
        'completed': 'Hoàn thành',
        'rejected': 'Từ chối'
      };

      const orderList = orders.map(o => {
        const ord: any = o;
        return `- Công lệnh [${o.code}]: Tiêu đề: "${o.title}", Người tạo: ${ord.creator?.fullName}, Phụ trách: ${ord.assignee?.fullName || 'Chưa phân công'}, Trạng thái: ${statusMap[o.status as string] || o.status}`;
      });

      return `DỮ LIỆU CÔNG LỆNH:\n${orderList.join('\n')}`;
    } catch (e) {
      console.error(e);
      return 'Dữ liệu công lệnh: Lỗi khi truy xuất.';
    }
  }
  private getHelpContext(userRole: string): string {
    let help = `DANH SÁCH CHỨC NĂNG HỆ THỐNG VÀ HƯỚNG DẪN SỬ DỤNG:
Hệ thống Quản lý Hành chính cung cấp các tính năng hỗ trợ sau. Khi người dùng gặp khó khăn, hãy giải thích công dụng của tính năng đó và LUÔN LUÔN CUNG CẤP ĐƯỜNG DẪN DƯỚI DẠNG MARKDOWN LINK \`[Tên chức năng](/duong-dan)\` để họ bấm trực tiếp vào.

*DÀNH CHO TẤT CẢ MỌI NGƯỜI:*
- [Tổng quan hệ thống](/dashboard): Xem thống kê chung.
- [Hồ sơ cá nhân](/dashboard/my-profile): Xem và cập nhật thông tin cá nhân.
- [Quản lý công lệnh](/dashboard/work-orders): Tạo, theo dõi và xử lý công việc.
- [Báo hỏng thiết bị](/dashboard/device-reports): Tạo phiếu báo hỏng khi phát hiện thiết bị lỗi và theo dõi báo hỏng.
- [Quản lý nghỉ phép](/dashboard/leave-requests): Xem lịch sử và tạo đơn xin nghỉ phép.
- [Chữ ký số](/dashboard/digital-signatures): Thiết lập chữ ký cá nhân và tính năng ký duyệt điện tử.
- [Cài đặt tài khoản](/dashboard/settings): Đổi mật khẩu, ảnh đại diện.
`;

    if (['admin'].includes(userRole)) {
      help += `\n*DÀNH RIÊNG QUẢN TRỊ VIÊN (Admin):*\n- [Quản lý người dùng](/dashboard/users): Thêm, sửa, khóa và cấp quyền cho các tài khoản người dùng.\n`;
    }
    
    if (['admin', 'manager'].includes(userRole)) {
      help += `\n*DÀNH CHO BAN GIÁM HIỆU / QUẢN LÝ (Admin/Manager):*
- [Hồ sơ nhân sự](/dashboard/staff): Xem và quản lý chi tiết lý lịch, hợp đồng, bằng cấp của toàn bộ nhân sự trường.
- [Thống kê nhân sự](/dashboard/statistics): Xem báo cáo chi tiết về nhân sự theo vị trí, giới tính, loại.
- [Thống kê độ tuổi](/dashboard/statistics/age): Biểu đồ phân bổ độ tuổi nhóm giáo viên/nhân viên.
- [Quản lý tòa nhà](/dashboard/buildings): Quản lý danh sách các tòa nhà.
- [Quản lý phòng](/dashboard/rooms): Quản lý danh sách các phòng học, phòng làm việc.
- [Quản lý thiết bị](/dashboard/devices): Quản lý kho vật tư thiết bị, phân bổ phòng và lịch sử sửa chữa.\n`;
    }

    help += `\nLƯU Ý DÀNH CHO BẠN (AI):
- Bạn phải sử dụng Markdown Link chuẩn, ví dụ: "Thầy/Cô có thể vào trang [Quản lý nghỉ phép](/dashboard/leave-requests) để làm đơn..." để người dùng nhấp vào link chuyển trang ngay lập tức. Không đưa url không có \`[]()\` định dạng Markdown.
- KHÔNG BAO GIỜ tự bịa ra đường link ngoài danh sách này.`;

    return help;
  }
}
