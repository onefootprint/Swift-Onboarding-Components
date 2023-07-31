import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Organization } from '@onefootprint/types';
import { Box, Button, Portal, SelectOption } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import DomainAccess from 'src/components/domain-access';
import useUpdateOrg from 'src/hooks/use-update-org';

import AddButton from './components/add-button';
import Error from './components/error';
import InviteFields from './components/invite-fields';
import useInviteMembers from './hooks/use-invite-members';

export type ContentProps = {
  defaultRole: SelectOption;
  org: Organization;
  id: string;
  onComplete: () => void;
  roles: SelectOption[];
};

type FormData = {
  invitations: { email: string; role: SelectOption }[];
};

const Content = ({ id, onComplete, org, defaultRole, roles }: ContentProps) => {
  const { t, allT } = useTranslation('pages.onboarding.invite');
  const inviteMembersMutations = useInviteMembers();
  const updateOrgMutation = useUpdateOrg();
  const [animate] = useAutoAnimate<HTMLFormElement>();
  const methods = useForm({
    defaultValues: {
      invitations: [{ email: '', role: defaultRole }],
    },
  });
  const { handleSubmit, control, formState } = methods;
  const { fields, append } = useFieldArray({
    control,
    name: 'invitations',
  });
  const { errors } = formState;
  const shouldShowError = !!errors.invitations && errors.invitations[0];
  const handleAddMore = () => {
    append({ email: '', role: defaultRole });
  };

  const handleAfterSubmit = (formData: FormData) => {
    if (formData.invitations.length === 0) {
      onComplete();
    } else {
      const invitations = formData.invitations
        .filter(invite => invite.email && invite.role.value)
        .map(invite => ({
          email: invite.email,
          roleId: invite.role.value,
          redirectUrl: `${window.location.origin}/auth`,
        }));

      inviteMembersMutations.mutate(invitations, {
        onSuccess: onComplete,
      });
    }
  };

  return (
    <Box testID="onboarding-invite-content">
      <FormProvider {...methods}>
        <Form id={id} onSubmit={handleSubmit(handleAfterSubmit)} ref={animate}>
          {fields.map((field, index) => (
            <InviteFields index={index} key={field.id} roles={roles} />
          ))}
        </Form>
      </FormProvider>
      <AddButton onClick={handleAddMore} />
      {org.domain && <DomainAccess org={org} />}
      {shouldShowError && <Error>{t('form.errors.invalid')}</Error>}
      <Portal selector="#onboarding-cta-portal">
        <Button
          form={id}
          loading={
            inviteMembersMutations.isLoading || updateOrgMutation.isLoading
          }
          size="compact"
          type="submit"
        >
          {allT('complete')}
        </Button>
      </Portal>
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

export default Content;
