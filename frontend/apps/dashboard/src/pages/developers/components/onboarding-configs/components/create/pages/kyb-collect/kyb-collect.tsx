import { useTranslation } from '@onefootprint/hooks';
import { CollectedKybDataOption } from '@onefootprint/types';
import { Checkbox, InlineAlert, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import TagList from '../../../onboarding-configs-data/components/onboarding-config-item/components/tag-list';
import FormTitle from '../../components/form-title';
import { useOnboardingConfigMachine } from '../../components/machine-provider';
import getFormIdForState from '../../utils/get-form-id-for-state';

type FormData = {
  [CollectedKybDataOption.website]: boolean;
  [CollectedKybDataOption.phoneNumber]: boolean;
};

const KybCollect = () => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create-dialog.kyb-collect-form',
  );
  const [state, send] = useOnboardingConfigMachine();
  const { register, handleSubmit, watch } = useForm<FormData>();

  const handleBeforeSubmit = (formData: FormData) => {
    send({
      type: 'kybCollectSubmitted',
      payload: {
        ...formData,
      },
    });
  };

  const website = watch(CollectedKybDataOption.website);
  const phoneNumber = watch(CollectedKybDataOption.phoneNumber);
  const collectedDataTags = [
    allT('collected-kyb-data-options.name'),
    allT('collected-kyb-data-options.ein'),
    allT('collected-kyb-data-options.address'),
    allT('collected-kyb-data-options.beneficial_owner'),
  ];
  if (website) {
    collectedDataTags.push(allT('collected-kyb-data-options.website'));
  }
  if (phoneNumber) {
    collectedDataTags.push(allT('collected-kyb-data-options.phone_number'));
  }

  return (
    <>
      <FormTitle title={t('title')} description={t('description')} />
      <Form
        data-testid={getFormIdForState(state.value)}
        id={getFormIdForState(state.value)}
        onSubmit={handleSubmit(handleBeforeSubmit)}
      >
        <Section>
          <Typography variant="label-3">{t('collected-data')}</Typography>
          <TagList testID="collected-data" items={collectedDataTags} />
        </Section>
        <Section>
          <Typography variant="label-3" color="tertiary">
            {t('optional')}
          </Typography>
          <OptionsContainer data-testid="kyb-collect-form-options">
            <Checkbox
              label={allT('collected-kyb-data-options.website')}
              {...register(CollectedKybDataOption.website)}
            />
            <Checkbox
              label={allT('collected-kyb-data-options.phone_number')}
              {...register(CollectedKybDataOption.phoneNumber)}
            />
          </OptionsContainer>
        </Section>
        <InlineAlert variant="info" sx={{ alignItems: 'center' }}>
          <Typography variant="body-3" color="info">
            {t('beneficial-owner-warning')}
          </Typography>
        </InlineAlert>
      </Form>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[2]};
  `}
`;

export default KybCollect;
