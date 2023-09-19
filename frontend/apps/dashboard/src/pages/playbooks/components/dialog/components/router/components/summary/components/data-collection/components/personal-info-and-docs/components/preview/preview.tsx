import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16, IcoPencil16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Checkbox, LinkButton, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import useSession from 'src/hooks/use-session';

import type {
  PersonalInformationAndDocs,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';
import {
  basicInformationFields,
  PlaybookKind,
  usResidentFormFields,
} from '@/playbooks/utils/machine/types';

import CollectedInformation from './components/collected-information';
import useFormValues from './hooks/use-form-values';

type PreviewProps = {
  onStartEditing: () => void;
  meta: SummaryMeta;
};

const Preview = ({ onStartEditing, meta }: PreviewProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.summary.form.personal-info-and-docs',
  );
  const {
    data: { user, org },
  } = useSession();
  const { formValues } = useFormValues();
  const { getValues, watch, register } = useFormContext();
  const personalInfoAndDocs: PersonalInformationAndDocs = getValues(
    'personalInformationAndDocs',
  );
  const hasIdDoc = watch('personalInformationAndDocs.idDocKind').length > 0;
  const hasUserPermission = user?.isFirmEmployee;
  // TODO: Move to a feature flag
  const hasOrgPermissionForIdDocFirst = org?.name
    .toLowerCase()
    .includes('flexcar');
  const showIdDocFirstFlowOption =
    hasIdDoc &&
    meta.kind === PlaybookKind.Kyc &&
    (hasUserPermission || hasOrgPermissionForIdDocFirst);

  const basicInformationFormValues = formValues.filter(field =>
    basicInformationFields.includes(field as keyof PersonalInformationAndDocs),
  );

  const usResidentFormValues = formValues
    .filter(field =>
      usResidentFormFields.includes(field as keyof PersonalInformationAndDocs),
    )
    // preserve order so ID doc and selfie are together
    .sort(
      (a, b) =>
        usResidentFormFields.indexOf(a) - usResidentFormFields.indexOf(b),
    );

  const showNonUsResidentEmptyState =
    meta.residency?.allowInternationalResidents === false;

  return (
    <Container>
      <Header>
        {meta.kind === PlaybookKind.Kyb ? (
          <TitleContainer>
            <Typography variant="label-3">{t('title.kyb.main')}</Typography>
            <Tooltip
              position="right"
              alignment="center"
              text={t('title.kyb.tooltip')}
            >
              <IcoInfo16 testID="info-tooltip" />
            </Tooltip>
          </TitleContainer>
        ) : (
          <Typography variant="label-3">{t('title.kyc')}</Typography>
        )}
        <LinkButton
          onClick={onStartEditing}
          iconComponent={IcoPencil16}
          iconPosition="left"
          size="tiny"
        >
          {t('preview.edit')}
        </LinkButton>
      </Header>
      <FormElementsContainer>
        <CollectedInformation
          fields={basicInformationFormValues}
          personalInfoAndDocs={personalInfoAndDocs}
          title={t('basic-information.title')}
        />
        <CollectedInformation
          fields={usResidentFormValues}
          personalInfoAndDocs={personalInfoAndDocs}
          title={t('us-residents.title')}
        />
        {showNonUsResidentEmptyState && (
          <CollectedInformation
            title={t('non-us-residents.title')}
            subtitle={t('non-us-residents.empty')}
          />
        )}
      </FormElementsContainer>
      {showIdDocFirstFlowOption && (
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
