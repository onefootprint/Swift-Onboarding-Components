import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16, IcoPencil16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { LinkButton, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import {
  Kind,
  PersonalInformationAndDocs,
} from '@/playbooks/utils/machine/types';

import DisplayValue from './components/display-value';
import useFormValues from './hooks/use-form-values';

type PreviewProps = {
  startEditing: () => void;
  kind: Kind;
};

const Preview = ({ startEditing, kind }: PreviewProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.form.personal-info-and-docs',
  );
  const { formValues } = useFormValues();
  const { getValues } = useFormContext();
  const personalInfoAndDocs: PersonalInformationAndDocs = getValues(
    'personalInformationAndDocs',
  );

  return (
    <Container>
      <Header>
        {kind === Kind.KYB ? (
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
          onClick={startEditing}
          iconComponent={IcoPencil16}
          iconPosition="left"
          size="tiny"
        >
          {t('preview.edit')}
        </LinkButton>
      </Header>
      <CollectedInformationContainer>
        {formValues.map(field => (
          <CollectedInformation key={field}>
            <Typography
              variant="body-3"
              color="tertiary"
              sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}
            >
              {t(`preview.${field}`)}
            </Typography>
            <ValueContainer>
              <DisplayValue
                field={field as keyof PersonalInformationAndDocs}
                personalInfoAndDocs={personalInfoAndDocs}
              />
            </ValueContainer>
          </CollectedInformation>
        ))}
      </CollectedInformationContainer>
    </Container>
  );
};

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const CollectedInformation = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    gap: ${theme.spacing[10]};
    height: ${theme.spacing[7]};
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  white-space: pre-wrap;
`;

const CollectedInformationContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
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

export default Preview;
