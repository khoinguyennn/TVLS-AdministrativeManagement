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

    const context = await this.gatherContext(userRole, message);
    
    // Combine context with system instructions
    const systemPrompt = `
      Bạn là trợ lý AI nội bộ của Trường Thực hành Sư phạm (Hệ thống Quản lý Hành chính).
      Nhiệm vụ của bạn là trả lời các câu hỏi của nhân viên trong trường dựa trên dữ liệu hệ thống được cung cấp.
      
      HƯỚNG DẪN QUAN TRỌNG:
      1. CHỈ sử dụng dữ liệu được cung cấp trong phần CONTEXT bên dưới để trả lời.
      2. Nếu thông tin KHÔNG có trong CONTEXT, hãy trả lời: "Tôi không có thông tin về vấn đề này trong hệ thống.", tuyệt đối không tự bịa đặt hoặc suy đoán thông tin.
      3. Chào hỏi người dùng một cách lịch sự nhưng ngắn gọn và chuyên nghiệp.
      4. Trả lời bằng tiếng Việt, có thể sử dụng markdown để định dạng cho dễ nhìn (gạch đầu dòng, in đậm).
      5. Nếu câu hỏi liên quan đến dữ liệu nhạy cảm hoặc không thuộc quyền hạn của người dùng (dựa theo context được cấp), hãy từ chối lịch sự.
      
      --- BẮT ĐẦU CONTEXT TỪ HỆ THỐNG ---
      ${context}
      --- KẾT THÚC CONTEXT ---
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

  private async gatherContext(userRole: string, message: string): Promise<string> {
    let contextParts: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Intent detection based on keywords to save token quota
    const isStaffQuery = /(nhân sự|ai|người|giáo viên|sđt|số điện thoại|liệt kê|danh sách|nhân viên)/i.test(lowerMessage);
    const isLeaveQuery = /(nghỉ phép|nghỉ|phép|vắng)/i.test(lowerMessage);
    const isDeviceQuery = /(thiết bị|máy|phòng|hỏng|sửa|tình trạng|chuột|bàn phím|màn hình|máy chiếu|điều hòa|máy lạnh)/i.test(lowerMessage);
    const isWorkOrderQuery = /(công lệnh|nhiệm vụ|phân công)/i.test(lowerMessage);

    // 1. Thông tin nhân sự (admin, manager, teacher, technician)
    if (['admin', 'manager', 'teacher', 'technician'].includes(userRole) && isStaffQuery) {
      contextParts.push(await this.getStaffContext());
    }

    // 2. Thông tin nghỉ phép (admin, manager, teacher)
    if (['admin', 'manager', 'teacher'].includes(userRole) && isLeaveQuery) {
      contextParts.push(await this.getLeaveContext(userRole === 'teacher'));
    }

    // 3. Thông tin thiết bị & báo hỏng (admin, manager, technician)
    if (['admin', 'manager', 'technician'].includes(userRole) && isDeviceQuery) {
      contextParts.push(await this.getDeviceContext());
      contextParts.push(await this.getDeviceReportContext());
    }

    // 4. Thông tin công lệnh (admin, manager)
    if (['admin', 'manager'].includes(userRole) && isWorkOrderQuery) {
      contextParts.push(await this.getWorkOrderContext());
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

  private async getLeaveContext(limitToActive: boolean): Promise<string> {
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
      
      if (leaves.length === 0) return 'DỮ LIỆU NGHỈ PHÉP (hiện tại và sắp tới): Không có ai xin nghỉ phép.';

      const statusMap: Record<string, string> = {
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt'
      };

      const leaveList = leaves.map(l => {
        const req: any = l;
        return `- Người nghỉ: ${req.user?.fullName}, Loại: ${req.leaveType?.name}, Từ: ${l.startDate} Đến: ${l.endDate}, Trạng thái: ${statusMap[l.status as string] || l.status}`;
      });

      return `DỮ LIỆU NGHỈ PHÉP (những người đang và sắp nghỉ):\n${leaveList.join('\n')}`;
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

  private async getWorkOrderContext(): Promise<string> {
    try {
      const orders = await DB.WorkOrders.findAll({
        where: {
          status: { [Op.in]: ['pending', 'approved', 'in_progress'] } // Active ones
        },
        include: [
          { model: DB.Users, as: 'creator', attributes: ['fullName'] },
          { model: DB.Users, as: 'assignee', attributes: ['fullName'] }
        ]
      });

      if (orders.length === 0) return 'DỮ LIỆU CÔNG LỆNH (đang theo dõi): Không có công lệnh nào.';

      const orderList = orders.map(o => {
        const ord: any = o;
        return `- Công lệnh [${o.code}]: Tiêu đề: "${o.title}", Người tạo: ${ord.creator?.fullName}, Phụ trách: ${ord.assignee?.fullName || 'Chưa phân công'}, Trạng thái: ${o.status}`;
      });

      return `DỮ LIỆU CÔNG LỆNH (đang thực hiện):\n${orderList.join('\n')}`;
    } catch (e) {
      console.error(e);
      return 'Dữ liệu công lệnh: Lỗi khi truy xuất.';
    }
  }
}
