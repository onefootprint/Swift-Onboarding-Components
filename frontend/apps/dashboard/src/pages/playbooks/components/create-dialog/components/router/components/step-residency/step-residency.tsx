import { COUNTRIES } from '@onefootprint/global-constants';
import { Button, Checkbox, Divider, MultiSelect, Radio, Text } from '@onefootprint/ui';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { CountryRestriction, type ResidencyFormData } from '@/playbooks/utils/machine/types';
import Header from '../header';

export type StepResidencyProps = {
  defaultValues: ResidencyFormData;
  onBack: () => void;
  onSubmit: (formData: ResidencyFormData) => void;
};

const StepResidency = ({ defaultValues, onBack, onSubmit }: StepResidencyProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'dialog.residency',
  });
  const { handleSubmit, register, watch, control, setValue } = useForm<ResidencyFormData>({
    defaultValues,
  });
  const usResidentsChecked = watch('allowUsResidents');
  const internationalChecked = watch('allowInternationalResidents');
  const restrictCountriesChecked = watch('restrictCountries') === CountryRestriction.restrict;

  const handleResidencyChange = () => {
    setValue('allowUsResidents', !usResidentsChecked);
    setValue('allowInternationalResidents', !internationalChecked);
  };

  const submit = (formData: ResidencyFormData) => {
    onSubmit(formData);
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Form onSubmit={handleSubmit(submit)}>
        <OptionContainer>
          <Radio label={t('us-residents')} checked={usResidentsChecked} onChange={handleResidencyChange} />
          {usResidentsChecked && (
            <UsTerritoriesContainer>
              <Checkbox label={t('us-territories')} {...register('allowUsTerritories')} />
            </UsTerritoriesContainer>
          )}
          <Radio
            label={t('other-countries')}
            checked={internationalChecked}
            onChange={() => {
              handleResidencyChange();
              setValue('allowUsTerritories', false);
            }}
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
                  <Text variant="body-3" color="tertiary">
                    {t('all-countries.hint')}
                  </Text>
                </AllCountriesHint>
              </AllCountriesContainer>
              <Radio label={t('restrict')} value={CountryRestriction.restrict} {...register('restrictCountries')} />
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
          <Button variant="secondary" onClick={onBack}>
            {allT('back')}
          </Button>
          <Button variant="primary" type="submit">
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

export default StepResidency;
