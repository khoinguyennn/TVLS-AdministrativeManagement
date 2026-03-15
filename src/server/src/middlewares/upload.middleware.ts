import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { HttpException } from '@exceptions/HttpException';

const AVATAR_DIR = path.join(__dirname, '../../uploads/avatars');
const REPORT_IMAGE_DIR = path.join(__dirname, '../../uploads/reports');
const SIGNATURE_DIR = path.join(__dirname, '../../uploads/signatures');
const WORK_ORDER_EVIDENCE_DIR = path.join(__dirname, '../../uploads/work-orders');

// Ensure upload directories exist
[AVATAR_DIR, REPORT_IMAGE_DIR, SIGNATURE_DIR, WORK_ORDER_EVIDENCE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const reportImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, REPORT_IMAGE_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `report-${uniqueSuffix}${ext}`);
  },
});

const workOrderEvidenceStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, WORK_ORDER_EVIDENCE_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `work-order-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpException(400, 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)'));
  }
};

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
}).single('avatar');

export const uploadReportImage = multer({
  storage: reportImageStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('image');

export const uploadWorkOrderEvidence = multer({
  storage: workOrderEvidenceStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('evidence');

const signatureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, SIGNATURE_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `signature-${uniqueSuffix}${ext}`);
  },
});

export const uploadSignatureImage = multer({
  storage: signatureStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
}).single('signatureImage');
