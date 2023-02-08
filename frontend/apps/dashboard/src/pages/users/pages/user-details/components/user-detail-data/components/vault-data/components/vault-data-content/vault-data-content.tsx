import { useTranslation } from '@onefootprint/hooks';
import { IdDocType, UserDataAttribute } from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import { User, UserVaultData } from 'src/pages/users/users.types';
import styled, { css } from 'styled-components';

import getSectionsVisibility from '../../utils/get-sections-visibility';
import AddressSection from './components/address-section';
import BasicSection from './components/basic-section';
import IdDocSection from './components/id-doc-section';
import IdentitySection from './components/identity-section';

// Only add first name in the form as a checkbox, combine first & last to show when decrypted
type FormKycAttributes = Exclude<UserDataAttribute, UserDataAttribute.lastName>;
// Only add frontImage in the form as a checkbox, show both front & back (if available) when decrypted

export type FormData = {
  kycData: Partial<Record<FormKycAttributes, boolean>>;
  idDoc: Partial<Record<IdDocType, boolean>>;
};

export type VaultDataContentProps = {
  user: User;
  vaultData: UserVaultData;
  isDecrypting: boolean;
};

const VaultDataContent = ({
  user,
  vaultData,
  isDecrypting,
}: VaultDataContentProps) => {
  const { t } = useTranslation('pages.user-details.vault-data');
  const sectionsVisibility = getSectionsVisibility(vaultData);
  const { basicSection, identitySection, addressSection, idDocSection } =
    sectionsVisibility;
  const isNoData =
    !basicSection && !identitySection && !addressSection && !idDocSection;

  return (
    <DataGrid>
      {basicSection && (
        <BasicSection
          user={user}
          vaultData={vaultData}
          isDecrypting={isDecrypting}
        />
      )}
      {identitySection && (
        <IdentitySection
          user={user}
          vaultData={vaultData}
          isDecrypting={isDecrypting}
        />
      )}
      {addressSection && (
        <Box
          sx={{
            gridRow: identitySection ? '1 / span 2' : undefined,
            gridColumn: '2 / 2',
          }}
        >
          <AddressSection
            user={user}
            vaultData={vaultData}
            isDecrypting={isDecrypting}
          />
        </Box>
      )}
      {idDocSection && (
        <Box
          sx={{
            gridRow: '3 / 3',
            gridColumn: '1 / 3',
          }}
        >
          <IdDocSection
            user={user}
            vaultData={vaultData}
            isDecrypting={isDecrypting}
          />
        </Box>
      )}
      {isNoData && <Typography variant="body-3">{t('empty-state')}</Typography>}
    </DataGrid>
  );
};

const DataGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
  `};
`;

export default VaultDataContent;
