import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { Badge, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { User } from 'src/pages/users/types/user.types';
import getOnboardingStatusBadgeVariant from 'src/pages/users/utils/get-onboarding-status-badge-variant';
import styled, { css } from 'styled-components';

import { State } from '../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../decrypt-machine-provider';
import DecryptControls from './components/decrypt-controls';
import ManualReview from './components/manual-review';

type UserHeaderProps = {
  user: User;
};

const UserHeader = ({ user }: UserHeaderProps) => {
  const { id: footprintUserId } = user;
  const { t } = useTranslation('pages.user-details.user-header.status');
  const [state] = useDecryptMachine();
  const shouldShowManualReview = state.matches(State.idle);
  const badgeVariant = getOnboardingStatusBadgeVariant(
    user.status,
    user.requiresManualReview,
  );

  return (
    <HeaderContainer>
      <RowContainer>
        <Typography variant="label-1">User info</Typography>
        <Badge variant={badgeVariant}>
          {t(user.status)}
          {user.requiresManualReview && (
            <IconContainer>
              <IcoWarning16 color={badgeVariant} />
            </IconContainer>
          )}
        </Badge>
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
          <DecryptControls />
          {shouldShowManualReview && <ManualReview user={user} />}
        </RowContainer>
      </SplitRow>
    </HeaderContainer>
  );
};

const IconContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};
  `};
`;

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
