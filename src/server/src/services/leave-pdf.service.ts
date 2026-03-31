import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { DB } from '@database';
import { HttpException } from '@exceptions/HttpException';

// ── Font paths (Times New Roman) ──
const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts');
const FONT_REGULAR = path.join(FONTS_DIR, 'TimesNewRoman-Regular.ttf');
const FONT_BOLD = path.join(FONTS_DIR, 'TimesNewRoman-Bold.ttf');
const FONT_ITALIC = path.join(FONTS_DIR, 'TimesNewRoman-Italic.ttf');

// ── Helpers ──
function getDayMonthYear(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
  };
}

function formatDateVN(dateStr: string): string {
  const { day, month, year } = getDayMonthYear(dateStr);
  return `${day}/${month}/${year}`;
}

/** Role labels in Vietnamese */
const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  teacher: 'Giáo viên',
  technician: 'Kỹ thuật viên',
};

export async function generateLeaveRequestPdf(leaveRequestId: number): Promise<Buffer> {
  // ── Fetch data ──
  const request = await DB.LeaveRequests.findByPk(leaveRequestId, {
    include: [
      {
        model: DB.Users,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'role'],
        include: [
          {
            model: DB.StaffProfiles,
            as: 'staffProfile',
            attributes: ['id'],
            include: [
              {
                model: DB.StaffPositions,
                as: 'position',
                attributes: ['subjectGroup'],
              },
            ],
          },
        ],
      },
      { model: DB.LeaveTypes, as: 'leaveType', attributes: ['id', 'name'] },
      { model: DB.Users, as: 'approver', attributes: ['id', 'fullName'] },
    ],
  });

  if (!request) throw new HttpException(404, 'Không tìm thấy yêu cầu nghỉ phép');

  const data = request.get({ plain: true }) as any;

  // Signature image – only load when request has been signed
  let signaturePath: string | null = null;
  if (data.signedAt) {
    const sigConfig = await DB.SignatureConfigs.findOne({ where: { userId: data.userId } });
    if (sigConfig && sigConfig.signatureImage) {
      const p = path.join(__dirname, '..', '..', sigConfig.signatureImage);
      if (fs.existsSync(p)) signaturePath = p;
    }
  }

  // Approver signature image – only load when approver has signed
  let approverSignaturePath: string | null = null;
  if (data.approverSignedAt && data.approvedBy) {
    const approverSigConfig = await DB.SignatureConfigs.findOne({ where: { userId: data.approvedBy } });
    if (approverSigConfig && approverSigConfig.signatureImage) {
      const p = path.join(__dirname, '..', '..', approverSigConfig.signatureImage);
      if (fs.existsSync(p)) approverSignaturePath = p;
    }
  }

  const fullName: string = data.user?.fullName || '…………………………';
  const roleLabel: string = ROLE_LABELS[data.user?.role] || data.user?.role || '…………………………';
  const subjectGroup: string = data.user?.staffProfile?.position?.subjectGroup || '…………………………………………';
  const startDMY = getDayMonthYear(data.startDate);
  const endDMY = getDayMonthYear(data.endDate);
  const createdDMY = data.createdAt ? getDayMonthYear(data.createdAt) : getDayMonthYear(new Date().toISOString());

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 56, bottom: 56, left: 72, right: 72 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers as unknown as Uint8Array[])));
    doc.on('error', reject);

    // Register fonts
    doc.registerFont('Regular', FONT_REGULAR);
    doc.registerFont('Bold', FONT_BOLD);
    doc.registerFont('Italic', FONT_ITALIC);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const leftX = doc.page.margins.left;
    const fontSize = 13;

    // ════════════════════════════════════════════════════════════
    // HEADER  (centred, full-width — matches Word template)
    // ════════════════════════════════════════════════════════════
    let y = doc.page.margins.top;

    // Line 1: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
    doc.font('Bold').fontSize(fontSize + 1);
    doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', leftX, y, {
      width: pageWidth,
      align: 'center',
    });
    y += doc.currentLineHeight() + 4;

    // Line 2: Độc lập – Tự do – Hạnh phúc  (bold)
    doc.font('Bold').fontSize(fontSize);
    const sloganText = 'Độc lập - Tự do - Hạnh phúc';
    doc.text(sloganText, leftX, y, {
      width: pageWidth,
      align: 'center',
    });

    // Underline under slogan
    const sloganW = doc.widthOfString(sloganText);
    const sloganLineY = y + doc.currentLineHeight() + 2;
    const sloganLineX = leftX + (pageWidth - sloganW) / 2;
    doc
      .moveTo(sloganLineX, sloganLineY)
      .lineTo(sloganLineX + sloganW, sloganLineY)
      .lineWidth(0.8)
      .stroke();

    y = sloganLineY + 14;

    // ════════════════════════════════════════════════════════════
    // TITLE
    // ════════════════════════════════════════════════════════════
    doc.font('Bold').fontSize(fontSize + 5);
    doc.text('ĐƠN XIN NGHỈ PHÉP', leftX, y, {
      width: pageWidth,
      align: 'center',
    });
    y += doc.currentLineHeight() + 20;

    // ════════════════════════════════════════════════════════════
    // BODY  (exactly follows the Word template wording)
    // ════════════════════════════════════════════════════════════
    const bodyIndent = leftX + 36;
    const bodyWidth = pageWidth - 36;

    // Kính gửi (centred, all bold)
    doc.font('Bold').fontSize(fontSize);
    doc.text('Kính gửi: Ban Giám Hiệu Trường Thực hành Sư phạm', leftX, y, {
      width: pageWidth,
      align: 'center',
    });
    y += doc.currentLineHeight() + 14;

    // Tôi tên
    doc.font('Regular').fontSize(fontSize);
    doc.text('Tôi tên: ', bodyIndent, y, { continued: true, width: bodyWidth });
    doc.font('Bold').text(fullName);
    y += doc.currentLineHeight() + 6;

    // Là
    doc.font('Regular').text('Là: ', bodyIndent, y, { continued: true, width: bodyWidth });
    doc.font('Bold').text(roleLabel);
    y += doc.currentLineHeight() + 6;

    // Thuộc tổ (tổ bộ môn of the requester)
    doc.font('Regular').text('Thuộc tổ: ', bodyIndent, y, { continued: true, width: bodyWidth });
    doc.font('Bold').text(subjectGroup);
    y += doc.currentLineHeight() + 14;

    // Main request paragraph
    doc.font('Regular').fontSize(fontSize);
    const requestParagraph =
      `Nay tôi làm đơn này kính xin Hiệu trưởng Trường Thực hành Sư phạm cho tôi được nghỉ phép ` +
      `${data.totalDays} ngày ` +
      `(từ ngày ${startDMY.day}/${startDMY.month}/${startDMY.year} ` +
      `đến ngày ${endDMY.day}/${endDMY.month}/${endDMY.year})`;
    doc.text(requestParagraph, bodyIndent, y, { width: bodyWidth, lineGap: 4 });
    y += doc.heightOfString(requestParagraph, { width: bodyWidth, lineGap: 4 }) + 8;

    // Lý do
    doc.font('Regular').text('Lý do: ', bodyIndent, y, { continued: true, width: bodyWidth });
    doc.font('Regular').text(data.reason || '……………………………………………………………………………');
    y += doc.heightOfString(data.reason || '……………………………………………………………………………', { width: bodyWidth }) + 14;

    // Commitment paragraph (2 lines)
    doc.font('Regular').fontSize(fontSize);
    const commitLine1 =
      'Tôi xin hứa khi hết thời gian nghỉ phép tôi sẽ nghiêm túc tham gia công tác cũng như thực hiện đầy đủ các hoạt động của nhà trường.';
    doc.text(commitLine1, bodyIndent, y, { width: bodyWidth, lineGap: 4 });
    y += doc.heightOfString(commitLine1, { width: bodyWidth, lineGap: 4 }) + 4;

    const commitLine2 = 'Rất mong được sự chấp thuận của Lãnh đạo nhà trường.';
    doc.text(commitLine2, bodyIndent, y, { width: bodyWidth, lineGap: 4 });
    y += doc.heightOfString(commitLine2, { width: bodyWidth, lineGap: 4 }) + 8;

    // Trân trọng cảm ơn!
    doc.font('Regular').fontSize(fontSize);
    doc.text('Trân trọng cảm ơn!', bodyIndent, y, { width: bodyWidth });
    y += doc.currentLineHeight() + 20;

    // ════════════════════════════════════════════════════════════
    // DATE + SIGNATURE AREA
    // ════════════════════════════════════════════════════════════
    const colHalfWidth = pageWidth / 2;
    const colLeft = leftX;
    const colRight = leftX + colHalfWidth;

    // Date line (right-aligned)
    doc.font('Italic').fontSize(fontSize);
    doc.text(`Vĩnh Long, ngày ${createdDMY.day} tháng ${createdDMY.month} năm ${createdDMY.year}`, colRight, y, {
      width: colHalfWidth,
      align: 'center',
    });
    y += doc.currentLineHeight() + 10;

    const sigRowY = y;

    // Signature image size (bigger)
    const sigW = 150;
    const sigH = 55;

    // ── Left column: PHÊ DUYỆT CỦA LÃNH ĐẠO ──
    doc.font('Bold').fontSize(fontSize);
    doc.text('PHÊ DUYỆT CỦA LÃNH ĐẠO', colLeft, sigRowY, {
      width: colHalfWidth,
      align: 'center',
    });

    if (data.status === 'approved' && data.approver) {
      doc.font('Bold').fontSize(12);
      doc.text('Đã phê duyệt', colLeft, sigRowY + 20, {
        width: colHalfWidth,
        align: 'center',
      });

      // Approver signature image
      if (approverSignaturePath) {
        try {
          const approverSigX = colLeft + (colHalfWidth - sigW) / 2;
          doc.image(approverSignaturePath, approverSigX, sigRowY + 36, {
            width: sigW,
            height: sigH,
            fit: [sigW, sigH],
            align: 'center',
          });
        } catch {
          // Ignore approver signature image errors
        }
      }

      doc.font('Bold').fontSize(fontSize);
      doc.text(data.approver.fullName, colLeft, sigRowY + 36 + sigH + 4, {
        width: colHalfWidth,
        align: 'center',
      });
    } else if (data.status === 'rejected') {
      doc.font('Bold').fontSize(12).fillColor('red');
      doc.text('Từ chối', colLeft, sigRowY + 20, {
        width: colHalfWidth,
        align: 'center',
      });
      doc.fillColor('black');

      let leftCursorY = sigRowY + 38;
      if (data.rejectedReason) {
        doc.font('Italic').fontSize(11);
        const reasonText = `Lý do: ${data.rejectedReason}`;
        doc.text(reasonText, colLeft + 10, leftCursorY, {
          width: colHalfWidth - 20,
          align: 'center',
        });
        leftCursorY += doc.heightOfString(reasonText, { width: colHalfWidth - 20 }) + 6;
      }

      // Approver signature image (even for rejection)
      if (approverSignaturePath) {
        try {
          const approverSigX = colLeft + (colHalfWidth - sigW) / 2;
          doc.image(approverSignaturePath, approverSigX, leftCursorY, {
            width: sigW,
            height: sigH,
            fit: [sigW, sigH],
            align: 'center',
          });
          leftCursorY += sigH + 4;
        } catch {
          // Ignore approver signature image errors
        }
      } else {
        leftCursorY += sigH + 4;
      }

      if (data.approver) {
        doc.font('Bold').fontSize(fontSize);
        doc.text(data.approver.fullName, colLeft, leftCursorY, {
          width: colHalfWidth,
          align: 'center',
        });
      }
    }
    // When status = 'pending' → left column stays empty (no text, no signature)

    // ── Right column: Người viết đơn ──
    doc.font('Bold').fontSize(fontSize).fillColor('black');
    doc.text('Người viết đơn', colRight, sigRowY, {
      width: colHalfWidth,
      align: 'center',
    });

    doc.font('Italic').fontSize(12);
    doc.text('(Ký và ghi rõ họ tên)', colRight, sigRowY + 18, {
      width: colHalfWidth,
      align: 'center',
    });

    // Signature image — only shown when signed
    if (signaturePath) {
      try {
        const sigImgX = colRight + (colHalfWidth - sigW) / 2;
        doc.image(signaturePath, sigImgX, sigRowY + 36, {
          width: sigW,
          height: sigH,
          fit: [sigW, sigH],
          align: 'center',
        });
      } catch {
        // Ignore signature image errors
      }
    }

    // Signer name
    doc.font('Bold').fontSize(fontSize);
    doc.text(fullName, colRight, sigRowY + 36 + sigH + 4, {
      width: colHalfWidth,
      align: 'center',
    });

    // ════════════════════════════════════════════════════════════
    // FOOTER
    // ════════════════════════════════════════════════════════════
    const footerY = doc.page.height - doc.page.margins.bottom - 18;
    doc.font('Italic').fontSize(8).fillColor('#888888');
    doc.text(
      `Đơn được tạo tự động từ Hệ thống Quản lý Hành chính – Trường Thực hành Sư phạm  |  Ngày in: ${formatDateVN(new Date().toISOString())}`,
      leftX,
      footerY,
      { width: pageWidth, align: 'center' },
    );

    doc.end();
  });
}
