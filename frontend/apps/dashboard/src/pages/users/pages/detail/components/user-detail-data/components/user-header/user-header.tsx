import React from 'react';
import { User } from 'src/pages/users/hooks/use-join-users';
import { statusToBadgeVariant, statusToDisplayText } from 'src/types';
import styled, { css } from 'styled-components';
import type { UserDataAttributeKey } from 'types';
import { Badge, CodeInline, Typography } from 'ui';

import DecryptDialog from '../decrypt-dialog';

type BasicInfoProps = {
  user: User;
  onDecrypt: (fieldsToDecrypt: UserDataAttributeKey[], reason: string) => void;
};

const UserHeader = ({ user, onDecrypt }: BasicInfoProps) => {
  const { footprintUserId } = user;
  return (
    <HeaderContainer>
      <RowContainer>
        <Typography variant="label-1" sx={{ userSelect: 'none' }}>
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
        <DecryptDialog user={user} onDecrypt={onDecrypt} />
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
