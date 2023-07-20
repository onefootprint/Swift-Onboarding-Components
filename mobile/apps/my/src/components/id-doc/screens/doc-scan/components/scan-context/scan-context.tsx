import { CountryRecord, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { createContext } from 'react';

const ScanContext = createContext<{
  country: CountryRecord;
  isError: boolean;
  isSuccess: boolean;
  errors: string[];
  isLoading: boolean;
  onSubmit: (image: string) => void;
  onResetErrors: () => void;
}>({
  country: DEFAULT_COUNTRY,
  isError: false,
  isSuccess: false,
  errors: [],
  isLoading: false,
  onSubmit: () => {},
  onResetErrors: () => {},
});

export default ScanContext;
