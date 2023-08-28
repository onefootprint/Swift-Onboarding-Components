import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CollectedKybDataOption } from '@onefootprint/types';
import { Button, Toggle, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { BusinessInformation } from '@/playbooks/utils/machine/types';

type EditingProps = {
  stopEditing: () => void;
};

const Editing = ({ stopEditing }: EditingProps) => {
  const { control, setValue, getValues } = useFormContext();
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.form.business-information.editing',
  );

  const [initialValues] = useState<BusinessInformation>({
    ...getValues('businessInformation'),
  });

  const handleCancel = () => {
    setValue('businessInformation', initialValues);
    stopEditing();
  };

  return (
    <EditingContainer>
      <Section>
        <Typography variant="label-2">{t('business-information')}</Typography>
        <Typography variant="label-3">
          {t('legal-entity-type.title')}
        </Typography>
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
                label={t('legal-entity-type.toggle')}
                labelPlacement="right"
              />
            </ToggleContainer>
          )}
        />
      </Section>
      <Section>
        <Typography variant="label-3">{t('website.title')}</Typography>
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
                label={t('website.toggle')}
                labelPlacement="right"
              />
            </ToggleContainer>
          )}
        />
      </Section>
      <Section>
        <Typography variant="label-3">{t('phone-number.title')}</Typography>
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
                label={t('phone-number.toggle')}
                labelPlacement="right"
              />
            </ToggleContainer>
          )}
        />
      </Section>
      <ButtonContainer>
        <Button
          variant="primary"
          fullWidth
          size="compact"
          onClick={stopEditing}
        >
          {t('save')}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          size="compact"
          onClick={handleCancel}
        >
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
