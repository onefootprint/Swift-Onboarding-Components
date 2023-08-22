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
    onError([IdDocImageUploadError.unknownUploadError]);
    return;
  }
  if (files.length > 1) {
    onError([IdDocImageUploadError.multipleFilesError]);
    return;
  }
  if (!files[0].type.startsWith('image')) {
    onError([IdDocImageUploadError.fileTypeNotAllowed]);
    return;
  }
  onSuccess(files[0]);
};

export default handleFileUpload;
