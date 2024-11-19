import { COUNTRIES } from '@onefootprint/global-constants';
import { Box, Checkbox, Divider, InlineAlert, MultiSelect, Radio, Stack, Text } from '@onefootprint/ui';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Header from '../header';
import type { ResidencyFormData } from './residency-step.types';

export type StepResidencyProps = {
  meta: {
    canEdit: boolean;
  };
  defaultValues: ResidencyFormData;
  onBack: () => void;
  onSubmit: (data: ResidencyFormData) => void;
};

const StepResidency = ({ defaultValues, onBack, onSubmit, meta }: StepResidencyProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.residency' });
  const { handleSubmit, register, control } = useForm<ResidencyFormData>({
    defaultValues,
  });
  const [residencyType, isCountryRestricted] = useWatch({
    control,
    name: ['residencyType', 'isCountryRestricted'],
  });

  return (
    <Stack direction="column" gap={7} width="520px" whiteSpace="pre-wrap">
      <Header title={t('title')} subtitle={t('subtitle')} />
      <form
        id="playbook-form"
        onSubmit={handleSubmit(onSubmit)}
        onReset={event => {
          event.preventDefault();
          onBack();
        }}
      >
        {!meta.canEdit && (
          <InlineAlert variant="warning" marginBottom={5}>
            {t('cannot-edit')}
          </InlineAlert>
        )}
        <Stack direction="column" gap={5}>
          <Radio label={t('us-residents')} value="us" {...register('residencyType')} disabled={!meta.canEdit} />
          {residencyType === 'us' && (
            <UsTerritoriesContainer>
              <Checkbox label={t('us-territories')} {...register('allowUsTerritories')} disabled={!meta.canEdit} />
            </UsTerritoriesContainer>
          )}
          <Radio
            label={t('other-countries')}
            value="international"
            {...register('residencyType')}
            disabled={!meta.canEdit}
          />
          {residencyType === 'international' && (
            <InternationalOptions>
              <Stack direction="column" gap={5}>
                <Controller
                  control={control}
                  name="isCountryRestricted"
                  render={({ field: { onChange, value } }) => (
                    <Stack direction="column" gap={5}>
                      <Box>
                        <Radio
                          label={t('all-countries.label')}
                          checked={!value}
                          onChange={() => onChange(false)}
                          disabled={!meta.canEdit}
                        />
                        <AllCountriesHint>
                          <Text variant="body-3" color="tertiary">
                            {t('all-countries.hint')}
                          </Text>
                        </AllCountriesHint>
                      </Box>
                      <Radio
                        label={t('restrict')}
                        checked={value}
                        onChange={() => onChange(true)}
                        disabled={!meta.canEdit}
                      />
                    </Stack>
                  )}
                />
                {isCountryRestricted && (
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
                          disabled={!meta.canEdit}
                        />
                      )}
                    />
                  </>
                )}
              </Stack>
            </InternationalOptions>
          )}
        </Stack>
      </form>
    </Stack>
  );
};

const countriesExceptUs = COUNTRIES.filter(country => country.value !== 'US');

const UsTerritoriesContainer = styled.div`
  margin-left: calc(${({ theme }) => theme.spacing[7]} + ${({ theme }) => theme.spacing[2]});
`;

const AllCountriesHint = styled.div`
  padding-left: calc(${({ theme }) => theme.spacing[7]} + ${({ theme }) => theme.spacing[2]});
`;

const InternationalOptions = styled(Stack)`
  margin-top: ${({ theme }) => theme.spacing[2]};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
  padding-left: calc(${({ theme }) => theme.spacing[7]} + ${({ theme }) => theme.spacing[2]});
`;

export default StepResidency;
