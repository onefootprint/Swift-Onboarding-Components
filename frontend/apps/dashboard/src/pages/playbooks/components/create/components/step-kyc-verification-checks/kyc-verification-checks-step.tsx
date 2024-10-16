import { IcoBolt24, IcoIdCard24, IcoShield24 } from '@onefootprint/icons';
import { Checkbox, Divider, InlineAlert, Stack, Text, Toggle, Tooltip, createFontStyles } from '@onefootprint/ui';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Header from '../header';
import useMeta from './hooks/use-meta';
import type { KycVerificationChecksFormData } from './kyc-verification-checks-step.types';

export type StepVerificationChecksProps = {
  defaultValues: KycVerificationChecksFormData;
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
  onSubmit: (formData: KycVerificationChecksFormData) => void;
};

const StepVerificationChecks = ({ defaultValues, meta, onBack, onSubmit }: StepVerificationChecksProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.verification-checks' });
  const { neuro, sentilink, kyc, aml } = useMeta(meta);
  const { register, control, handleSubmit, setValue } = useForm<KycVerificationChecksFormData>({ defaultValues });
  const [isEnhancedAmlEnabled, ofac, pep, adverseMedia] = useWatch({
    control,
    name: ['aml.enhancedAml', 'aml.ofac', 'aml.pep', 'aml.adverseMedia'],
  });
  const noAmlOptionSelected = !ofac && !pep && !adverseMedia;
  const showAmlError = isEnhancedAmlEnabled && noAmlOptionSelected;

  const handleAmlToggle = (checked: boolean) => {
    if (!checked) {
      setValue('aml.enhancedAml', false);
      setValue('aml.ofac', false);
      setValue('aml.pep', false);
      setValue('aml.adverseMedia', false);
      setValue('aml.hasOptionSelected', undefined);
    }
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
              <SectionHeader>
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
            <SectionHeader>
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
                    <Checkbox
                      label={t('aml.ofac.label')}
                      hint={t('aml.ofac.hint')}
                      disabled={aml.disabled}
                      {...register('aml.ofac')}
                    />
                    <Checkbox
                      label={t('aml.pep.label')}
                      hint={t('aml.pep.hint')}
                      disabled={aml.disabled}
                      {...register('aml.pep')}
                    />
                    <Checkbox
                      label={t('aml.adverse-media.label')}
                      hint={t('aml.adverse-media.hint')}
                      disabled={aml.disabled}
                      {...register('aml.adverseMedia')}
                    />
                    <Divider variant="secondary" />
                    <Text variant="body-3" color="tertiary">
                      <Text variant="body-3" color="primary" tag="span">
                        {t('aml.footer.label')}{' '}
                      </Text>
                      {t('aml.footer.content')}
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
            <>
              <Divider variant="secondary" marginBlock={5} />
              <SectionHeader>
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
            </>
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

const SectionHeader = styled.header`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[5]};
  `};
`;

export default StepVerificationChecks;
