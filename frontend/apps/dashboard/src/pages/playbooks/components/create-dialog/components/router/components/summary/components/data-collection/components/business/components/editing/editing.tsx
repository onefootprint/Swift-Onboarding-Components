import { CollectedKybDataOption } from '@onefootprint/types';
import { Button, Text, Toggle } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { BusinessInformation } from '@/playbooks/utils/machine/types';

type EditingProps = {
  onStopEditing: () => void;
};

const Editing = ({ onStopEditing }: EditingProps) => {
  const { control, setValue, getValues } = useFormContext();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.summary.business-information.editing',
  });

  const [initialValues] = useState<BusinessInformation>({
    ...getValues('businessInformation'),
  });

  const handleCancel = () => {
    setValue('businessInformation', initialValues);
    onStopEditing();
  };

  return (
    <EditingContainer>
      <Section>
        <Text variant="label-2">{t('business-information')}</Text>
        <Text variant="label-3">{t('address.title')}</Text>
        <Controller
          control={control}
          name={`businessInformation.${CollectedKybDataOption.address}`}
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                }}
                checked={field.value}
                label={t('address.label')}
              />
            </ToggleContainer>
          )}
        />
      </Section>
      <Section>
        <Text variant="label-3">{t('legal-entity-type.title')}</Text>
        <Controller
          control={control}
          name={`businessInformation.${CollectedKybDataOption.corporationType}`}
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                }}
                checked={field.value}
                label={t('legal-entity-type.label')}
              />
            </ToggleContainer>
          )}
        />
      </Section>
      <Section>
        <Text variant="label-3">{t('website.title')}</Text>
        <Controller
          control={control}
          name={`businessInformation.${CollectedKybDataOption.website}`}
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                }}
                defaultChecked={false}
                checked={field.value}
                label={t('website.label')}
              />
            </ToggleContainer>
          )}
        />
      </Section>
      <Section>
        <Text variant="label-3">{t('phone-number.title')}</Text>
        <Controller
          control={control}
          name={`businessInformation.${CollectedKybDataOption.phoneNumber}`}
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                }}
                checked={field.value}
                label={t('phone-number.label')}
              />
            </ToggleContainer>
          )}
        />
      </Section>
      <ButtonContainer>
        <Button variant="primary" fullWidth onClick={onStopEditing}>
          {t('save')}
        </Button>
        <Button variant="secondary" fullWidth onClick={handleCancel}>
          {t('cancel')}
        </Button>
      </ButtonContainer>
    </EditingContainer>
  );
};

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const ToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const EditingContainer = styled.div`
  ${({ theme }) => css`
    gap: ${theme.spacing[8]};
    display: flex;
    flex-direction: column;
  `};
`;

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `};
`;

export default Editing;
