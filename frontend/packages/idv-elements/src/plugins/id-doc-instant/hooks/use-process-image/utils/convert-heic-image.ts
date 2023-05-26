// Input: HEIC Image File. Output: JPEG Image File.
const convertHEICImage = async (file: File): Promise<File | undefined> => {
  // Importing heic2any or requiring it globally causes build errors,
  // so require it locally inside this function only
  const heic2any = require('heic2any'); // eslint-disable-line global-require

  // Check if input file is actually HEIC format
  const { type, name, lastModified } = file;
  if (type !== 'image/heic') {
    return file;
  }

  const converted = (await heic2any({
    blob: file,
    toType: 'image/jpeg',
  })) as File;

  if (!converted) {
    return undefined;
  }

  // The heic2any library doesn't preserve image metadata, like the name'
  // File metadata properties are read only, so we can't assign directly
  // Instead, create a new file with the original file's metadata.
  const convertedWithMetadata = new File([converted], name, {
    type: converted.type,
    lastModified,
  });

  return convertedWithMetadata;
};

export default convertHEICImage;
