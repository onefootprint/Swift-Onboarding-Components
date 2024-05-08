import { CollectedKybDataOption } from '@onefootprint/types';
import { Box, Checkbox, Divider, LinkButton, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CollectedInformation from '@/playbooks/components/collected-information';
import type { Personal, SummaryMeta } from '@/playbooks/utils/machine/types';
import {
  OnboardingTemplate,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import DocEditor from './components/doc-editor';
import PreviewHeader from './components/doc-editor/preview-header';
import useIdDocFirstFlowEnabled from './hooks/use-id-doc-first-flow-enabled';

type PreviewProps = {
  onStartEditing: () => void;
  meta: SummaryMeta;
};

const Preview = ({ onStartEditing, meta }: PreviewProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.summary.person',
  });
  const { getValues, register } = useFormContext();
  const values: Personal = getValues('personal');
  const collectBO = getValues(
    `businessInformation.${CollectedKybDataOption.beneficialOwners}`,
  );
  const isKyb = meta.kind === PlaybookKind.Kyb;
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
  const showIdDocScan =
    values.idDocKind.length > 0 ||
    Object.keys(values.countrySpecificIdDocKind).length > 0;
  const [showIdDocEditor, setShowIdDocEditor] = useState(false);
  const canEdit =
    !internationalOnly && meta.onboardingTemplate === OnboardingTemplate.Custom;
  const allowUsTerritoryResidents = meta.residency?.allowUsTerritories;

  if (isKyb && !collectBO) {
    return (
      <Container>
        <PreviewHeader
          meta={meta}
          canEdit={canEdit}
          onStartEditing={onStartEditing}
        />
        <CollectedInformation
          options={{
            businessBeneficialOwners: !!collectBO,
          }}
        />
      </Container>
    );
  }

  return (
    <Container>
      <PreviewHeader
        meta={meta}
        canEdit={canEdit}
        onStartEditing={onStartEditing}
      />
      <FormElementsContainer>
        {isKyb && (
          <CollectedInformation
            options={{
              businessBeneficialOwners: !!collectBO,
            }}
          />
        )}
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
            }}
          />
        )}
        {showIdDocScan && (
          <CollectedInformation
            title={t('id-doc.title')}
            options={{
              idDocKind: values.idDocKind,
              selfie: values.selfie,
              countrySpecificIdDocKind: values.countrySpecificIdDocKind,
            }}
          />
        )}
        {internationalOnly &&
          (showIdDocEditor ? (
            <DocEditor onDone={() => setShowIdDocEditor(false)} />
          ) : (
            <LinkButton onClick={() => setShowIdDocEditor(true)}>
              {showIdDocScan ? t('id-doc.edit') : t('id-doc.add')}
            </LinkButton>
          ))}
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
