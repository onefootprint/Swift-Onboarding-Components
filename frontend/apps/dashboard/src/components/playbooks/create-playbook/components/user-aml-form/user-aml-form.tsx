import { IcoCrosshair24, IcoLayer0124, IcoShield24 } from '@onefootprint/icons';
import {
  Checkbox,
  Divider,
  InlineAlert,
  Radio,
  Stack,
  Text,
  Toggle,
  Tooltip,
  createFontStyles,
} from '@onefootprint/ui';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { UserAmlFormData } from './user-aml-form.types';

type UserAmlFormProps = {
  title: string;
  disabled: boolean;
  disabledText: string;
};

const UserAmlForm = ({ title, disabled, disabledText }: UserAmlFormProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.verification-checks' });
  const { control, register, setValue } = useFormContext<UserAmlFormData>();
  const [isEnhancedAmlEnabled, ofac, pep, adverseMedia, matchingMethod] = useWatch({
    control,
    name: ['aml.enhancedAml', 'aml.ofac', 'aml.pep', 'aml.adverseMedia', 'aml.matchingMethod'],
  });
  const noAmlOptionSelected = !ofac && !pep && !adverseMedia;
  const showAmlError = isEnhancedAmlEnabled && noAmlOptionSelected;

  const handleAmlToggle = (checked: boolean) => {
    setValue('aml.enhancedAml', checked);
    setValue('aml.ofac', checked);
    setValue('aml.pep', checked);
    setValue('aml.adverseMedia', checked);
    setValue('aml.hasOptionSelected', undefined);
    setValue('aml.adverseMediaList', {
      financial_crime: checked,
      violent_crime: checked,
      sexual_crime: checked,
      cyber_crime: checked,
      terrorism: checked,
      fraud: checked,
      narcotics: checked,
      general_serious: checked,
      general_minor: checked,
    });
    setValue('aml.matchingMethod', {
      kind: 'fuzzy',
      fuzzyLevel: 'fuzzy_low',
      exactLevel: 'exact_name',
    });
  };

  return (
    <Section>
      <SectionHeader marginBottom={5}>
        <IcoShield24 />
        {title}
      </SectionHeader>
      <Stack flexDirection="column" gap={5} whiteSpace="pre-wrap">
        <Stack gap={5} direction="column">
          <Controller
            name="aml.enhancedAml"
            control={control}
            render={({ field }) => (
              <Tooltip alignment="start" disabled={!disabled} position="bottom" text={disabledText}>
                <Toggle
                  checked={field.value}
                  disabled={disabled}
                  hint={t('aml.aml.hint')}
                  label={t('aml.aml.label')}
                  size="compact"
                  onChange={event => {
                    const checked = event.target.checked;
                    field.onChange(checked);
                    handleAmlToggle(checked);
                  }}
                />
              </Tooltip>
            )}
          />
          {isEnhancedAmlEnabled && (
            <>
              <Divider variant="secondary" />
              <SectionHeader>
                <IcoCrosshair24 />
                {t('aml.screening.title')}
              </SectionHeader>
              <Checkbox
                label={t('aml.screening.ofac.label')}
                hint={t('aml.screening.ofac.hint')}
                disabled={disabled}
                {...register('aml.ofac')}
              />
              <Checkbox
                label={t('aml.screening.pep.label')}
                hint={t('aml.screening.pep.hint')}
                disabled={disabled}
                {...register('aml.pep')}
              />
              <Checkbox
                label={t('aml.screening.adverse-media.label')}
                hint={t('aml.screening.adverse-media.hint')}
                disabled={disabled}
                {...register('aml.adverseMedia', {
                  onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                    const checked = event.target.checked;
                    setValue('aml.adverseMediaList', {
                      financial_crime: checked,
                      violent_crime: checked,
                      sexual_crime: checked,
                      cyber_crime: checked,
                      terrorism: checked,
                      fraud: checked,
                      narcotics: checked,
                      general_serious: checked,
                      general_minor: checked,
                    });
                  },
                })}
              />
              {adverseMedia ? (
                <Stack direction="column" gap={3} marginLeft={7}>
                  <Checkbox
                    {...register('aml.adverseMediaList.financial_crime')}
                    label={t('aml.screening.adverse-media.financial-crime')}
                  />
                  <Checkbox
                    {...register('aml.adverseMediaList.violent_crime')}
                    label={t('aml.screening.adverse-media.violent-crime')}
                  />
                  <Checkbox
                    {...register('aml.adverseMediaList.sexual_crime')}
                    label={t('aml.screening.adverse-media.sexual-crime')}
                  />
                  <Checkbox
                    {...register('aml.adverseMediaList.cyber_crime')}
                    label={t('aml.screening.adverse-media.cyber-crime')}
                  />
                  <Checkbox
                    {...register('aml.adverseMediaList.terrorism')}
                    label={t('aml.screening.adverse-media.terrorism')}
                  />
                  <Checkbox
                    {...register('aml.adverseMediaList.fraud')}
                    label={t('aml.screening.adverse-media.fraud')}
                  />
                  <Checkbox
                    {...register('aml.adverseMediaList.narcotics')}
                    label={t('aml.screening.adverse-media.narcotics')}
                  />
                  <Checkbox
                    {...register('aml.adverseMediaList.general_serious')}
                    label={t('aml.screening.adverse-media.general-serious')}
                  />
                  <Checkbox
                    {...register('aml.adverseMediaList.general_minor')}
                    label={t('aml.screening.adverse-media.general-minor')}
                  />
                </Stack>
              ) : null}
              <Divider variant="secondary" />
              <Stack direction="column">
                <SectionHeader marginBottom={5}>
                  <IcoLayer0124 />
                  {t('aml.matching-method.title')}
                </SectionHeader>
                <Stack direction="column" gap={4}>
                  <Radio
                    {...register('aml.matchingMethod.kind')}
                    value="fuzzy"
                    label={t('aml.matching-method.fuzzy.label')}
                    hint={t('aml.matching-method.fuzzy.hint')}
                  />
                  {matchingMethod.kind === 'fuzzy' ? (
                    <Stack direction="column" gap={4} marginLeft={7}>
                      <Radio
                        {...register('aml.matchingMethod.fuzzyLevel')}
                        value="fuzzy_low"
                        label={t('aml.matching-method.fuzzy-levels.low.label')}
                        hint={t('aml.matching-method.fuzzy-levels.low.hint')}
                      />
                      <Radio
                        {...register('aml.matchingMethod.fuzzyLevel')}
                        value="fuzzy_medium"
                        label={t('aml.matching-method.fuzzy-levels.medium.label')}
                        hint={t('aml.matching-method.fuzzy-levels.medium.hint')}
                      />
                      <Radio
                        {...register('aml.matchingMethod.fuzzyLevel')}
                        value="fuzzy_high"
                        label={t('aml.matching-method.fuzzy-levels.high.label')}
                        hint={t('aml.matching-method.fuzzy-levels.high.hint')}
                      />
                    </Stack>
                  ) : null}
                  <Radio
                    {...register('aml.matchingMethod.kind')}
                    value="exact"
                    label={t('aml.matching-method.exact.label')}
                    hint={t('aml.matching-method.exact.hint')}
                  />
                  {matchingMethod.kind === 'exact' ? (
                    <Stack direction="column" gap={4} marginLeft={7}>
                      <Radio
                        {...register('aml.matchingMethod.exactLevel')}
                        value="exact_name"
                        label={t('aml.matching-method.exact-levels.name.label')}
                      />
                      <Radio
                        {...register('aml.matchingMethod.exactLevel')}
                        value="exact_name_and_dob_year"
                        label={t('aml.matching-method.exact-levels.name-and-dob.label')}
                      />
                    </Stack>
                  ) : null}
                </Stack>
              </Stack>
              <Divider variant="secondary" />
              <Text variant="body-3" color="tertiary">
                <Text variant="body-3" color="primary" tag="span">
                  {t('aml.screening.footer.label')}{' '}
                </Text>
                {t('aml.screening.footer.content')}
              </Text>
            </>
          )}
        </Stack>
        {showAmlError && (
          <>
            <input type="hidden" {...register('aml.hasOptionSelected', { required: true })} />
            <InlineAlert variant="warning">{t('aml.missing-selection')}</InlineAlert>
          </>
        )}
      </Stack>
    </Section>
  );
};

const Section = styled.section`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[5]};
  `};
`;

const SectionHeader = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
    align-items: center;
    gap: ${theme.spacing[2]};
  `};
`;

export default UserAmlForm;
