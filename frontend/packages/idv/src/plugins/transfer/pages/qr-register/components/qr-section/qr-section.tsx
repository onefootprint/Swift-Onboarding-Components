import { Shimmer, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import QRCode from 'react-qr-code';
import { css, styled } from 'styled-components';

const QR_CODE_SIZE = 168;

type QRSectionProps = {
  text: string;
  qrValue?: string;
  isLoading?: boolean;
};

const QRSection = ({ text, qrValue, isLoading }: QRSectionProps) => (
  <Container paddingTop={7} paddingBottom={7} direction="column" align="center" gap={5}>
    <Text variant="body-2" color="secondary">
      {text}
    </Text>
    {isLoading || !qrValue ? (
      <Shimmer height={`${QR_CODE_SIZE}px`} width={`${QR_CODE_SIZE}px`} />
    ) : (
      <QRContainer data-dd-privacy="mask">
        <QRCode size={QR_CODE_SIZE} value={qrValue} />
      </QRContainer>
    )}
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    position: relative;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      width: 150%;
      height: 1px;
      border-top: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
      transform: translateX(-50%);
    }

    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 150%;
      height: 1px;
      border-top: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
      transform: translateX(-50%);
    }
  `}
`;

const QRContainer = styled(Stack)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[3]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default QRSection;
