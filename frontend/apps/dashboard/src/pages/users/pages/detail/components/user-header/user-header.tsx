import {
  statusToBadgeVariant,
  statusToDisplayText,
} from '@src/pages/users/hooks/use-get-onboardings';
import React from 'react';
import { User } from 'src/pages/users/hooks/use-join-users';
import styled, { css } from 'styled-components';
import { Badge, Button, Typography } from 'ui';

type BasicInfoProps = {
  user: User;
  onDecryptButtonClick: () => void;
};

const UserHeader = ({ user, onDecryptButtonClick }: BasicInfoProps) => {
  const { footprintUserId } = user;
  return (
    <HeaderContainer>
      <RowContainer>
        <Typography variant="heading-3" sx={{ userSelect: 'none' }}>
          User info
        </Typography>
        <Badge variant={statusToBadgeVariant[user.status]}>
          {statusToDisplayText[user.status]}
        </Badge>
      </RowContainer>
      <SplitRow>
        <RowContainer>
          <Typography variant="body-3" color="primary">
            {/* TODO better formatting utils */}
            {new Date(user.initiatedAt).toLocaleString('en-us', {
              month: 'numeric',
              day: 'numeric',
              year: '2-digit',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </Typography>
          <Typography variant="body-4" color="tertiary">
            ·
          </Typography>
          <Code>{footprintUserId}</Code>
        </RowContainer>
        {/* TODO: implement filter modal */}
        <Button size="small" variant="secondary" onClick={onDecryptButtonClick}>
          Decrypt data
        </Button>
      </SplitRow>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  ${({ theme }) => css`
    gap: ${theme.spacing[3]}px;
  `};
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ theme }) => css`
    gap: ${theme.spacing[3]}px;
  `};
`;

const SplitRow = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

// TODO migrate to real component from design library
// https://linear.app/footprint/issue/FP-204
const Code = styled.span`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]}px;
    padding: ${theme.spacing[2]}px ${theme.spacing[2]}px;
    color: ${theme.color.error};
    font-family: MONOSPACE;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
  `};
`;

export default UserHeader;
