import { IcoBolt24, IcoCrosshair24, IcoIdCard24, IcoLayer0124, IcoShield24 } from '@onefootprint/icons';
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
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Header from '../../../header';
import useMeta from './hooks/use-meta';
import type { VerificationChecksFormData } from './verification-checks.types';

export type VerificationChecksStepProps = {
  defaultValues: VerificationChecksFormData;
  meta: {
    allowInternationalResident: boolean;
    canEdit: boolean;
    collectsDocs: boolean;
    collectsPhone: boolean;
    collectsSsn9: boolean;
    isProdNeuroEnabled: boolean;
    isProdSentilinkEnabled: boolean;
  };
  onBack: () => void;
  onSubmit: (formData: VerificationChecksFormData) => void;
};

const VerificationChecksStep = ({ defaultValues, meta, onBack, onSubmit }: VerificationChecksStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.verification-checks' });
  const { neuro, sentilink, kyc, aml } = useMeta(meta);
  const { register, control, handleSubmit, setValue } = useForm<VerificationChecksFormData>({ defaultValues });
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
    <form
      id="playbook-form"
      onSubmit={handleSubmit(onSubmit)}
      onReset={event => {
        event.preventDefault();
        onBack();
      }}
    >
      <Stack flexDirection="column" gap={7}>
        <Header title={t('title')} subtitle={t('subtitle')} />
        <Stack direction="column" gap={5} marginBottom={8}>
          {kyc.showSkip ? (
            <Section>
              <SectionHeader marginBottom={5}>
                <IcoIdCard24 />
                {t('kyc-checks.title')}
              </SectionHeader>
              <Controller
                control={control}
                name="runKyc"
                render={({ field }) => (
                  <Tooltip
                    alignment="start"
                    disabled={!kyc.disabled}
                    position="bottom"
                    text={t('kyc-checks.disabled.must-collect-id-doc')}
                  >
                    <Toggle
                      checked={field.value}
                      disabled={kyc.disabled}
                      hint={t('kyc-checks.toggle.personal.hint')}
                      label={t('kyc-checks.toggle.personal.label')}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      size="compact"
                    />
                  </Tooltip>
                )}
              />
            </Section>
          ) : null}
          <Section>
            <SectionHeader marginBottom={5}>
              <IcoShield24 />
              {t('aml.title')}
            </SectionHeader>
            <Stack flexDirection="column" gap={5} whiteSpace="pre-wrap">
              <Stack gap={5} direction="column">
                <Controller
                  name="aml.enhancedAml"
                  control={control}
                  render={({ field }) => (
                    <Tooltip alignment="start" disabled={!aml.disabled} position="bottom" text={aml.disableText}>
                      <Toggle
                        checked={field.value}
                        disabled={aml.disabled}
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
                      disabled={aml.disabled}
                      {...register('aml.ofac')}
                    />
                    <Checkbox
                      label={t('aml.screening.pep.label')}
                      hint={t('aml.screening.pep.hint')}
                      disabled={aml.disabled}
                      {...register('aml.pep')}
                    />
                    <Checkbox
                      label={t('aml.screening.adverse-media.label')}
                      hint={t('aml.screening.adverse-media.hint')}
                      disabled={aml.disabled}
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
          <Section>
            <SectionHeader marginBottom={5}>
              <IcoBolt24 />
              {t('fraud-checks.title')}
            </SectionHeader>
            <Stack gap={5} direction="column">
              <Controller
                control={control}
                name="isSentilinkEnabled"
                render={({ field }) => (
                  <Tooltip
                    text={sentilink.disabledText}
                    disabled={!sentilink.disabled}
                    position="bottom"
                    alignment="start"
                  >
                    <Toggle
                      checked={field.value}
                      hint={t('fraud-checks.sentilink.hint')}
                      label={t('fraud-checks.sentilink.label')}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      size="compact"
                      disabled={sentilink.disabled}
                    />
                  </Tooltip>
                )}
              />
              <Controller
                control={control}
                name="isNeuroEnabled"
                render={({ field }) => (
                  <Tooltip text={neuro.disabledText} disabled={!neuro.disabled} position="bottom" alignment="start">
                    <Toggle
                      checked={field.value}
                      hint={t('fraud-checks.neuro.hint')}
                      label={t('fraud-checks.neuro.label')}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      size="compact"
                      disabled={neuro.disabled}
                    />
                  </Tooltip>
                )}
              />
            </Stack>
          </Section>
        </Stack>
      </Stack>
    </form>
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

export default VerificationChecksStep;
