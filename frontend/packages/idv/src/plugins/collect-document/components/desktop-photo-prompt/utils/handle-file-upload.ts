import { IdDocImageUploadError } from '@onefootprint/types';

import { Logger } from '@/idv/utils';

type HandleFileUploadProps = {
  files: FileList | File[] | null;
  onSuccess: (file: File) => void;
  onError: (errors: IdDocImageUploadError[]) => void;
  allowPdf?: boolean;
};

const handleFileUpload = ({ files, onSuccess, onError, allowPdf }: HandleFileUploadProps) => {
  if (!files || files.length === 0) {
    Logger.warn('Image upload failed on desktop mode. No image files detected', { location: 'id-doc-photo-prompt' });
    onError([IdDocImageUploadError.unknownUploadError]);
    return;
  }
  if (files.length > 1) {
    Logger.warn('Image upload failed on desktop mode. User attempted to upload multiple images', {
      location: 'id-doc-photo-prompt',
    });
    onError([IdDocImageUploadError.multipleFilesError]);
    return;
  }
  const fileTypeAllowed = files[0].type.startsWith('image') || (allowPdf && files[0].type === 'application/pdf');
  if (!fileTypeAllowed) {
    Logger.warn(
      `Image upload failed on desktop mode. User attempted to upload an unsupported file format ${files[0].type}`,
      { location: 'id-doc-photo-prompt' },
    );
    onError([IdDocImageUploadError.fileTypeNotAllowed]);
    return;
  }
  onSuccess(files[0]);
};

export default handleFileUpload;
