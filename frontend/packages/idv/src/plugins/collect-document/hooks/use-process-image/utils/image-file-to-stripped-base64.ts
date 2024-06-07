const stripBase64Prefix = (image: string) => image.replace(/data:.+?;base64,/i, '');

const imageFileToStrippedBase64 = (image: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        // This should never happen since we read the data as url
        // But typescript thinks the type can be either string or ArrayBuffer
        reject();
        return;
      }
      const processedResult = stripBase64Prefix(reader.result);
      resolve(processedResult);
    };
    reader.readAsDataURL(image);
  });

export default imageFileToStrippedBase64;
