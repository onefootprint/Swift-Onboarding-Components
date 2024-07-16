import type { Icon } from '@onefootprint/icons';
// import { Tooltip } from '@onefootprint/ui';
import React from 'react';
import { Pressable } from 'react-native';
import styled, { css } from 'styled-components/native';

type InlineButtonProps = {
  icon?: Icon;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

const InlineButton = ({ icon: Icon, onClick, disabled, ariaLabel }: InlineButtonProps) => {
  const icon = Icon && <Icon color={disabled ? 'quaternary' : 'primary'} />;

  return onClick ? (
    <Pressable onPress={onClick} disabled={disabled}>
      <InlineButtonContainer role="button" aria-label={ariaLabel} data-disabled={disabled} aria-disabled={disabled}>
        {icon}
      </InlineButtonContainer>
    </Pressable>
  ) : (
    <InlineButtonContainer>{icon}</InlineButtonContainer>
  );
};

const InlineButtonContainer = styled.View`
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

export default InlineButton;
