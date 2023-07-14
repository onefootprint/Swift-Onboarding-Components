// Input: HEIC Image File. Output: JPEG Image File.
const convertHEICImage = async (file: File): Promise<File | undefined> => {
  const heic2any = (await import('heic2any')).default;

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
