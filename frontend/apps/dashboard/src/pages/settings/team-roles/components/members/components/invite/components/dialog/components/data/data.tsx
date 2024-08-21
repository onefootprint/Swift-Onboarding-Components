import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { SelectOption } from '@onefootprint/ui';
import { Box, Checkbox } from '@onefootprint/ui';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import type { Invitation } from '../../dialog.types';
import AddButton from './components/add-button';
import ErrorComponent from './components/error';
import InviteFields from './components/invite-fields';

export type DataProps = {
  defaultRole: SelectOption;
  onSubmit: (invitations: Invitation[]) => void;
  roles: SelectOption[];
};

type FormData = {
  invitations: { email: string; role: SelectOption }[];
  omitEmailInvite: boolean;
};

const Data = ({ roles, defaultRole, onSubmit }: DataProps) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.members.onboarding.invite',
  });
  const [animate] = useAutoAnimate<HTMLFormElement>();
  const {
    data: { user },
  } = useSession();
  const methods = useForm({
    defaultValues: {
      invitations: [{ email: '', role: defaultRole }],
      omitEmailInvite: !!user?.isFirmEmployee,
    },
  });
  const { handleSubmit, control, formState, register } = methods;
  const { fields, append } = useFieldArray({
    control,
    name: 'invitations',
    rules: { minLength: 1 },
  });
  const { errors } = formState;
  const shouldShowError = !!errors.invitations && errors.invitations[0];

  const handleAddMore = () => {
    append({ email: '', role: defaultRole });
  };

  const handleAfterSubmit = (formData: FormData) => {
    const invitations = formData.invitations
      .filter(invite => invite.email && invite.role.value)
      .map(invite => ({
        email: invite.email,
        roleId: invite.role.value,
        redirectUrl: `${window.location.origin}/auth`,
        omitEmailInvite: formData.omitEmailInvite,
      }));
    onSubmit(invitations);
  };

  return (
    <Box testID="members-roles-data">
      <FormProvider {...methods}>
        <Form id="members-invite-form" onSubmit={handleSubmit(handleAfterSubmit)} ref={animate}>
          {fields.map((field, index) => (
            <InviteFields index={index} key={field.id} roles={roles} />
          ))}
        </Form>
        <AddButton onClick={handleAddMore} />
        {user?.isFirmEmployee && (
          <Box marginTop={5}>
            <Checkbox label="Omit sending email invite" {...register('omitEmailInvite', {})} />
          </Box>
        )}
      </FormProvider>
      {shouldShowError && <ErrorComponent>{t('form.errors.invalid')}</ErrorComponent>}
    </Box>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default Data;
