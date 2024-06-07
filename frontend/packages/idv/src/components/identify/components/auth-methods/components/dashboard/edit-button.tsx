import type { Icon } from '@onefootprint/icons';
import { Stack, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import EditButtonActions from './edit-button-actions';

type EditButtonProps = {
  icon: Icon;
  isEmpty: boolean;
  isVerified: boolean;
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  texts: {
    add: string;
    edit: string;
    verified: string;
  };
};
const EditButton = ({ label, icon: Icon, onClick, isVerified, isEmpty, texts }: EditButtonProps) => (
  <Button type="button" onClick={onClick}>
    <Stack align="center" justify="center" height="24px" width="24px">
      <Icon />
    </Stack>
    <TextContainer data-private="true" data-dd-privacy="mask">
      {label}
    </TextContainer>
    <EditButtonActions shouldShowVerify={isVerified} isEmpty={isEmpty} texts={texts} />
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

export default EditButton;
