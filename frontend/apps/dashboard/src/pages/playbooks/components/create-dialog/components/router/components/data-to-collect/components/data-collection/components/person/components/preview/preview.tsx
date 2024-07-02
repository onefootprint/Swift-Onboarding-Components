import { CollectedKybDataOption } from '@onefootprint/types';
import { Box, Checkbox, Divider, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CollectedInformation from '@/playbooks/components/collected-information';
import type { DataToCollectMeta, Personal } from '@/playbooks/utils/machine/types';
import { OnboardingTemplate, PlaybookKind } from '@/playbooks/utils/machine/types';

import { isKyb } from 'src/pages/playbooks/utils/kind';
import PreviewHeader from './components/preview-header';
import useIdDocFirstFlowEnabled from './hooks/use-id-doc-first-flow-enabled';

type PreviewProps = {
  onStartEditing: () => void;
  meta: DataToCollectMeta;
};

const Preview = ({ onStartEditing, meta }: PreviewProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.data-to-collect.person' });
  const { getValues, register } = useFormContext();
  const values: Personal = getValues('personal');
  const collectBO = getValues(`businessInformation.${CollectedKybDataOption.beneficialOwners}`);
  const isIdDocOnlyFirstFlowEnabled = useIdDocFirstFlowEnabled(meta.kind === PlaybookKind.Kyc);
  const showNonUsResidentsEmptyState =
    meta.residency?.allowInternationalResidents === false || meta.kind === PlaybookKind.Kyb;
  const showUsResidentsEmptyState = meta.residency?.allowUsResidents === false;
  const internationalOnly = meta.residency?.allowInternationalResidents && !meta.residency.allowUsResidents;
  const isFixedPlaybook =
    meta.onboardingTemplate === OnboardingTemplate.Alpaca || meta.onboardingTemplate === OnboardingTemplate.Apex;
  const canEdit = !internationalOnly && !isFixedPlaybook;
  const allowUsTerritoryResidents = meta.residency?.allowUsTerritories;

  if (isKyb(meta.kind) && !collectBO) {
    return (
      <Container>
        <PreviewHeader meta={meta} canEdit={canEdit} onStartEditing={onStartEditing} />
        <CollectedInformation options={{ businessBeneficialOwners: !!collectBO }} />
      </Container>
    );
  }

  return (
    <Container>
      <PreviewHeader meta={meta} canEdit={canEdit} onStartEditing={onStartEditing} />
      <FormElementsContainer>
        {isKyb(meta.kind) && <CollectedInformation options={{ businessBeneficialOwners: !!collectBO }} />}
        <CollectedInformation
          title={t('basic-information.title')}
          options={{
            name: true,
            email: values.email,
            phoneNumber: values.phone_number,
            dob: values.dob,
            fullAddress: values.full_address,
          }}
        />
        {showUsResidentsEmptyState ? (
          <CollectedInformation title={t('us-residents.title')} subtitle={t('us-residents.empty')} />
        ) : (
          <CollectedInformation
            title={t('us-residents.title')}
            options={{
              ssn: {
                active: values.ssn,
                kind: values.ssnKind,
                optional: values.ssnOptional,
              },
              usTaxIdAcceptable: values.usTaxIdAcceptable,
              usLegalStatus: values.us_legal_status,
            }}
          />
        )}
        {showNonUsResidentsEmptyState ? (
          <CollectedInformation title={t('non-us-residents.title')} subtitle={t('non-us-residents.empty')} />
        ) : (
          <CollectedInformation
            title={t('non-us-residents.title')}
            options={{
              ...(meta.residency?.countryList ? { countriesRestrictions: meta.residency?.countryList } : {}),
            }}
          />
        )}
      </FormElementsContainer>
      {isIdDocOnlyFirstFlowEnabled && !isFixedPlaybook && (
        <Subsection>
          <Checkbox
            label={t('id-doc-first.label')}
            hint={t('id-doc-first.hint')}
            {...register('personal.idDocFirst')}
          />
        </Subsection>
      )}
      {allowUsTerritoryResidents && (
        <footer>
          <Box marginTop={5} marginBottom={5}>
            <Divider variant="secondary" />
          </Box>
          <Text variant="label-3" color="primary">
            {t('us-territories.label')}{' '}
            <Text variant="label-3" color="tertiary" tag="span">
              {t('us-territories.content')}
            </Text>
          </Text>
        </footer>
      )}
    </Container>
  );
};

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
