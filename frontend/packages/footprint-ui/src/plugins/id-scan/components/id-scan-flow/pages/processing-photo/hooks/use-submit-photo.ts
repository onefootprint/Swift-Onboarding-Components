import { IdScanBadImageError } from 'types';

const useSubmitPhoto = (
  photos: {
    front?: string;
    back?: string;
  } = {},
  options: {
    onSuccess?: () => void;
    onError?: (
      frontImageError?: IdScanBadImageError,
      backImageError?: IdScanBadImageError,
    ) => void;
  } = {},
) => {
  // TODO: send photos to backend and poll status
  setTimeout(() => {
    console.log(photos.front);
    console.log(photos.back);
    options.onSuccess?.();
  }, 1000);
};

export default useSubmitPhoto;
