import { Box, Button, Grid, TextInput } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useUserSession from 'src/hooks/use-user-session';
import styled, { css } from 'styled-components';

import Header from '../header';

export type UserDataProps = {
  onBack: () => void;
  onComplete: () => void;
};

type FormData = {
  firstName: string;
  lastName: string;
};

const UserData = ({ onBack, onComplete }: UserDataProps) => {
  const { data, dangerouslyCastedData, mutation } = useUserSession();
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('onboarding', {
    keyPrefix: 'user-data',
  });
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
    },
  });

  const handleSubmit = (formData: FormData) => {
    mutation.mutate(formData, { onSuccess: onComplete });
  };

  return (
    <Box>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Form onSubmit={handleFormSubmit(handleSubmit)}>
        <TextInput
          disabled
          label={t('form.email.label')}
          placeholder={t('form.email.placeholder')}
          type="email"
          value={dangerouslyCastedData.email}
        />
        <Grid.Container columns={['1fr', '1fr']} gap={5}>
          <TextInput
            autoFocus
            hasError={!!errors.firstName}
            hint={errors.firstName ? t('form.first-name.errors.required') : undefined}
            label={t('form.first-name.label')}
            placeholder={t('form.first-name.placeholder')}
            {...register('firstName', {
              required: {
                value: true,
                message: t('form.first-name.errors.required'),
              },
            })}
          />
          <TextInput
            hasError={!!errors.lastName}
            hint={errors.lastName ? t('form.last-name.errors.required') : undefined}
            label={t('form.last-name.label')}
            placeholder={t('form.last-name.placeholder')}
            {...register('lastName', {
              required: {
                value: true,
                message: t('form.last-name.errors.required'),
              },
            })}
          />
        </Grid.Container>
        <ButtonContainer>
          <Button disabled={mutation.isLoading} onClick={onBack} variant="secondary">
            {allT('back')}
          </Button>
          <Button loading={mutation.isLoading} type="submit">
            {allT('next')}
          </Button>
        </ButtonContainer>
      </Form>
    </Box>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    margin-top: ${theme.spacing[3]};
  `}
`;

export default UserData;
