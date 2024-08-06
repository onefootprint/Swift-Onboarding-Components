import type { Organization } from '@onefootprint/types';
import type { SelectOption } from '@onefootprint/ui';
import { Box, Button } from '@onefootprint/ui';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DomainAccess from 'src/components/domain-access';
import useUpdateOrg from 'src/hooks/use-update-org';
import styled, { css } from 'styled-components';

import AddButton from './components/add-button';
import ErrorComponent from './components/error';
import InviteFields from './components/invite-fields';
import useInviteMembers from './hooks/use-invite-members';

export type ContentProps = {
  defaultRole: SelectOption;
  onBack: () => void;
  onComplete: () => void;
  org: Organization;
  roles: SelectOption[];
};

type FormData = {
  invitations: { email: string; role: SelectOption }[];
};

const Content = ({ defaultRole, onBack, onComplete, org, roles }: ContentProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.onboarding.invite',
  });
  const inviteMembersMutations = useInviteMembers();
  const updateOrgMutation = useUpdateOrg();
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
          omitEmailInvite: false,
        }));

      inviteMembersMutations.mutate(invitations, {
        onSuccess: onComplete,
      });
    }
  };

  return (
    <Box testID="onboarding-invite-content">
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(handleAfterSubmit)}>
          {fields.map((field, index) => (
            <InviteFields index={index} key={field.id} roles={roles} />
          ))}
          <AddButton onClick={handleAddMore} />
          {!!org.domains.length && <DomainAccess org={org} />}
          {shouldShowError && <ErrorComponent>{t('form.errors.invalid')}</ErrorComponent>}
          <ButtonContainer>
            <Button
              disabled={inviteMembersMutations.isLoading || updateOrgMutation.isLoading}
              onClick={onBack}
              variant="secondary"
            >
              {allT('back')}
            </Button>
            <Button loading={inviteMembersMutations.isLoading || updateOrgMutation.isLoading} type="submit">
              {t('cta')}
            </Button>
          </ButtonContainer>
        </Form>
      </FormProvider>
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

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    margin-top: ${theme.spacing[5]};
  `}
`;

export default Content;
