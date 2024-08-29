import type { Icon } from '@onefootprint/icons';
import { Stack, createFontStyles } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

import EditButtonActions from './edit-button-actions';

type EditButtonProps = {
  icon: Icon;
  isDisabled?: boolean;
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
const EditButton = ({ label, icon: Icon, onClick, isDisabled, isVerified, isEmpty, texts }: EditButtonProps) => (
  <Button type="button" onClick={onClick} disabled={isDisabled}>
    <Stack align="center" justify="center" height="24px" width="24px">
      <Icon color={isDisabled ? 'quaternary' : 'primary'} />
    </Stack>
    <TextContainer data-dd-privacy="mask">
      <Inner>{label}</Inner>
    </TextContainer>
    <EditButtonActions shouldShowVerify={isVerified} isEmpty={isEmpty} texts={texts} isDisabled={isDisabled} />
  </Button>
);

const Button = styled.button`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
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

const TextContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;
`;

const Inner = styled.span`
  ${createFontStyles('label-3')};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export default EditButton;
