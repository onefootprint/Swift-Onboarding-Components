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
} from '@/playbooks/utils/machine/types';

export type ResidencyProps = {
  defaultValues: ResidencyFormData;
  onBack: () => void;
  onSubmit: (formData: ResidencyFormData) => void;
};

const Residency = ({ defaultValues, onBack, onSubmit }: ResidencyProps) => {
  const { t, allT } = useTranslation('pages.playbooks.dialog.residency');
  const { handleSubmit, register, watch, control } = useForm<ResidencyFormData>(
    {
      defaultValues,
    },
  );
  // TODO: Enable US territories
  // https://linear.app/footprint/issue/FP-6072/playbooks-enable-us-territories
  // const usResidentsChecked = watch('allowUsResidents');
  const internationalChecked = watch('allowInternationalResidents');
  const restrictCountriesChecked =
    watch('restrictCountries') === CountryRestriction.restrict;

  const submit = (formData: ResidencyFormData) => {
    onSubmit(formData);
  };

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
          <Checkbox
            label={t('us-residents')}
            {...register('allowUsResidents')}
          />
          {/* {usResidentsChecked && (
            <UsTerritoriesContainer>
              <Checkbox
                label={t('us-territories')}
                {...register('allowUsTerritories')}
              />
            </UsTerritoriesContainer>
          )} */}
          <Checkbox
            label={t('other-countries')}
            {...register('allowInternationalResidents')}
          />
          {internationalChecked && (
            <InternationalOptions>
              <AllCountriesContainer>
                <Radio
                  label={t('all-countries.label')}
                  value={CountryRestriction.all}
                  {...register('restrictCountries')}
                />
                <AllCountriesHint>
                  <Typography variant="body-3" color="tertiary">
                    {t('all-countries.hint')}
                  </Typography>
                </AllCountriesHint>
              </AllCountriesContainer>
              <Radio
                label={t('restrict')}
                value={CountryRestriction.restrict}
                {...register('restrictCountries')}
              />
              {restrictCountriesChecked && (
                <>
                  <Divider />
                  <Controller
                    control={control}
                    name="countryList"
                    render={({ field }) => (
                      <MultiSelect
                        label={t('countries')}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        options={countriesExceptUs}
                        value={field.value}
                      />
                    )}
                  />
                </>
              )}
            </InternationalOptions>
          )}
        </OptionContainer>
        <ButtonContainer>
          <Button variant="secondary" size="compact" onClick={onBack}>
            {allT('back')}
          </Button>
          <Button variant="primary" size="compact" type="submit">
            {allT('next')}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

const countriesExceptUs = COUNTRIES.filter(country => country.value !== 'US');

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    width: 520px;
    white-space: pre-wrap;
  `};
`;

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

const UsTerritoriesContainer = styled.div`
  ${({ theme }) => css`
    margin-left: calc(${theme.spacing[7]} + ${theme.spacing[2]});
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

const InternationalOptions = styled.div`
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
