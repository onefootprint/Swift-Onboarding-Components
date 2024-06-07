import { IcoPlusSmall16 } from '@onefootprint/icons';
import type { SelectOption } from '@onefootprint/ui';
import { Dialog, Grid, LinkButton, Select, Stack, Text, TextInput } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import React from 'react';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type T = TFunction<'common'>;
type FormData = {
  invitations: { email: string; role: SelectOption }[];
  omitEmailInvite: boolean;
};

type Invitation = {
  email: string;
  omitEmailInvite: boolean;
  redirectUrl: string;
  roleId: string;
};

type OverlayInviteProps = {
  defaultRole: SelectOption;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invitations: Invitation[]) => void;
  roles: SelectOption[];
};

const getEmailRequired = (t: T) => ({
  required: { value: true, message: t('email-required') },
});

const OverlayInvite = ({ defaultRole, isOpen, onClose, onSubmit, roles }: OverlayInviteProps) => {
  const { t } = useTranslation('common');

  const formMethods = useForm({
    defaultValues: {
      invitations: [{ email: '', role: defaultRole }],
      omitEmailInvite: false,
    },
  });
  const { handleSubmit, control, formState, register } = formMethods;
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
    onSubmit(
      formData.invitations
        .filter(i => i.email && i.role.value)
        .map(i => ({
          email: i.email,
          omitEmailInvite: formData.omitEmailInvite,
          redirectUrl: `${window.location.origin}/auth`,
          roleId: i.role.value,
        })),
    );
  };

  return (
    <Dialog
      onClose={onClose}
      open={isOpen}
      title={t('invite-teammates')}
      primaryButton={{
        disabled: false,
        form: 'members-invite-form',
        label: t('invite'),
        loading: false,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: false,
        label: t('cancel'),
        onClick: onClose,
      }}
    >
      <Stack testID="members-roles-data" flexDirection="column" gap={2}>
        <FormProvider {...formMethods}>
          <VerticalFlexForm id="members-invite-form" onSubmit={handleSubmit(handleAfterSubmit)}>
            {fields.map((field, index) => {
              const isFirstIndex = index === 0;
              return (
                <Grid.Container columns={['2fr', '1fr']} gap={5} key={field.id}>
                  <TextInput
                    type="email"
                    label={isFirstIndex ? t('auth.email-address') : undefined}
                    placeholder={t('email-placeholder')}
                    {...register(`invitations.${index}.email`, isFirstIndex ? getEmailRequired(t) : undefined)}
                  />
                  <Controller
                    control={control}
                    name={`invitations.${index}.role`}
                    rules={{ required: isFirstIndex }}
                    render={select => (
                      <Select
                        hasError={!!select.fieldState.error}
                        hint={select.fieldState.error ? t('role-required') : undefined}
                        label={isFirstIndex ? t('role') : undefined}
                        onBlur={select.field.onBlur}
                        onChange={select.field.onChange}
                        options={roles}
                        placeholder={t('select-placeholder')}
                        emptyStateText={t('no-results-found')}
                        value={select.field.value}
                      />
                    )}
                  />
                </Grid.Container>
              );
            })}
          </VerticalFlexForm>
          <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={handleAddMore} $marginTop={5}>
            {t('add-more')}
          </LinkButton>
        </FormProvider>
        {shouldShowError ? (
          <Text variant="body-3" color="error">
            {t('missing-fields-above')}
          </Text>
        ) : null}
      </Stack>
    </Dialog>
  );
};

const VerticalFlexForm = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default OverlayInvite;
