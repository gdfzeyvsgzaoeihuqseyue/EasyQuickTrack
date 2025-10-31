export interface QRCodeRecord {
  id: string;
  title: string;
  shortLink?: {
    id: string;
    shortCode: string;
    shortLink: string;
    longUrl: string;
  };
  qrCodeBase64: string;
  qrCodeType: 'shortlink' | 'url';
  options: QRCodeOptions;
  createdAt: string;
  updatedAt: string;
}

export interface QRCodeOptions {
  format?: 'png' | 'svg' | 'jpeg' | 'webp'
  title?: string;
  size?: number
  quality?: number
  foregroundColor?: string
  backgroundColor?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  margin?: number
  logoFile?: File | null
  logoSize?: number
  addSignature?: boolean
  signatureColor?: string
  signatureFontSize?: number
  url?: string
}

export interface QRCodeResponse {
  success: boolean
  message: string
  blob?: Blob
  url?: string
}

export interface GetQRCodesResponse {
  success: boolean
  message: string
  nb: number
  nbOnPage: number
  currentPage: number
  totalPages: number
  data: QRCodeRecord[]
}

export interface GetQRCodeResponse {
  success: boolean
  message: string
  qrCode: QRCodeRecord
}

export interface UpdateQRCodeResponse {
  success: boolean
  message: string
  qrCode: QRCodeRecord
}

export interface DeleteQRCodeResponse {
  success: boolean
  message: string
}
