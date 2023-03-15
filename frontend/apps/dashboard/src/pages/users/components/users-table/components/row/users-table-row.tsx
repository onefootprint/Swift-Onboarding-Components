import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import { Badge, Box, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import FieldOrPlaceholder from 'src/components/field-or-placeholder';
import useUserVault from 'src/pages/users/pages/user-details/hooks/use-user-vault';
import { User } from 'src/pages/users/users.types';
import getFullNameDataValue from 'src/pages/users/utils/get-full-name-data';
import getUserStatusBadgeVariant from 'src/pages/users/utils/get-user-status-badge-variant';

type RowProps = {
  user: User;
};

const Row = ({ user }: RowProps) => {
  const { t } = useTranslation();
  const { data: vaultData } = useUserVault(user.id, user);
  const badgeVariant = getUserStatusBadgeVariant(
    user.status,
    user.requiresManualReview,
  );

  return (
    <>
      <td>
        <FieldOrPlaceholder
          data={getFullNameDataValue(
            vaultData?.kycData[UserDataAttribute.firstName],
            vaultData?.kycData[UserDataAttribute.lastName],
          )}
        />
      </td>
      <td>
        <CodeInline isPrivate truncate>
          {user.id}
        </CodeInline>
      </td>
      <td>
        <Badge variant={badgeVariant}>
          {t(`entity-statuses.${user.status}`)}
          {user.requiresManualReview && (
            <Box sx={{ marginLeft: 2 }}>
              <IcoWarning16 color={badgeVariant} />
            </Box>
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

export default Row;
