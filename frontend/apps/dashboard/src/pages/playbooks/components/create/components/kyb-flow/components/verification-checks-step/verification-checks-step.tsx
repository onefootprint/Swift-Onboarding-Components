import { IcoBuilding24, IcoIdCard24, IcoShield24 } from '@onefootprint/icons';
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
import type { VerificationChecksFormData } from './verification-checks-step.types';

export type VerificationChecksStepProps = {
  defaultValues: VerificationChecksFormData;
  meta: {
    collectsBO: boolean;
    collectsBusinessAddress: boolean;
  };
  onBack: () => void;
  onSubmit: (formData: VerificationChecksFormData) => void;
};

const VerificationChecksStep = ({ defaultValues, meta, onBack, onSubmit }: VerificationChecksStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.verification-checks' });
  const { aml, kyc, kybKind } = useMeta(meta);
  const { register, control, handleSubmit, setValue } = useForm<VerificationChecksFormData>({ defaultValues });
  const [isEnhancedAmlEnabled, ofac, pep, adverseMedia, runKyb] = useWatch({
    control,
    name: ['aml.enhancedAml', 'aml.ofac', 'aml.pep', 'aml.adverseMedia', 'runKyb'],
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
          <Section>
            <SectionHeader>
              <IcoBuilding24 />
              {t('kyb-checks.title')}
            </SectionHeader>
            <Controller
              control={control}
              name="runKyb"
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  hint={t('kyb-checks.toggle.hint')}
                  label={t('kyb-checks.toggle.label')}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  size="compact"
                />
              )}
            />
            {runKyb ? (
              <>
                <Divider variant="secondary" marginBlock={5} />
                <Tooltip position="bottom" alignment="start" disabled={!kybKind.disabled} text={kybKind.disabledText}>
                  <Stack gap={4} direction="column">
                    <Radio
                      disabled={kybKind.disabled}
                      label={t('kyb-checks.full.label')}
                      value="full"
                      {...register('kybKind')}
                    />
                    <Radio
                      disabled={kybKind.disabled}
                      hint={t('kyb-checks.ein.hint')}
                      label={t('kyb-checks.ein.label')}
                      value="ein"
                      {...register('kybKind')}
                    />
                  </Stack>
                </Tooltip>
              </>
            ) : null}
          </Section>
          <Section>
            <SectionHeader>
              <IcoIdCard24 />
              {t('kyc-checks.title')}
            </SectionHeader>
            <Controller
              control={control}
              name="runKyc"
              render={({ field }) => (
                <Tooltip position="bottom" alignment="start" disabled={!kyc.disabled} text={kyc.disabledText}>
                  <Toggle
                    checked={field.value}
                    disabled={kyc.disabled}
                    hint={t('kyc-checks.toggle.bo.hint')}
                    label={t('kyc-checks.toggle.bo.label')}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    size="compact"
                  />
                </Tooltip>
              )}
            />
          </Section>
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
                    <Tooltip alignment="start" disabled={!aml.disabled} position="bottom" text={aml.disabledText}>
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

export default VerificationChecksStep;
