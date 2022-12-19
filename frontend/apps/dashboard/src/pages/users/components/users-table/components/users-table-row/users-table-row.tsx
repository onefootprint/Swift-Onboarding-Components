import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import { Badge, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { User } from 'src/hooks/use-user';
import FieldOrPlaceholder from 'src/pages/users/components/field-or-placeholder';
import getFullNameDataValue from 'src/pages/users/utils/get-full-name-data';
import getOnboardingStatusBadgeVariant from 'src/pages/users/utils/get-onboarding-status-badge-variant';
import styled, { css } from 'styled-components';

type UsersTableRowProps = {
  user: User;
};

const UsersTableRow = ({ user }: UsersTableRowProps) => {
  const { allT } = useTranslation('pages.users');
  const { metadata, vaultData } = user;
  if (!metadata) {
    return null;
  }
  const badgeVariant = getOnboardingStatusBadgeVariant(
    metadata.status,
    metadata.requiresManualReview,
  );

  return (
    <>
      <td>
        <FieldOrPlaceholder data={getFullNameDataValue(vaultData)} />
      </td>
      <td>
        <CodeInline truncate>{metadata.id}</CodeInline>
      </td>

      <td>
        <Badge variant={badgeVariant}>
          {allT(`pages.user-details.user-header.status.${metadata.status}`)}
          {metadata.requiresManualReview && (
            <IconContainer>
              <IcoWarning16 color={badgeVariant} />
            </IconContainer>
          )}
        </Badge>
      </td>
      <td>
        <FieldOrPlaceholder
          data={vaultData?.kycData[UserDataAttribute.email]}
        />
      </td>
      <td>
        <FieldOrPlaceholder
          data={
            vaultData?.kycData[UserDataAttribute.ssn9] ||
            vaultData?.kycData[UserDataAttribute.ssn4]
          }
        />
      </td>
      <td>
        <FieldOrPlaceholder
          data={vaultData?.kycData[UserDataAttribute.phoneNumber]}
        />
      </td>
      <td>
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
      </td>
    </>
  );
};

const IconContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};
  `};
`;

export default UsersTableRow;
