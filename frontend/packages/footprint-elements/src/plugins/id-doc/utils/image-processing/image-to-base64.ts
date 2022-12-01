const convertImageToBase64 = (image: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        // This should never happen since we read the data as url
        // But typescript thinks the type can be either string or ArrayBuffer
        reject();
        return;
      }
      const base64 = reader.result?.replace(/data:.+?;base64,/i, '');
      resolve(base64);
    };
    reader.readAsDataURL(image);
  });

export default convertImageToBase64;
