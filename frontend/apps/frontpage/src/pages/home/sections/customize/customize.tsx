import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import dynamic from 'next/dynamic';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import FrontpageContainer from 'src/components/frontpage-container';
import SectionTitle from 'src/components/section-title';
import ColorSelection from './components/color-selection';
import CustomInput from './components/custom-input';
import OutOfTheBox from './components/out-of-the-box/out-of-the-box';

const MockupScreen = dynamic(() => import('./components/mockup-screen'));

const colorList = [
  { name: 'Red', hex: '#4A24DB', hover: '#3A1EB2' },
  { name: 'Blue', hex: '#0C6DE2', hover: '#0A62C9' },
  { name: 'Green', hex: '#F28900', hover: '#D97A00' },
  { name: 'Purple', hex: '#0A6A4A', hover: '#095E44' },
];

const publicKey = process.env.NEXT_PUBLIC_KYC_TENANT_KEY ?? '';

export const Customize = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.customize',
  });
  const [borderRadius, setBorderRadius] = useState('6');
  const [backgroundColor, setBackgroundColor] = useState(colorList[0].hex);

  const handleBorderRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorderRadius(e.target.value);
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
  };

  const handleClick = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Verify,
      publicKey,
      appearance: {
        variables: {
          buttonBorderRadius: `${borderRadius}px`,
          buttonPrimaryBg: backgroundColor,
          buttonPrimaryBorderColor: backgroundColor,
        },
      },
    });

    component.render();
  };

  return (
    <FrontpageContainer className="flex flex-col items-center py-16 md:py-32 gap-9">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />
      <div className="relative w-full">
        <MockupScreen borderRadius={borderRadius} backgroundColor={backgroundColor} />
        <CustomInput
          className="absolute md:bottom-1/3 md:right-10 bottom-1/3 right-2"
          title={t('components.border-radius')}
          type="number"
          onChange={handleBorderRadiusChange}
          value={borderRadius}
        />
        <ColorSelection
          className="absolute origin-right right-2 md:bottom-8 md:left-1/2 bottom-1/2"
          title={t('components.button-background-color')}
          activeHex={backgroundColor}
          onChange={handleBackgroundColorChange}
          colorList={colorList}
        />
      </div>
      <OutOfTheBox onClick={handleClick} />
    </FrontpageContainer>
  );
};

export default Customize;
