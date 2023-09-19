import { useTranslation } from '@onefootprint/hooks';
import { IcoPencil16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { BusinessInformation } from '@/playbooks/utils/machine/types';

import DisplayValue from './components/display-value';

type PreviewProps = {
  onStartEditing: () => void;
};

const Preview = ({ onStartEditing }: PreviewProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.summary.form.business-information.preview',
  );
  const { getValues } = useFormContext();
  const businessInformation: BusinessInformation = getValues(
    'businessInformation',
  );
  const formValues = Object.keys(businessInformation);

  return (
    <Container>
      <Header>
        <Typography variant="label-3">{t('title')}</Typography>
        <LinkButton
          onClick={onStartEditing}
          iconComponent={IcoPencil16}
          iconPosition="left"
          size="compact"
        >
          {t('edit')}
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
              {t(field)}
            </Typography>
            <ValueContainer>
              <DisplayValue
                field={field as keyof BusinessInformation}
                businessInformation={businessInformation}
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
