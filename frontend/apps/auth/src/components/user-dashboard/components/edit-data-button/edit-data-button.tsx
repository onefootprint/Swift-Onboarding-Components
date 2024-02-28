import type { Icon } from '@onefootprint/icons';
import { createFontStyles, Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import RightActions from './components/right-actions';

type EditDataButtonProps = {
  label: string;
  icon: Icon;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isVerified: boolean;
  isEmpty: boolean;
  texts: {
    add: string;
    edit: string;
    verified: string;
  };
};
const EditDataButton = ({
  label,
  icon: Icon,
  onClick,
  isVerified,
  isEmpty,
  texts,
}: EditDataButtonProps) => (
  <Button type="button" onClick={onClick}>
    <Stack align="center" justify="center" height="24px" width="24px">
      <Icon />
    </Stack>
    <TextContainer data-private="true">{label}</TextContainer>
    <RightActions
      shouldShowVerify={isVerified}
      isEmpty={isEmpty}
      texts={texts}
    />
  </Button>
);

const Button = styled.button`
  ${({ theme }) => css`
    display: flex;
    border: none;
    cursor: pointer;
    user-select: none;
    min-height: 48px;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.secondary};
  `}
`;

const TextContainer = styled.span`
  ${createFontStyles('label-3')};
  display: flex;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export default EditDataButton;
