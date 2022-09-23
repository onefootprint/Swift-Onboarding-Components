import { IdScanBadImageError } from 'types';

const useCheckPhotoStatus = (
  options: {
    onSuccess?: () => void;
    onError?: (
      frontImageError?: IdScanBadImageError,
      backImageError?: IdScanBadImageError,
    ) => void;
  } = {},
) => {
  // TODO: implement polling backend here;
  setTimeout(() => {
    options.onSuccess?.();
  }, 1000);
};

export default useCheckPhotoStatus;
