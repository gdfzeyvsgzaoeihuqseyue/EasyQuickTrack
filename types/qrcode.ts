export interface QRCodeOptions {
  format?: 'png' | 'svg' | 'jpeg' | 'webp';
  title?: string;
  size?: number;
  quality?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  logoFile?: File | null;
  logoSize?: number;
  addSignature?: boolean;
  signatureColor?: string;
  signatureFontSize?: number;
}

export interface QRCodeResponse {
  success: boolean;
  message: string;
  blob?: Blob;
  url?: string;
}

export interface QRCodeRecord {
  id: string;
  title?: string;
  qrCodeBase64: string;
}
