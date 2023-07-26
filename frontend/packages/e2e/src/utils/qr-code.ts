import fs from 'fs';
import Jimp from 'jimp';
import QrCode from 'qrcode-reader';

const readQrCode = (path: string): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const buffer = fs.readFileSync(path);
    Jimp.read(buffer, (e1, image) => {
      if (e1) reject(e1);
      const qr = new QrCode();
      qr.callback = function qrCallback(e2, code) {
        if (e2) reject(e2);
        resolve(code.result);
      };

      qr.decode(image.bitmap);
    });
  });

export default readQrCode;
