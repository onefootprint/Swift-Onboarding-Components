import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { Badge, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import useUser from 'src/hooks/use-user';
import getOnboardingStatusBadgeVariant from 'src/pages/users/utils/get-onboarding-status-badge-variant';
import styled, { css } from 'styled-components';

import useUserId from '../../../../hooks/use-user-id';
import { State } from '../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../decrypt-machine-provider';
import DecryptControls from './components/decrypt-controls';
import ManualReview from './components/manual-review';

const UserHeader = () => {
  const userId = useUserId();
  const {
    user: { metadata },
  } = useUser(userId);
  const { t } = useTranslation('pages.user-details.user-header.status');
  const [state] = useDecryptMachine();
  const shouldShowManualReview = state.matches(State.idle);
  if (!metadata) {
    return null;
  }

  const badgeVariant = getOnboardingStatusBadgeVariant(
    metadata.status,
    metadata.requiresManualReview,
  );

  return (
    <HeaderContainer>
      <RowContainer>
        <Typography variant="label-1">User info</Typography>
        <Badge variant={badgeVariant}>
          {t(metadata.status)}
          {metadata.requiresManualReview && (
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
            {new Date(metadata.startTimestamp).toLocaleString('en-us', {
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
          <CodeInline>{metadata.id}</CodeInline>
        </RowContainer>
        <RowContainer>
          <DecryptControls />
          {shouldShowManualReview && <ManualReview />}
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
