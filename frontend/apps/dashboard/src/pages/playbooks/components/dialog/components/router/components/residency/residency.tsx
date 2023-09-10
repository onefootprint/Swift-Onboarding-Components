import { COUNTRIES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  Button,
  Checkbox,
  Divider,
  MultiSelect,
  Radio,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  type ResidencyFormData,
  CountryRestriction,
  defaultResidencyFormData,
} from '@/playbooks/utils/machine/types';

export type ResidencyProps = {
  onSubmit: (formData: ResidencyFormData) => void;
};

const Residency = ({ onSubmit }: ResidencyProps) => {
  const { t } = useTranslation('pages.playbooks.dialog.residency');
  // TK - logic to ensure we populate previous values and clear this when swapping steps
  const { handleSubmit, register, watch, control } = useForm<ResidencyFormData>(
    {
      defaultValues: defaultResidencyFormData,
    },
  );

  // placeholder
  const submit = (data: ResidencyFormData) => {
    onSubmit(data);
  };

  const otherCountriesSelected = watch('otherCountries');
  const restrictCountriesSelected =
    watch('restrictCountries') === CountryRestriction.restrict;

  const onBack = () => {};

  return (
    <Container>
      <Header>
        <Typography variant="label-1" color="secondary">
          {t('title')}
        </Typography>
        <Typography variant="body-2" color="secondary">
          {t('subtitle')}
        </Typography>
      </Header>
      <Form onSubmit={handleSubmit(submit)}>
        <OptionContainer>
          <Checkbox label={t('us')} {...register('unitedStates')} />
          <Checkbox
            label={t('other-countries')}
            {...register('otherCountries')}
          />
          {otherCountriesSelected && (
            <OtherCountriesAdditionalOptions>
              <AllCountriesContainer>
                <Radio
                  value={CountryRestriction.all}
                  {...register('restrictCountries')}
                  label={t('all-countries.label')}
                />
                <AllCountriesHint>
                  <Typography variant="body-3" color="tertiary">
                    {t('all-countries.hint')}
                  </Typography>
                </AllCountriesHint>
              </AllCountriesContainer>
              <Radio
                {...register('restrictCountries')}
                value={CountryRestriction.restrict}
                label={t('restrict')}
              />
              {restrictCountriesSelected && (
                <>
                  <Divider />
                  <Controller
                    control={control}
                    name="countryList"
                    render={() => (
                      <MultiSelect label={t('initial')} options={COUNTRIES} />
                    )}
                  />
                </>
              )}
            </OtherCountriesAdditionalOptions>
          )}
        </OptionContainer>

        <ButtonContainer>
          <Button variant="secondary" size="compact" onClick={onBack}>
            {t('buttons.back')}
          </Button>
          <Button variant="primary" size="compact" type="submit">
            {t('buttons.continue')}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    padding-top: ${theme.spacing[5]};
  `};
`;

const OptionContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    width: 520px;
    white-space: pre-wrap;
  `};
`;

const AllCountriesHint = styled.div`
  ${({ theme }) => css`
    padding-left: calc(${theme.spacing[7]} + ${theme.spacing[2]});
  `};
`;
const AllCountriesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const OtherCountriesAdditionalOptions = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[2]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding-left: calc(${theme.spacing[7]} + ${theme.spacing[2]});
  `};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default Residency;
