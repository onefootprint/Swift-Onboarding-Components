import type { FootprintAppearance } from '@onefootprint/footprint-js';
import React from 'react';
import { ARYEO_AUTH_TOKEN } from 'src/config/constants';

import ComponentsInstructions from './components/components-instructions';

const appearance: FootprintAppearance = {
  fontSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  variables: {
    fontFamily:
      'BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
    borderRadius: '8px',
    colorSuccess: '#10b981',
    colorError: '#F87171',
    buttonPrimaryBg: '#5550e9',
    buttonBorderRadius: '6px',
    buttonPrimaryColor: '#FFFFFF',
    buttonPrimaryHoverBg: '#6366F1',
    buttonPrimaryActiveBg: '#4f46e5',
    inputElevation:
      'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
    inputPlaceholderColor: '#cbd5e0',
    inputBorderWidth: '1px',
    inputHeight: '38px',
    inputBg: '#FFFFFF',
    inputBorderColor: '#d1d5db',
    inputBorderRadius: '6px',
    inputColor: '#000',
    inputFocusBg: '#FFF',
    inputFocusBorderColor: '#6366f1',
    inputErrorBorderColor: '#F87171',
    hintFont: '600 14px/21px "Inter"',
    hintErrorColor: '#F87171',
    labelColor: '#374151',
    labelFont: '500 14px/21px "Inter"',
  },
};

const Aryeo = () => (
  <ComponentsInstructions
    appearance={appearance}
    cardAlias="primary"
    tenantName="Aryeo"
    framework="vue"
    userId="fp_id_UIUImA2Kfqkhcrc90qjaMu"
    secretAuthToken={ARYEO_AUTH_TOKEN ?? ''}
    variant="drawer"
  />
);

export default Aryeo;
