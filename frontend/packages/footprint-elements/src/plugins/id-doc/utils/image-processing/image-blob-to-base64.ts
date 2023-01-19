const imageBlobToBase64 = (image: Blob) =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      resolve(base64);
    };
    reader.readAsDataURL(image);
  });

export default imageBlobToBase64;
