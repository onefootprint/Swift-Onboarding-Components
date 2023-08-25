import { useContext } from 'react';

import ScanContext from './scan-context';

const useScanContext = () => {
  return useContext(ScanContext);
};

export default useScanContext;
