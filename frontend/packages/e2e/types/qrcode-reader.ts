declare module 'qrcode-reader' {
  interface QRCode {
    result: string;
    points: {
      x: number;
      y: number;
      count: number;
      estimatedModuleSize: number;
    }[];
  }

  class QRCodeReader {
    decode(image: any): Promise<QRCode>;
    callback(e2: Error | null, code: QRCode): void;
  }

  export = QRCodeReader;
}
