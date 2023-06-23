import { createContext } from 'react';

const ScanContext = createContext<{
  isError: boolean;
  isSuccess: boolean;
  errors: string[];
  isLoading: boolean;
  onSubmit: (image: string) => void;
  onResetErrors: () => void;
}>({
  isError: false,
  isSuccess: false,
  errors: [],
  isLoading: false,
  onSubmit: () => {},
  onResetErrors: () => {},
});

export default ScanContext;
