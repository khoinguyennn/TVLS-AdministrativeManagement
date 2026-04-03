import path from 'path';
import PDFDocument from 'pdfkit';
import { DB } from '@database';
import { HttpException } from '@exceptions/HttpException';

const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts');
const FONT_REGULAR = path.join(FONTS_DIR, 'TimesNewRoman-Regular.ttf');
const FONT_BOLD = path.join(FONTS_DIR, 'TimesNewRoman-Bold.ttf');
const FONT_ITALIC = path.join(FONTS_DIR, 'TimesNewRoman-Italic.ttf');

function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return '........../........../..........';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '........../........../..........';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatLongDate(dateInput?: string | Date | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const date = Number.isNaN(d.getTime()) ? new Date() : d;
  return `Vĩnh Long, ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
}

function formatDateWords(dateInput?: string | Date | null): string {
  if (!dateInput) return '.... tháng .... năm ....';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '.... tháng .... năm ....';
  return `${String(d.getDate()).padStart(2, '0')} tháng ${String(d.getMonth() + 1).padStart(2, '0')} năm ${d.getFullYear()}`;
}

function dayDiff(start?: string | Date | null, end?: string | Date | null): string {
  if (!start || !end) return '';
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';
  const ms = e.getTime() - s.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  return String(Math.max(days, 1));
}

function truncateText(value: string | undefined, maxLen: number, fallback = '................................'): string {
  const text = (value || '').trim();
  if (!text) return fallback;
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 3)}...`;
}

function drawHeader(doc: PDFKit.PDFDocument, title: string): number {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const contentWidth = right - left;
  const top = doc.page.margins.top;

  const gutter = 10;
  const usableWidth = contentWidth - gutter * 2;
  const leftW = usableWidth * 0.31;
  const centerW = usableWidth * 0.4;
  const rightW = usableWidth - leftW - centerW;
  const leftX = left;
  const centerX = leftX + leftW + gutter;
  const rightX = centerX + centerW + gutter;

  const drawCenteredLine = (
    text: string,
    x: number,
    y: number,
    w: number,
    font: 'Regular' | 'Bold',
    size: number,
    underline = false,
  ) => {
    let finalSize = size;
    doc.font(font).fontSize(finalSize);
    let textWidth = doc.widthOfString(text);

    if (textWidth > w) {
      finalSize = Math.max(7.2, (size * (w - 2)) / textWidth);
      doc.font(font).fontSize(finalSize);
      textWidth = doc.widthOfString(text);
    }

    const textX = x + Math.max(0, (w - textWidth) / 2);
    doc.text(text, textX, y, { lineBreak: false });

    if (underline) {
      const lineX = textX;
      const lineY = y + doc.currentLineHeight() + 1;
      doc.moveTo(lineX, lineY).lineTo(lineX + textWidth, lineY).lineWidth(0.8).stroke();
    }
  };

  drawCenteredLine('TRƯỜNG ĐẠI HỌC TRÀ VINH', leftX, top + 1, leftW, 'Regular', 9.8);
  drawCenteredLine('TRƯỜNG THỰC HÀNH SƯ PHẠM', leftX, top + 18, leftW, 'Bold', 9.8, true);
  drawCenteredLine('Mã đơn vị ngân sách 1113255', leftX, top + 44, leftW, 'Bold', 9);

  drawCenteredLine('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', centerX, top + 1, centerW, 'Bold', 9.8);
  drawCenteredLine('Độc lập - Tự do - Hạnh phúc', centerX, top + 18, centerW, 'Bold', 9.8, true);

  drawCenteredLine('Mẫu số: C16 - HD', rightX, top + 1, rightW, 'Bold', 9.8);
  doc
    .font('Regular')
    .fontSize(7.6)
    .text('(Ban hành kèm theo', rightX, top + 15, { width: rightW, align: 'center', lineBreak: false })
    .text('Thông tư 107/2017/TT-BTC', rightX, top + 27, { width: rightW, align: 'center', lineBreak: false })
    .text('ngày 10/10/2017 của BTC)', rightX, top + 39, { width: rightW, align: 'center', lineBreak: false });

  const titleY = top + 96;
  doc.font('Bold').fontSize(18.5).text(title, left, titleY, { width: contentWidth, align: 'center' });

  doc.font('Regular').fontSize(15).text('Số: ......................', left + contentWidth * 0.72, titleY + 54, {
    width: contentWidth * 0.26,
    align: 'center',
  });

  return titleY + 104;
}

