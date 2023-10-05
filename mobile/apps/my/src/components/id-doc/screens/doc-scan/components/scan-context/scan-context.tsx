import { CountryRecord, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { createContext } from 'react';
import type { PhotoFile } from 'react-native-vision-camera';

const ScanContext = createContext<{
  country: CountryRecord;
  isError: boolean;
  isSuccess: boolean;
  errors: string[];
  isLoading: boolean;
  onSubmit: (image: PhotoFile, meta: Record<string, boolean>) => void;
  onBack: () => void;
  onResetErrors: () => void;
}>({
  country: DEFAULT_COUNTRY,
  isError: false,
  isSuccess: false,
  errors: [],
  isLoading: false,
  onSubmit: () => {},
  onBack: () => {},
  onResetErrors: () => {},
});

export default ScanContext;
