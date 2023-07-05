const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
  });
};

const encodeImagePath = async (path: string) => {
  const response = await fetch(`file://${path}`);
  const blob = await response.blob();
  const base64Data = await blobToBase64(blob);
  return base64Data.replace('data:image/jpeg;base64,', '');
};

export default encodeImagePath;
