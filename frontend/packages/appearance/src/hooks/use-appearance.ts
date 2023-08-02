import { FootprintAppearance } from '@onefootprint/footprint-js';
import { useContext } from 'react';

import AppearanceContext from '../components/appearance-provider/appearance-context';

const useAppearance = (): FootprintAppearance | null => {
  const appearance = useContext(AppearanceContext);
  return appearance;
};

export default useAppearance;
