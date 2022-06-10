import { DataKind } from '@src/pages/users/hooks/use-decrypt-user';
import {
  statusToBadgeVariant,
  statusToDisplayText,
} from '@src/pages/users/hooks/use-get-onboardings';
import React from 'react';
import { User } from 'src/pages/users/hooks/use-join-users';
import styled, { css } from 'styled-components';
import { Badge, Code, Typography } from 'ui';

import DecryptModal from '../decrypt-modal';

type BasicInfoProps = {
  user: User;
  onDecrypt: (
    fieldsToDecrypt: (keyof typeof DataKind)[],
    reason: string,
  ) => void;
};

const UserHeader = ({ user, onDecrypt }: BasicInfoProps) => {
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
        <DecryptModal user={user} onDecrypt={onDecrypt} />
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

export default UserHeader;
