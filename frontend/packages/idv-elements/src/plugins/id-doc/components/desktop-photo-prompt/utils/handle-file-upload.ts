import { IdDocImageUploadError } from '@onefootprint/types';

import Logger from '../../../../../utils/logger';

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
    Logger.warn(
      'Image upload failed on desktop mode. No image files detected',
      'id-doc-photo-prompt',
    );
    onError([IdDocImageUploadError.unknownUploadError]);
    return;
  }
  if (files.length > 1) {
    Logger.warn(
      'Image upload failed on desktop mode. User attempted to upload multiple images',
      'id-doc-photo-prompt',
    );
    onError([IdDocImageUploadError.multipleFilesError]);
    return;
  }
  if (!files[0].type.startsWith('image')) {
    Logger.warn(
      'Image upload failed on desktop mode. User attempted to upload an unsupported file format',
      'id-doc-photo-prompt',
    );
    onError([IdDocImageUploadError.fileTypeNotAllowed]);
    return;
  }
  onSuccess(files[0]);
};

export default handleFileUpload;
