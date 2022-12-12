import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16, IcoWarning16 } from '@onefootprint/icons';
import { LinkButton, SelectOption, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import Header from '../header';
import InviteFields from './components/invite-fields';
import useRoles from './hooks/use-roles';

export type InviteProps = {
  id: string;
  onComplete: () => void;
};

type FormData = {
  invites: { email: string; role: SelectOption }[];
};

const Invite = ({ id, onComplete }: InviteProps) => {
  const { t } = useTranslation('pages.onboarding.invite');
  const { roles, defaultRole } = useRoles();
  const [animate] = useAutoAnimate<HTMLFormElement>();
  const methods = useForm({
    defaultValues: {
      invites: [{ email: '', role: defaultRole }],
    },
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;
  const { fields, append } = useFieldArray({
    control,
    name: 'invites',
    rules: { minLength: 1 },
  });
  const shouldShowError = !!errors.invites && errors.invites[0];

  const handleAddMore = () => {
    append({ email: '', role: defaultRole });
  };

  const handleAfterSubmit = (formData: FormData) => {
    // TODO: FP-2107
    // https://linear.app/footprint/issue/FP-2107/dashboard-onboarding-step-4-save-data
    console.log('submit data step', formData);
    onComplete();
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <FormProvider {...methods}>
        <Form id={id} onSubmit={handleSubmit(handleAfterSubmit)} ref={animate}>
          {fields.map((field, index) => (
            <InviteFields index={index} key={field.id} roles={roles} />
          ))}
        </Form>
      </FormProvider>
      <LinkButton
        iconComponent={IcoPlusSmall16}
        iconPosition="left"
        onClick={handleAddMore}
        size="compact"
        sx={{ marginTop: 5 }}
      >
        {t('add-more')}
      </LinkButton>
      {shouldShowError && (
        <Error>
          <IcoWarning16 color="error" />
          <Typography variant="body-3" color="error">
            {t('form.errors.invalid')}
          </Typography>
        </Error>
      )}
    </Container>
  );
};

const Container = styled.header`
  ${({ theme }) => css`
    padding: ${theme.spacing[8]} ${theme.spacing[7]} ${theme.spacing[7]};
  `}
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const Error = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    margin-top: ${theme.spacing[7]};
  `}
`;

export default Invite;
