import { Box, media } from '@onefootprint/ui';
import React from 'react';
import { useState } from 'react';
import styled, { css } from 'styled-components';
import ColorSelection from './components/color-selection';
import CustomInput from './components/custom-input';
import Form from './components/form';

const colorList = [
  { name: 'Red', hex: '#4A24DB', hover: '#3A1EB2' },
  { name: 'Blue', hex: '#0C6DE2', hover: '#0A62C9' },
  { name: 'Green', hex: '#F28900', hover: '#D97A00' },
  { name: 'Purple', hex: '#0A6A4A', hover: '#095E44' },
];

const PersonaIllustration = () => {
  const [backgroundColor, setBackgroundColor] = useState(colorList[0].hex);
  const [borderRadius, setBorderRadius] = useState('6');

  const handleBorderRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorderRadius(e.target.value);
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
  };

  return (
    <Container>
      <Form $backgroundColor={backgroundColor} $borderRadius={borderRadius} />
      <PositionedColorSelection
        title="Background Color"
        activeHex={backgroundColor}
        colorList={colorList}
        onChange={handleBackgroundColorChange}
      />
      <PositionedCustomInput
        title="Border Radius"
        type="number"
        value={borderRadius}
        onChange={handleBorderRadiusChange}
      />
    </Container>
  );
};

const Container = styled(Box)`
  width: 100%;
  height: 100%;
  position: relative;
`;

const PositionedColorSelection = styled(ColorSelection)`
  ${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[4]};
    right: ${theme.spacing[3]};
    transform: rotate(2deg);

    ${media.greaterThan('md')`
      top: unset;
      bottom: ${theme.spacing[12]};
      right: ${theme.spacing[3]};
    `}
  `}
`;

const PositionedCustomInput = styled(CustomInput)`
  ${({ theme }) => css`
    position: absolute;
    bottom: ${theme.spacing[11]};
    left: ${theme.spacing[4]};
    transform: rotate(-2deg);

    ${media.greaterThan('md')`
      bottom: unset;
      top: ${theme.spacing[10]};
      left: ${theme.spacing[4]};
    `}
  `}
`;

export default PersonaIllustration;
