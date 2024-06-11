import type { BusinessOwner, Entity } from '@onefootprint/types';
import { BusinessDI, isVaultDataEmpty, isVaultDataEncrypted } from '@onefootprint/types';
import { Box, Grid, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FieldOrPlaceholder } from 'src/components';
import StatusBadge from 'src/components/status-badge';
import getFullName from 'src/utils/get-full-name';
import styled, { css } from 'styled-components';

import useField from '../../../../../../../../hooks/use-field';
import Field from '../../../../../../../field';
import isVaultDataBusinessOwner from './utils/is-vault-data-business-owner';

export type ContentProps = {
  businessOwners: BusinessOwner[];
  entity: Entity;
};

const BusinessOwnersField = ({ businessOwners, entity }: ContentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.business.vault.bos',
  });
  const field = useField(entity);
  let di = BusinessDI.beneficialOwners;
  if (entity.attributes.includes(BusinessDI.kycedBeneficialOwners)) {
    // This is really unique - we render two different DIs in the same section since their contents
    // are almost identical: kycedBOs and BOs.
    // Here, we just check which type DI for BOs exists in the vault and use it
    // TODO: this displays the BOs' name from the vault, but if the BO is kyced they may have a
    // different name on their profile
    di = BusinessDI.kycedBeneficialOwners;
  }
  const { label, value } = field(di);

  const renderValue = (index: number) => {
    if (isVaultDataEncrypted(value) || isVaultDataEmpty(value) || !isVaultDataBusinessOwner(value)) {
      return <FieldOrPlaceholder data={value} />;
    }

    if (isVaultDataBusinessOwner(value)) {
      const bo = value[index];
      return <FieldOrPlaceholder data={getFullName(bo.first_name, bo.middle_name, bo.last_name)} />;
    }

    return null;
  };

  const renderLabel = (businessOwner: BusinessOwner) => (
    <Stack align="center" gap={2}>
      <Text variant="body-3" color="tertiary">
        {label}
      </Text>
      {businessOwner.status && <StatusBadge status={businessOwner.status} />}
      {businessOwner.id && (
        <>
          <span>·</span>
          <Text color="accent" variant="label-4">
            <Link target="_blank" href={`/users/${businessOwner.id}`}>
              {t('link')}
            </Link>
          </Text>
        </>
      )}
    </Stack>
  );

  const boHintText = ({ ownershipStake: stake, kind, source }: BusinessOwner): string => {
    const isPrimary = kind === 'primary' && source !== 'tenant';
    if (isPrimary) {
      return stake ? t('hint.primary_with_stake', { stake }) : t('hint.primary_no_stake');
    }
    return stake ? t('hint.generic_stake', { stake }) : '';
  };

  return (
    <Box testID="business-owners-content">
      <Grid.Container gap={4}>
        {businessOwners.map((businessOwner, index) => (
          <FieldContainer key={businessOwner.id || index} hideCheckbox={index !== 0}>
            <Field
              entity={entity}
              di={di}
              hint={boHintText(businessOwner)}
              renderValue={() => renderValue(index)}
              renderLabel={() => renderLabel(businessOwner)}
              skipRegisterFieldToDecryptForm={index > 0}
            />
          </FieldContainer>
        ))}
      </Grid.Container>
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

export default BusinessOwnersField;
