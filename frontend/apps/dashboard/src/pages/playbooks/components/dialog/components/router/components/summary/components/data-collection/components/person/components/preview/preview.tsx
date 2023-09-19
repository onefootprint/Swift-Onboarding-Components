import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16, IcoPencil16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, LinkButton, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type {
  PersonalInformationAndDocs,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';

import CollectedInformation from './components/collected-information';
import useIdDocFirstFlowEnabled from './hooks/use-id-doc-first-flow-enabled';

type PreviewProps = {
  onStartEditing: () => void;
  meta: SummaryMeta;
};

const Preview = ({ onStartEditing, meta }: PreviewProps) => {
  const { t } = useTranslation('pages.playbooks.dialog.summary.form.person');
  const { getValues, register } = useFormContext();
  const values: PersonalInformationAndDocs = getValues(
    'personalInformationAndDocs',
  );
  const isIdDocFirstFlowEnabled = useIdDocFirstFlowEnabled(
    meta.kind === PlaybookKind.Kyc,
  );
  const showNonUsResidentsEmptyState =
    meta.residency?.allowInternationalResidents === false;
  const showUsResidentsEmptyState = meta.residency?.allowUsResidents === false;

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
        <LinkButton
          iconComponent={IcoPencil16}
          iconPosition="left"
          onClick={onStartEditing}
          size="tiny"
        >
          {t('preview.edit')}
        </LinkButton>
      </Header>
      <FormElementsContainer>
        <CollectedInformation
          title={t('us-residents.title')}
          options={{
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
              idDocKind: values.idDocKind,
              selfie: values.idDocKind.length > 0 && values.selfie,
              usLegalStatus: values.us_legal_status,
              ssn: {
                active: values.ssn,
                kind: values.ssnKind,
                optional: values.ssnOptional,
              },
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
              idDocKind: [SupportedIdDocTypes.passport],
              selfie: true,
            }}
          />
        )}
      </FormElementsContainer>
      {isIdDocFirstFlowEnabled && (
        <Subsection>
          <Checkbox
            label={t('id-doc-first.checkbox')}
            {...register('personalInformationAndDocs.idDocFirst')}
          />
          <Typography
            color="tertiary"
            sx={{ paddingLeft: 7, marginLeft: 2, width: '100%' }}
            variant="body-3"
          >
            {t('id-doc-first.warning')}
          </Typography>
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
