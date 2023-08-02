import { FootprintAppearance } from '@onefootprint/footprint-js';
import { createContext } from 'react';

const AppearanceContext = createContext<FootprintAppearance | null>({});

export default AppearanceContext;
