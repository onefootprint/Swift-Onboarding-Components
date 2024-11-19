import { IcoBuilding24, IcoIdCard24, IcoShield24 } from '@onefootprint/icons';
import { Divider, Radio, Stack, Toggle, Tooltip, createFontStyles } from '@onefootprint/ui';
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
  const { register, control, handleSubmit } = useForm<VerificationChecksFormData>({ defaultValues });
  const [runKyb] = useWatch({
    control,
    name: ['runKyb'],
  });

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
                    <Tooltip alignment="start" disabled={!aml.disabled} position="bottom" text={aml.disabledText}>
                      <Toggle
                        checked={field.value}
                        disabled={aml.disabled}
                        hint={t('aml.screening.ofac.hint')}
                        label={t('aml.screening.ofac.label')}
                        size="compact"
                        onChange={event => {
                          const checked = event.target.checked;
                          field.onChange(checked);
                        }}
                      />
                    </Tooltip>
                  )}
                />
              </Stack>
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
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[5]};
  `};
`;

export default VerificationChecksStep;
