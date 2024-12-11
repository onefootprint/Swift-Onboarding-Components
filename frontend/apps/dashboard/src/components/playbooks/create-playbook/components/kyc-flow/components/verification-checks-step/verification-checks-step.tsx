import { IcoBolt24, IcoIdCard24 } from '@onefootprint/icons';
import { Stack, Toggle, Tooltip, createFontStyles } from '@onefootprint/ui';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Header from '../../../header';
import UserAmlForm from '../../../user-aml-form';
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
  const form = useForm<VerificationChecksFormData>({ defaultValues });

  return (
    <FormProvider {...form}>
      <form
        id="playbook-form"
        onSubmit={form.handleSubmit(onSubmit)}
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
                  control={form.control}
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
            <UserAmlForm title={t('aml.title')} disabled={aml.disabled} disabledText={aml.disabledText} />
            <Section>
              <SectionHeader marginBottom={5}>
                <IcoBolt24 />
                {t('fraud-checks.title')}
              </SectionHeader>
              <Stack gap={5} direction="column">
                <Controller
                  control={form.control}
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
                  control={form.control}
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
    </FormProvider>
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
