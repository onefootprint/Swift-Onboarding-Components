import { IcoAlpaca24, IcoApex24, IcoBuilding24, IcoCar24, IcoCreditcard24, IcoLayer0124 } from '@onefootprint/icons';
import { RadioSelect, Stack, Text } from '@onefootprint/ui';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { type KycTemplatesFormData, OnboardingTemplate } from './kyc-templates-step.types';

import Header from '../header';

export type KycTemplatesStepProps = {
  defaultValues: KycTemplatesFormData;
  onBack: () => void;
  onSubmit: (data: KycTemplatesFormData) => void;
};

const KycTemplatesStep = ({ defaultValues, onSubmit, onBack }: KycTemplatesStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.kyc-templates' });
  const { handleSubmit, control } = useForm<KycTemplatesFormData>({
    defaultValues,
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
        <Stack direction="column" gap={7}>
          <Controller
            control={control}
            name="template"
            defaultValue={OnboardingTemplate.Custom}
            render={({ field }) => (
              <>
                <RadioSelect
                  options={[
                    {
                      title: t('custom.title'),
                      description: t('custom.description'),
                      value: OnboardingTemplate.Custom,
                      IconComponent: IcoLayer0124,
                    },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
                <Section>
                  <SectionHeader>
                    <Text variant="label-3">{t('brokerage-partner.title')}</Text>
                  </SectionHeader>
                  <RadioSelect
                    options={[
                      {
                        title: t('brokerage-partner.alpaca.title'),
                        description: t('brokerage-partner.alpaca.description'),
                        value: OnboardingTemplate.Alpaca,
                        IconComponent: IcoAlpaca24,
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <RadioSelect
                    options={[
                      {
                        title: t('brokerage-partner.apex.title'),
                        description: t('brokerage-partner.apex.description'),
                        value: OnboardingTemplate.Apex,
                        IconComponent: IcoApex24,
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </Section>
                <Section>
                  <SectionHeader>
                    <Text variant="label-3">{t('industries.title')}</Text>
                  </SectionHeader>
                  <RadioSelect
                    options={[
                      {
                        title: t('industries.car-rental.title'),
                        description: t('industries.car-rental.description'),
                        value: OnboardingTemplate.CarRental,
                        IconComponent: IcoCar24,
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <RadioSelect
                    options={[
                      {
                        title: t('industries.credit-card.title'),
                        description: t('industries.credit-card.description'),
                        value: OnboardingTemplate.CreditCard,
                        IconComponent: IcoCreditcard24,
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <RadioSelect
                    options={[
                      {
                        title: t('industries.tenant-screening.title'),
                        description: t('industries.tenant-screening.description'),
                        value: OnboardingTemplate.TenantScreening,
                        IconComponent: IcoBuilding24,
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </Section>
              </>
            )}
          />
        </Stack>
      </form>
    </Stack>
  );
};

const Section = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

const SectionHeader = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} 0;
  `}
`;

export default KycTemplatesStep;
