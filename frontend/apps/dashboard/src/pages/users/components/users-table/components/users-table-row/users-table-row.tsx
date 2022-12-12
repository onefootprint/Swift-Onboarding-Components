import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Badge, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { statusToBadgeVariant } from 'src/constants/onboarding-status-display';
import FieldOrPlaceholder from 'src/pages/users/components/field-or-placeholder';
import { User } from 'src/pages/users/types/user.types';
import getFullNameDataValue from 'src/pages/users/utils/get-full-name-data';

type UsersTableRowProps = {
  user: User;
};

const UsersTableRow = ({ user }: UsersTableRowProps) => {
  const { allT } = useTranslation('pages.users');

  return (
    <>
      <td>
        <FieldOrPlaceholder data={getFullNameDataValue(user.vaultData)} />
      </td>
      <td>
        <CodeInline truncate>{user.id}</CodeInline>
      </td>

      <td>
        <Badge variant={statusToBadgeVariant[user.status]}>
          {allT(`pages.user-details.user-header.status.${user.status}`)}
        </Badge>
        {user.requiresManualReview && (
          <Badge variant="error">
            {allT('pages.user-details.user-header.status.manual-review')}
          </Badge>
        )}
      </td>
      <td>
        <FieldOrPlaceholder
          data={user.vaultData.kycData[UserDataAttribute.email]}
        />
      </td>
      <td>
        <FieldOrPlaceholder
          data={
            user.vaultData.kycData[UserDataAttribute.ssn9] ||
            user.vaultData.kycData[UserDataAttribute.ssn4]
          }
        />
      </td>
      <td>
        <FieldOrPlaceholder
          data={user.vaultData.kycData[UserDataAttribute.phoneNumber]}
        />
      </td>
      <td>
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
      </td>
    </>
  );
};

export default UsersTableRow;
