import { IcoBolt24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import styled, { css } from 'styled-components/native';

export type CopyButtonProps = {
  text: string;
};

const CopyButton = ({ text }: CopyButtonProps) => {
  const handleClick = () => {
    Clipboard.setString(text);
  };

  return (
    <CopyButtonContainer>
      <IconButton aria-label="copy" onPress={handleClick}>
        <IcoBolt24 />
      </IconButton>
    </CopyButtonContainer>
  );
};

const CopyButtonContainer = styled.View`
  ${({ theme }) => css`
    position: relative;
    border-radius: ${theme.borderRadius.default};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${theme.spacing[9]};
    width: ${theme.spacing[9]};
  `}
`;

export default CopyButton;