function drawTravelTable(
  doc: PDFKit.PDFDocument,
  startDate: string,
  endDate: string,
  location: string,
  startY: number,
  opts?: { includeHeader?: boolean; rowIndexes?: number[]; rowHeight?: number },
): number {
  const left = doc.page.margins.left;
  const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidths = [0.26, 0.13, 0.12, 0.1, 0.195, 0.195].map(r => r * tableWidth);
  const includeHeader = opts?.includeHeader ?? true;
  const rowIndexes = opts?.rowIndexes ?? [0, 1, 2, 3, 4];
  const header1H = 52;
  const header2H = 30;
  const rowH = opts?.rowHeight ?? 88;

  const drawCell = (
    x: number,
    y: number,
    w: number,
    h: number,
    text = '',
    opts?: { align?: 'left' | 'center'; bold?: boolean; fontSize?: number; topPad?: number; lineGap?: number },
  ) => {
    doc.rect(x, y, w, h).lineWidth(1).stroke();
    const align = opts?.align ?? 'left';
    const topPad = opts?.topPad ?? 8;
    const fontSize = opts?.fontSize ?? 11;
    const lineGap = opts?.lineGap ?? 2;
    doc.font(opts?.bold ? 'Bold' : 'Regular').fontSize(fontSize).text(text, x + 6, y + topPad, {
      width: w - 12,
      height: h - topPad - 4,
      align,
      lineGap,
    });
  };

  let x = left;
  const y = startY;
  if (includeHeader) {
    const headers = [
      'Nơi đi / Nơi đến',
      'Ngày',
      'Phương\ntiện sử\ndụng',
      'Số ngày\ncông tác',
      'Lý do lưu trú',
      'Chứng nhận của cơ\nquan nơi công tác\n(Ký tên, đóng dấu)',
    ];
    headers.forEach((h, idx) => {
      if (idx === 5) {
        drawCell(x, y, colWidths[idx], header1H, h, { align: 'center', bold: true, fontSize: 9.2, topPad: 5, lineGap: 0.5 });
      } else {
        drawCell(x, y, colWidths[idx], header1H, h, { align: 'center', bold: true, fontSize: 10.5, topPad: 7, lineGap: 1.5 });
      }
      x += colWidths[idx];
    });

    x = left;
    ['A', '1', '2', '3', '4', 'B'].forEach((h, idx) => {
      drawCell(x, y + header1H, colWidths[idx], header2H, h, { align: 'center', bold: true, fontSize: 12, topPad: 6 });
      x += colWidths[idx];
    });
  }

  const rows: string[][] = [
    ['Nơi đi: Trường Thực hành\nSư phạm', startDate, '', '', '', ''],
    [`Nơi đến: ${location || '................................'}`, endDate, '', dayDiff(startDate, endDate), '', ''],
    ['Nơi đi:\n................................', '', '', '', '', ''],
    ['Nơi đến:\n................................', '', '', '', '', ''],
    ['Nơi đi / Nơi đến:\n................................', '', '', '', '', ''],
  ];

  let rowY = y + (includeHeader ? header1H + header2H : 0);
  rowIndexes.forEach(rowIndex => {
    const r = rows[rowIndex];
    if (!r) return;
    let rowX = left;
    r.forEach((cell, idx) => {
      if (idx === 0) {
        drawCell(rowX, rowY, colWidths[idx], rowH, cell, { align: 'left', bold: false, fontSize: 10.8, topPad: 10 });
      } else if (idx === 1) {
        drawCell(rowX, rowY, colWidths[idx], rowH, cell, { align: 'center', bold: false, fontSize: 10.8, topPad: 10 });
      } else {
        drawCell(rowX, rowY, colWidths[idx], rowH, cell, { align: 'center', bold: false, fontSize: 10.5, topPad: 10 });
      }
      rowX += colWidths[idx];
    });
    rowY += rowH;
  });

  return rowY;
}

