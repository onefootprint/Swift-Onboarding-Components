import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Box, Container, media } from '@onefootprint/ui';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SectionTitle from '../../../../components/desktop-share-post/section-title';
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
    <SectionContainer>
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />
      <Box width="100%" position="relative">
        <MockupScreen
          $borderRadius={borderRadius}
          $backgroundColor={backgroundColor}
        />
        <PositionedCustomInput
          title={t('components.border-radius')}
          type="number"
          onChange={handleBorderRadiusChange}
          value={borderRadius}
        />
        <PositionedColorSelection
          title={t('components.button-background-color')}
          activeHex={backgroundColor}
          onChange={handleBackgroundColorChange}
          colorList={colorList}
        />
      </Box>
      <OutOfTheBox onClick={handleClick} />
    </SectionContainer>
  );
};

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[9]};
    padding: ${theme.spacing[11]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0;
    `}
  `}
`;

const PositionedCustomInput = styled(CustomInput)`
  display: none;
  position: absolute;
  bottom: 15%;
  right: 5%;

  ${media.greaterThan('md')`  
    display: block;
    bottom: 10%;
    right: 5%;
    transform: rotate(10deg);
  `}
`;

const PositionedColorSelection = styled(ColorSelection)`
  position: absolute;
  bottom: -5%;

  ${media.greaterThan('md')`  
    bottom: 0%;
    left: 40%;
  `}
`;

export default Customize;
