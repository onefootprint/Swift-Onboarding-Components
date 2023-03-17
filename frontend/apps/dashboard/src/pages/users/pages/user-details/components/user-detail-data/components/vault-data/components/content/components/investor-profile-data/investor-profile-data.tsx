import { useTranslation } from '@onefootprint/hooks';
import { IcoDollar24 } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import { User, UserVaultData } from 'src/pages/users/users.types';
import styled, { css } from 'styled-components';

import DataSection from '../data-section';
import Field from '../field';
import useFields from './hooks/use-fields';

export type InvestorProfileDataProps = {
  user: User;
  vaultData: UserVaultData;
  isDecrypting: boolean;
};

// TODO:
// https://linear.app/footprint/issue/FP-3136/dashboard-broker-risk-signal-for-investor-profile
const InvestorProfileData = ({
  user,
  vaultData,
  isDecrypting,
}: InvestorProfileDataProps) => {
  const { t } = useTranslation('pages.user-details.user-info.investor-profile');
  const [left, right] = useFields(user, vaultData, isDecrypting);

  return (
    <DataSection iconComponent={IcoDollar24} title={t('title')}>
      <Grid>
        <Column>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {left.map(column => (
              <Box key={column.title}>
                <Typography variant="label-2" sx={{ marginBottom: 5 }}>
                  {column.title}
                </Typography>
                <Fields>
                  {column.fields.map(field => (
                    <Field
                      canAccess={field.canAccess}
                      canSelect={field.canSelect}
                      hasPermission={field.hasPermission}
                      hasValue={field.hasValue}
                      isDataDecrypted={field.isDataDecrypted}
                      key={field.name}
                      label={field.label}
                      name={field.name}
                      showCheckbox={field.showCheckbox}
                      value={field.value}
                    />
                  ))}
                </Fields>
              </Box>
            ))}
          </Box>
        </Column>
        <Separator />
        <Column>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {right.map(column => (
              <Box key={column.title}>
                <Typography variant="label-2" sx={{ marginBottom: 5 }}>
                  {column.title}
                </Typography>
                <Fields>
                  {column.fields.map(field => (
                    <Field
                      canAccess={field.canAccess}
                      canSelect={field.canSelect}
                      hasPermission={field.hasPermission}
                      hasValue={field.hasValue}
                      isDataDecrypted={field.isDataDecrypted}
                      key={field.name}
                      label={field.label}
                      name={field.name}
                      showCheckbox={field.showCheckbox}
                      value={field.value}
                    />
                  ))}
                </Fields>
              </Box>
            ))}
          </Box>
        </Column>
      </Grid>
    </DataSection>
  );
};

const Grid = styled.div`
  display: flex;
`;

const Column = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Separator = styled.div`
  ${({ theme }) => css`
    width: ${theme.borderWidth[1]};
    background: ${theme.borderColor.primary};
    margin: 0 ${theme.spacing[7]};
  `};
`;

const Fields = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
    flex-direction: column;
  `};
`;

export default InvestorProfileData;