export async function generateWorkOrderPdf(workOrderId: number): Promise<Buffer> {
  const row = await DB.WorkOrders.findByPk(workOrderId, {
    include: [
      { model: DB.Users, as: 'creator', attributes: ['id', 'fullName', 'email'] },
      { model: DB.Users, as: 'assignee', attributes: ['id', 'fullName', 'email', 'role'] },
      { model: DB.Users, as: 'approver', attributes: ['id', 'fullName', 'email'] },
    ],
  });

  if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

  const data = row.get({ plain: true }) as any;
  const assigneeName = truncateText(data.assignee?.fullName || data.creator?.fullName, 42);
  const roleLabel = data.assignee?.role === 'teacher' ? 'Giáo viên' : data.assignee?.role === 'technician' ? 'Kỹ thuật viên' : 'Nhân viên';
  const location = truncateText(data.location, 60);
  const content = truncateText(data.content, 140);
  const startDate = formatDate(data.startDate);
  const endDate = formatDate(data.endDate);
  const fromDateWords = formatDateWords(data.startDate);
  const toDateWords = formatDateWords(data.endDate);
  const longDate = formatLongDate(data.createdAt || new Date());

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 46, bottom: 46, left: 42, right: 42 },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.registerFont('Regular', FONT_REGULAR);
    doc.registerFont('Bold', FONT_BOLD);
    doc.registerFont('Italic', FONT_ITALIC);

    // Page 1
    let y = drawHeader(doc, 'GIẤY ĐI ĐƯỜNG');
    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.font('Regular').fontSize(14);
    doc.text('Cấp cho (Ông/Bà): ', left, y, { continued: true });
    doc.font('Bold').text(assigneeName);
    y += 22;

    doc.font('Regular').text('Chức vụ: ', left, y, { continued: true });
    doc.font('Bold').text(roleLabel);
    y += 22;

    doc.font('Regular').text('Được cử đi công tác tại: ', left, y, { continued: true });
    doc.font('Bold').text(location);
    y += 22;

    doc.font('Regular').text('Nội dung: ', left, y, { continued: true });
    doc.font('Bold').text(content, { width: width - 140 });
    y += 24;

    doc.font('Regular').text(
      `Từ ngày ${fromDateWords} đến ngày ${toDateWords}`,
      left,
      y,
      { width },
    );
    y += 28;

    const signX = left + width * 0.53;
    const signW = width * 0.44;

    let dateFontSize = 15;
    doc.font('Italic').fontSize(dateFontSize);
    let dateWidth = doc.widthOfString(longDate);
    while (dateWidth > signW && dateFontSize > 10.5) {
      dateFontSize -= 0.5;
      doc.font('Italic').fontSize(dateFontSize);
      dateWidth = doc.widthOfString(longDate);
    }

    const dateX = signX + Math.max(0, (signW - dateWidth) / 2);
    doc.text(longDate, dateX, y, { lineBreak: false });
    y += doc.currentLineHeight() + 6;

    doc.font('Bold').fontSize(16).text('HIỆU TRƯỞNG', signX, y, { width: signW, align: 'center' });
    y += 20;
    doc.font('Regular').fontSize(12).text('(Ký, ghi rõ họ tên và đóng dấu)', signX, y, {
      width: signW,
      align: 'center',
    });

    y += 34;
    doc.font('Bold').fontSize(14).text('Tiền ứng trước', left, y, { width: width * 0.45 });
    y += 28;
    doc.font('Regular').fontSize(13).text('Lương ................................. đ', left, y);
    y += 25;
    doc.text('Công tác phí .......................... đ', left, y);
    y += 25;
    doc.text('Cộng ................................... đ', left, y);

    // Move main 4-band table block (header + index row + 2 data rows) to page 1
    const page1MainRowHeight = 70;
    const page1TableHeight = 52 + 30 + page1MainRowHeight * 2;
    const page1TableY = doc.page.height - doc.page.margins.bottom - page1TableHeight;
    drawTravelTable(doc, startDate, endDate, location, page1TableY, {
      includeHeader: true,
      rowIndexes: [0, 1],
      rowHeight: page1MainRowHeight,
    });

    // Page 2
    doc.addPage();
    // Remaining 3 blank rows at top of page 2
    const tableEndY = drawTravelTable(doc, startDate, endDate, location, doc.page.margins.top + 2, {
      includeHeader: false,
      rowIndexes: [2, 3, 4],
      rowHeight: 52,
    });

    const p3Left = doc.page.margins.left;
    const p3Width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    let p3Y = tableEndY + 10;

    doc.font('Regular').fontSize(13);
    doc.text('- Tiền xe đi và về: ....................................................................................', p3Left, p3Y);
    p3Y += 24;
    doc.text('- Vé cước: ................................................................................................', p3Left, p3Y);
    p3Y += 24;
    doc.text('- Phòng nghỉ: ............................................................................................', p3Left, p3Y);
    p3Y += 24;
    doc.text('- Phụ cấp lưu trú: ......................................................................................', p3Left, p3Y);

    p3Y += 36;
    doc.font('Bold').fontSize(14).text('Tổng số tiền: ...............................................................', p3Left, p3Y);
    p3Y += 26;
    doc.text('Bằng chữ: ....................................................................', p3Left, p3Y);

    p3Y += 34;
    const colW = p3Width / 3;
    const maxSignatureY = doc.page.height - doc.page.margins.bottom - 56;
    const signatureTitleY = Math.min(p3Y, maxSignatureY);

    doc.font('Bold').fontSize(13).text('Người đi công tác', p3Left, signatureTitleY, { width: colW, align: 'center' });
    doc.font('Bold').fontSize(13).text('Kế Toán', p3Left + colW, signatureTitleY, { width: colW, align: 'center' });
    doc.font('Bold').fontSize(13).text('Hiệu Trưởng', p3Left + colW * 2, signatureTitleY, { width: colW, align: 'center' });

    const signatureNoteY = signatureTitleY + 22;
    doc.font('Italic').fontSize(12).text('(Ký, họ tên)', p3Left, signatureNoteY, { width: colW, align: 'center' });
    doc.text('(Ký, họ tên)', p3Left + colW, signatureNoteY, { width: colW, align: 'center' });
    doc.text('(Ký, họ tên)', p3Left + colW * 2, signatureNoteY, { width: colW, align: 'center' });

    doc.end();
  });
}