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
  <Container as="button" type="button" onClick={onClick} gap={3}>
    <Stack align="center" justify="center" height="24px" width="24px">
      <Icon />
    </Stack>
    <TextContainer>{label}</TextContainer>
    <RightActions
      shouldShowVerify={isVerified}
      isEmpty={isEmpty}
      texts={texts}
    />
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    border: none;
    cursor: pointer;
    user-select: none;
    min-height: 48px;
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
