import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

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
  const { allT, t } = useTranslation(
    'pages.playbooks.dialog.authorized-scopes',
  );
  const { register } = useFormContext();
  const { personalInformationAndDocs } = playbook;
  const { selfie, idDoc, ssn, ssnKind } = personalInformationAndDocs;
  const usLegalStatus =
    personalInformationAndDocs[CollectedKycDataOption.usLegalStatus];
  const phoneNumber =
    personalInformationAndDocs[CollectedKycDataOption.phoneNumber];

  const isCollectingInvestorProfile =
    playbook[CollectedInvestorProfileDataOption.investorProfile] &&
    meta.kind === PlaybookKind.Kyc;
  const allowUS =
    meta.kind === PlaybookKind.Kyb || meta.residency?.allowUsResidents;
  const allowInternational = meta.residency?.allowInternationalResidents;

  return (
    <Sections>
      <ScopeSection>
        <Typography variant="label-3">{t('basic-information')}</Typography>
        <OptionsContainer>
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
        </OptionsContainer>
      </ScopeSection>
      {(ssn || usLegalStatus || idDoc) && allowUS && (
        <ScopeSection>
          <Typography variant="label-3">
            {t('residency.us-residents')}
          </Typography>
          <OptionsContainer>
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
            {idDoc && (
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
          </OptionsContainer>
        </ScopeSection>
      )}
      {allowInternational && (
        <ScopeSection>
          <Typography variant="label-3">
            {t('residency.non-us-residents')}
          </Typography>
          <OptionsContainer>
            <Box>
              <Checkbox
                label={`${allT('cdo.passport')} & ${allT('cdo.selfie')}`}
                disabled
                checked
              />
            </Box>
          </OptionsContainer>
        </ScopeSection>
      )}
      {isCollectingInvestorProfile && (
        <ScopeSection>
          <Typography variant="label-3">{t('investor-profile')}</Typography>
          <OptionsContainer>
            <Checkbox
              label={t('investor-profile-questions')}
              {...register(CollectedInvestorProfileDataOption.investorProfile)}
            />
          </OptionsContainer>
        </ScopeSection>
      )}
    </Sections>
  );
};

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
  `}
`;

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
