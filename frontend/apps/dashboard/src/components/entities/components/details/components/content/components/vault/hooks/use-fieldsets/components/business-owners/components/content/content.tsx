import { useTranslation } from '@onefootprint/hooks';
import {
  BusinessOwner,
  isVaultDataEmpty,
  isVaultDataEncrypted,
  VaultValue,
} from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { FieldOrPlaceholder } from 'src/components';
import StatusBadge from 'src/components/status-badge';
import getFullName from 'src/utils/get-full-name-data';
import styled, { css } from 'styled-components';

import Field, { FieldProps } from '../../../../../../components/field';
import isVaultDataBusinessOwner from './utils/is-vault-data-business-owner';

export type ContentProps = FieldProps & {
  businessOwners: BusinessOwner[];
  value: VaultValue;
};

const BusinessOwnersField = ({
  businessOwners,
  canDecrypt,
  disabled,
  label,
  name,
  showCheckbox,
  value,
}: ContentProps) => {
  const { t } = useTranslation('pages.entity.vault.bos');

  const renderValue = (index: number) => {
    if (
      isVaultDataEncrypted(value) ||
      isVaultDataEmpty(value) ||
      !isVaultDataBusinessOwner(value)
    ) {
      return <FieldOrPlaceholder data={value} />;
    }

    if (isVaultDataBusinessOwner(value)) {
      const bo = value[index];
      return (
        <FieldOrPlaceholder data={getFullName(bo.first_name, bo.last_name)} />
      );
    }

    return null;
  };

  const renderLabel = (businessOwner: BusinessOwner) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body-3" color="tertiary">
        {label}
      </Typography>
      {businessOwner.status && <StatusBadge status={businessOwner.status} />}
      {businessOwner.id && (
        <>
          <span>·</span>
          <Typography color="accent" variant="label-4">
            <Link
              target="_blank"
              href={`/users/detail?footprint_user_id=${businessOwner.id}`}
            >
              {t('link')}
            </Link>
          </Typography>
        </>
      )}
    </Box>
  );

  return (
    <Box testID="business-owners-content">
      <Grid>
        {businessOwners.map((businessOwner, index) => (
          <FieldContainer
            key={businessOwner.id || index}
            hideCheckbox={index !== 0}
          >
            <Field
              canDecrypt={canDecrypt}
              disabled={disabled}
              hint={t(
                businessOwner.kind === 'primary'
                  ? 'hint.primary'
                  : 'hint.secondary',
                { stake: businessOwner.ownershipStake },
              )}
              label={label}
              name={name}
              showCheckbox={showCheckbox}
              value={value}
              renderValue={() => renderValue(index)}
              renderLabel={() => renderLabel(businessOwner)}
            />
          </FieldContainer>
        ))}
      </Grid>
    </Box>
  );
};

const FieldContainer = styled.div<{ hideCheckbox: boolean }>`
  ${({ hideCheckbox }) =>
    hideCheckbox &&
    css`
      input[type='checkbox'] {
        visibility: hidden;
      }
    `}
`;

const Grid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[4]};
  `}
`;

export default BusinessOwnersField;
