import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox, Grid, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type {
  SummaryFormData,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';

type PersonProps = {
  playbook: SummaryFormData;
  meta: SummaryMeta;
};

const Person = ({ playbook, meta }: PersonProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.authorized-scopes',
  });
  const { register } = useFormContext();
  const { personal } = playbook;
  const { selfie, idDocKind, ssn, ssnKind } = personal;
  const usLegalStatus = personal[CollectedKycDataOption.usLegalStatus];
  const phoneNumber = personal[CollectedKycDataOption.phoneNumber];

  const isCollectingInvestorProfile =
    playbook[CollectedInvestorProfileDataOption.investorProfile] &&
    meta.kind === PlaybookKind.Kyc;
  const allowUS =
    meta.kind === PlaybookKind.Kyb || meta.residency?.allowUsResidents;
  const allowInternational = meta.residency?.allowInternationalResidents;

  return (
    <Sections>
      <ScopeSection>
        <Text variant="label-3">{t('basic-information')}</Text>
        <Grid.Container gap={3} columns={['repeat(2, 1fr)']} width="100%">
          <Checkbox disabled checked label={allT('cdo.email')} />
          {phoneNumber && (
            <Checkbox disabled checked label={allT('cdo.phone_number')} />
          )}
          <Checkbox
            label={allT('cdo.name')}
            {...register(CollectedKycDataOption.name)}
          />
          <Checkbox
            label={allT('cdo.dob')}
            {...register(CollectedKycDataOption.dob)}
          />
          <Checkbox
            label={allT('cdo.full_address')}
            {...register(CollectedKycDataOption.address)}
          />
        </Grid.Container>
      </ScopeSection>
      {(ssn || usLegalStatus || idDocKind.length > 0) && allowUS && (
        <ScopeSection>
          <Text variant="label-3">{t('us-residents')}</Text>
          <Grid.Container gap={3} columns={['repeat(2, 1fr)']} width="100%">
            {usLegalStatus && (
              <Checkbox
                label={allT('cdo.us_legal_status')}
                {...register(CollectedKycDataOption.usLegalStatus)}
              />
            )}
            {ssn &&
              (ssnKind === CollectedKycDataOption.ssn4 ? (
                <Checkbox
                  label={allT('cdo.ssn4')}
                  {...register(CollectedKycDataOption.ssn4)}
                />
              ) : (
                <Checkbox
                  label={allT('cdo.ssn9')}
                  {...register(CollectedKycDataOption.ssn9)}
                />
              ))}
            {idDocKind.length > 0 && (
              <Box>
                <Checkbox
                  label={
                    selfie
                      ? allT('cdo.document_and_selfie')
                      : allT('cdo.document')
                  }
                  {...register(CollectedDocumentDataOption.document)}
                />
              </Box>
            )}
          </Grid.Container>
        </ScopeSection>
      )}
      {allowInternational && (
        <ScopeSection>
          <Text variant="label-3">{t('non-us-residents')}</Text>
          <Grid.Container gap={3} columns={['repeat(2, 1fr)']} width="100%">
            <Box>
              <Checkbox
                label={`${allT('cdo.passport')} & ${allT('cdo.selfie')}`}
                disabled
                checked
              />
            </Box>
          </Grid.Container>
        </ScopeSection>
      )}
      {isCollectingInvestorProfile && (
        <ScopeSection>
          <Text variant="label-3">{t('investor-profile')}</Text>
          <Grid.Container gap={3} columns={['repeat(2, 1fr)']} width="100%">
            <Checkbox
              label={t('investor-profile-questions')}
              {...register(CollectedInvestorProfileDataOption.investorProfile)}
            />
          </Grid.Container>
        </ScopeSection>
      )}
    </Sections>
  );
};

const Sections = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    width: 100%;
  `}
`;

const ScopeSection = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    width: 100%;
  `}
`;

export default Person;
