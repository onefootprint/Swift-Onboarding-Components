import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { OnboardingConfig } from '@onefootprint/types';
import { Button, useToast } from '@onefootprint/ui';
import React, { useId, useState } from 'react';
import useUpdateOnboardingConfigs from 'src/pages/developers/components/onboarding-configs/hooks/use-update-onboarding-configs';

import { FormData } from '../form-data.types';
import Fieldset from './components/fieldset';

export type EditProps = {
  onboardingConfig: OnboardingConfig;
  children: React.ReactNode;
  title?: string;
  Form?: ({ id, onSubmit, defaultValues }: any) => JSX.Element;
};

const Edit = ({ onboardingConfig, children, Form, title }: EditProps) => {
  const id = useId();
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.actions.edit-name',
  );
  const [showForm, setShowForm] = useState(false);
  const onboardingConfigMutation = useUpdateOnboardingConfigs();
  const toast = useToast();
  const showErrorToast = useRequestErrorToast();
  const isEditable = !!Form;

  const handleSubmit = (formData: FormData) => {
    onboardingConfigMutation.mutate(
      { id: onboardingConfig.id, ...formData },
      {
        onSuccess: () => {
          setShowForm(false);
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
        },
        onError: showErrorToast,
      },
    );
  };
  const defaultValues: FormData = {
    name: onboardingConfig.name,
  };

  return (
    <Container>
      {isEditable && showForm ? (
        <>
          <Form onSubmit={handleSubmit} id={id} defaultValues={defaultValues} />
          <FormActions>
            <Button
              disabled={onboardingConfigMutation.isLoading}
              onClick={() => setShowForm(false)}
              size="small"
              variant="secondary"
            >
              {allT('cancel')}
            </Button>
            <Button
              form={id}
              loading={onboardingConfigMutation.isLoading}
              size="small"
              type="submit"
            >
              {allT('save')}
            </Button>
          </FormActions>
        </>
      ) : (
        <Fieldset
          title={title}
          cta={
            isEditable
              ? {
                  label: allT('edit'),
                  onClick: () => setShowForm(true),
                }
              : undefined
          }
        >
          {children}
        </Fieldset>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    &:not(:last-child) {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[7]};
      padding-bottom: ${theme.spacing[7]};
    }
  `}
`;

const FormActions = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    justify-content: flex-end;
    margin-top: ${theme.spacing[6]};
  `}
`;

export default Edit;
