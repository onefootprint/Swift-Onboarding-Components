import { Badge, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import {
  statusToBadgeVariant,
  statusToDisplayText,
} from 'src/constants/onboarding-status-display';
import { User } from 'src/pages/users/types/user.types';
import styled, { css } from 'styled-components';

import DecryptControls from './components/decrypt-controls';
import ManualReview from './components/manual-review';

type UserHeaderProps = {
  user: User;
};

const UserHeader = ({ user }: UserHeaderProps) => {
  const { id: footprintUserId } = user;
  return (
    <HeaderContainer>
      <RowContainer>
        <Typography variant="label-1">User info</Typography>
        <Badge variant={statusToBadgeVariant[user.status]}>
          {statusToDisplayText[user.status]}
        </Badge>
        {/* TODO display manual review better */}
        {user.requiresManualReview && (
          <Badge variant="error">Manual review</Badge>
        )}
      </RowContainer>
      <SplitRow>
        <RowContainer>
          <Typography variant="body-3" color="primary">
            {/* TODO better formatting utils */}
            {new Date(user.startTimestamp).toLocaleString('en-us', {
              month: 'numeric',
              day: 'numeric',
              year: '2-digit',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </Typography>
          <Typography variant="body-3" color="tertiary">
            ·
          </Typography>
          <CodeInline>{footprintUserId}</CodeInline>
        </RowContainer>
        <RowContainer>
          <ManualReview />
          <DecryptControls />
        </RowContainer>
      </SplitRow>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `};
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ theme }) => css`
    gap: ${theme.spacing[3]};
  `};
`;

const SplitRow = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

export default UserHeader;
