export interface DigitalSignature {
  id?: number;
  entityType: 'leave_request';
  entityId: number;
  signedBy: number;
  certificateInfo?: string;
  documentHash?: string;
  signatureValue?: string;
  signedAt: Date;
}

export interface SignatureConfig {
  id?: number;
  userId: number;
  signatureImage?: string;
  pinHash?: string;
}
