import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16, IcoPencil16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, LinkButton, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import CollectedInformation from '@/playbooks/components/collected-information';
import type { Personal, SummaryMeta } from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';

import useIdDocFirstFlowEnabled from './hooks/use-id-doc-first-flow-enabled';

type PreviewProps = {
  onStartEditing: () => void;
  meta: SummaryMeta;
};

const Preview = ({ onStartEditing, meta }: PreviewProps) => {
  const { t } = useTranslation('pages.playbooks.dialog.summary.person');
  const { getValues, register } = useFormContext();
  const values: Personal = getValues('personal');
  const isIdDocFirstFlowEnabled = useIdDocFirstFlowEnabled(
    meta.kind === PlaybookKind.Kyc,
  );
  const showNonUsResidentsEmptyState =
    meta.residency?.allowInternationalResidents === false ||
    meta.kind === PlaybookKind.Kyb;
  const showUsResidentsEmptyState = meta.residency?.allowUsResidents === false;
  const internationalOnly =
    meta.residency?.allowInternationalResidents &&
    !meta.residency.allowUsResidents;

  return (
    <Container>
      <Header>
        {meta.kind === PlaybookKind.Kyb ? (
          <TitleContainer>
            <Typography variant="label-3">{t('title.kyb.main')}</Typography>
            <Tooltip
              alignment="center"
              position="right"
              text={t('title.kyb.tooltip')}
            >
              <IcoInfo16 testID="info-tooltip" />
            </Tooltip>
          </TitleContainer>
        ) : (
          <Typography variant="label-3">{t('title.kyc')}</Typography>
        )}
        {internationalOnly ? null : (
          <LinkButton
            iconComponent={IcoPencil16}
            iconPosition="left"
            onClick={onStartEditing}
            size="tiny"
          >
            {t('edit')}
          </LinkButton>
        )}
      </Header>
      <FormElementsContainer>
        <CollectedInformation
          title={t('us-residents.title')}
          options={{
            name: true,
            email: values.email,
            phoneNumber: values.phone_number,
            dob: values.dob,
            fullAddress: values.full_address,
          }}
        />
        {showUsResidentsEmptyState ? (
          <CollectedInformation
            title={t('us-residents.title')}
            subtitle={t('us-residents.empty')}
          />
        ) : (
          <CollectedInformation
            title={t('us-residents.title')}
            options={{
              ssn: {
                active: values.ssn,
                kind: values.ssnKind,
                optional: values.ssnOptional,
              },
              usLegalStatus: values.us_legal_status,
              idDocKind: values.idDocKind,
              selfie: values.idDocKind.length > 0 && values.selfie,
              ...(values.ssnDocScanStepUp
                ? { ssnDocScanStepUp: values.ssnDocScanStepUp }
                : {}),
            }}
          />
        )}
        {showNonUsResidentsEmptyState ? (
          <CollectedInformation
            title={t('non-us-residents.title')}
            subtitle={t('non-us-residents.empty')}
          />
        ) : (
          <CollectedInformation
            title={t('non-us-residents.title')}
            options={{
              ...(meta.residency?.countryList
                ? { countriesRestrictions: meta.residency?.countryList }
                : {}),
              idDocKind: [SupportedIdDocTypes.passport],
              selfie: true,
            }}
          />
        )}
      </FormElementsContainer>
      {isIdDocFirstFlowEnabled && (
        <Subsection>
          <Checkbox
            label={t('id-doc-first.label')}
            hint={t('id-doc-first.hint')}
            {...register('personal.idDocFirst')}
          />
        </Subsection>
      )}
    </Container>
  );
};

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
  `}
`;

const FormElementsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
  `}
`;

const Subsection = styled.div`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} ${theme.borderColor.tertiary} dashed;
    padding-top: ${theme.spacing[5]};
    gap: ${theme.spacing[2]};
  `}
`;

export default Preview;
