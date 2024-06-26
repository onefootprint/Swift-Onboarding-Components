import { IcoPencil16 } from '@onefootprint/icons';
import { CollectedKybDataOption } from '@onefootprint/types';
import { LinkButton, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { BusinessInformation } from '@/playbooks/utils/machine/types';

import DisplayValue from './components/display-value';

type PreviewProps = {
  onStartEditing: () => void;
};

const Preview = ({ onStartEditing }: PreviewProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.business-information.preview',
  });
  const { getValues } = useFormContext();
  const businessInformation: BusinessInformation = getValues('businessInformation');
  const formValues = Object.keys(businessInformation).filter(cdo => cdo !== CollectedKybDataOption.beneficialOwners);

  return (
    <Container>
      <Header>
        <Text variant="label-3">{t('title')}</Text>
        <LinkButton onClick={onStartEditing} iconComponent={IcoPencil16} iconPosition="left">
          {t('edit')}
        </LinkButton>
      </Header>
      <CollectedInformationContainer>
        {formValues.map(field => (
          <CollectedInformation key={field}>
            <Text variant="body-3" color="tertiary" whiteSpace="nowrap" textAlign="right">
              {t(field as ParseKeys<'common'>)}
            </Text>
            <ValueContainer>
              <DisplayValue field={field as keyof BusinessInformation} businessInformation={businessInformation} />
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
