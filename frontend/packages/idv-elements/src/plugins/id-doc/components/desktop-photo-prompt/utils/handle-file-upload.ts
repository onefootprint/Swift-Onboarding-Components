import { IdDocImageUploadError } from '@onefootprint/types';

type HandleFileUploadProps = {
  files: FileList | File[] | null;
  onSuccess: (file: File) => void;
  onError: (errors: IdDocImageUploadError[]) => void;
};

const handleFileUpload = ({
  files,
  onSuccess,
  onError,
}: HandleFileUploadProps) => {
  if (!files || files.length === 0) {
    console.error(
      'Image upload failed on desktop mode. No image files detected',
    );
    onError([IdDocImageUploadError.unknownUploadError]);
    return;
  }
  if (files.length > 1) {
    console.error(
      'Image upload failed on desktop mode. User attempted to upload multiple images',
    );
    onError([IdDocImageUploadError.multipleFilesError]);
    return;
  }
  if (!files[0].type.startsWith('image')) {
    console.error(
      'Image upload failed on desktop mode. User attempted to upload an unsupported file format',
    );
    onError([IdDocImageUploadError.fileTypeNotAllowed]);
    return;
  }
  onSuccess(files[0]);
};

export default handleFileUpload;
