import { isEmail, isPhoneNumber } from '@onefootprint/core';
import { uuidv4 } from '@onefootprint/dev-tools';
import { IcoPlusSmall24, IcoUserCircle24 } from '@onefootprint/icons';
import type { HostedBusinessOwner } from '@onefootprint/request-types';
import { Button, Divider, Form, InlineAlert, LinkButton, PhoneInput, Stack, Text, useToast } from '@onefootprint/ui';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ManageBosFormData, NewBusinessOwner } from '../manage-bos.types';
import { hasDuplicatedEmail, hasDuplicatedPhoneNumber, sumTotalOwnershipStake } from '../utils/manage-bos.utils';

export type BosFormProps = {
  existingBos: HostedBusinessOwner[];
  onSubmit: (formData: ManageBosFormData) => void;
  // If there is bootstrap data or existing BOs, we can use them to pre-populate the form.
  defaultFormValues: NewBusinessOwner[];
  isLive: boolean;
};

/** Renders a form for editing the mutable beneficial owners of a business or adding new beneficial owners. */
const BosForm = ({ existingBos, onSubmit, defaultFormValues, isLive }: BosFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.beneficial-owners.form' });
  const toast = useToast();

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ManageBosFormData>({
    defaultValues: {
      bos: defaultFormValues,
      bosToDelete: [],
    },
  });
  const { append, fields, remove } = useFieldArray({ name: 'bos', control });
  const newBos = useWatch({ control, name: 'bos' });
  const bosToDelete = useWatch({ control, name: 'bosToDelete' });

  const isStakeInvalid = sumTotalOwnershipStake(existingBos, { bos: newBos, bosToDelete }) > 100;

  const addBoToDelete = (uuid: string) => {
    const currentBosToDelete = getValues('bosToDelete') || [];
    setValue('bosToDelete', [...currentBosToDelete, uuid]);
  };

  const handleAdd = () => {
    append(getEmptyBo());
  };

  const onSubmitFormData = (formData: ManageBosFormData) => {
    if (isStakeInvalid) {
      toast.show({
        title: t('errors.ownership-stake-total.title'),
        description: t('errors.ownership-stake-total.description'),
        variant: 'error',
      });
      return;
    }

    if (isLive && hasDuplicatedEmail(existingBos, formData)) {
      toast.show({
        title: t('errors.duplicate-email.title'),
        description: t('errors.duplicate-email.description'),
        variant: 'error',
      });
      return;
    }

    if (isLive && hasDuplicatedPhoneNumber(existingBos, formData)) {
      toast.show({
        title: t('errors.duplicate-phone-number.title'),
        description: t('errors.duplicate-phone-number.description'),
        variant: 'error',
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitFormData)}>
      <Stack direction="column" width="100%">
        {fields.map((field, idx) => {
          const backendBo = existingBos.find(bo => bo.uuid === field.uuid);

          const firstNameErrors = errors.bos?.[idx]?.firstName;
          const lastNameErrors = errors.bos?.[idx]?.lastName;
          const emailErrors = errors.bos?.[idx]?.email;
          const phoneNumberErrors = errors.bos?.[idx]?.phoneNumber;
          const ownershipStakeErrors = errors.bos?.[idx]?.ownershipStake;

          const handleRemoveClick = () => {
            remove(idx);
            if (backendBo) {
              // If the BO already exists on the backend, we need to send a delete operation to the backend.
              // Otherwise, it's sufficient to just remove it from the form.
              addBoToDelete(backendBo.uuid);
            }
          };

          const isPrimaryBo = !!backendBo?.isAuthedUser;
          const isMutable = !backendBo || backendBo.isMutable;
          // Omit phone and email for the primary BO since they're already collected
          const showPhoneAndEmail = isMutable && !isPrimaryBo;

          return (
            <Stack
              key={field.id}
              direction="column"
              borderRadius="sm"
              borderColor="tertiary"
              borderStyle="solid"
              borderWidth={1}
              marginTop={5}
              padding={5}
            >
              <Stack marginBottom={5} gap={3} alignItems="center">
                <IcoUserCircle24 />
                <Text variant="label-3">
                  {isPrimaryBo ? t('fields-header.beneficial-owner-you') : t('fields-header.beneficial-owner')}
                </Text>
                {!isPrimaryBo && (
                  <LinkButton $marginLeft="auto" onClick={handleRemoveClick}>
                    {t('fields-header.remove')}
                  </LinkButton>
                )}
              </Stack>
              <Stack direction="column" gap={6}>
                {isPrimaryBo && (
                  <InlineAlert variant="info">
                    <Text variant="body-2" color="info">
                      {t('fields.primary-bo-name-hint-new')}
                    </Text>
                  </InlineAlert>
                )}
                <Form.Field>
                  <Form.Label>{t('fields.first-name.label')}</Form.Label>
                  <Form.Input
                    autoFocus
                    data-dd-privacy="mask"
                    data-dd-action-name="First name input"
                    placeholder={t('fields.first-name.placeholder')}
                    hasError={!!firstNameErrors}
                    disabled={!isMutable}
                    {...register(`bos.${idx}.firstName`, {
                      required: t('fields.first-name.error'),
                    })}
                  />
                  <Form.Errors>{firstNameErrors}</Form.Errors>
                </Form.Field>
                <Form.Field>
                  <Form.Label>{t('fields.last-name.label')}</Form.Label>
                  <Form.Input
                    data-dd-privacy="mask"
                    data-dd-action-name="Last name input"
                    placeholder={t('fields.last-name.placeholder')}
                    hasError={!!lastNameErrors}
                    disabled={!isMutable}
                    {...register(`bos.${idx}.lastName`, {
                      required: t('fields.last-name.error'),
                    })}
                  />
                  <Form.Errors>{lastNameErrors}</Form.Errors>
                </Form.Field>
                {showPhoneAndEmail && (
                  <Form.Field>
                    <Form.Label>{t('fields.email.label')}</Form.Label>
                    <Form.Input
                      data-dd-action-name="Email input"
                      data-dd-privacy="mask"
                      placeholder={t('fields.email.placeholder')}
                      type="email"
                      hasError={!!emailErrors}
                      {...register(`bos.${idx}.email`, {
                        required: t('fields.email.errors.required'),
                        validate: value => (!isEmail(value) ? t('fields.email.errors.required') : undefined),
                      })}
                    />
                    <Form.Errors>{emailErrors}</Form.Errors>
                  </Form.Field>
                )}
                {showPhoneAndEmail && (
                  <Controller
                    control={control}
                    name={`bos.${idx}.phoneNumber`}
                    rules={{
                      required: { value: true, message: t('fields.phone.errors.required') },
                      validate: value => {
                        const isInvalid = !isPhoneNumber(value);
                        return isInvalid ? t('fields.phone.errors.invalid') : undefined;
                      },
                    }}
                    render={({ field: { name, onBlur, onChange, value }, fieldState: { error } }) => (
                      <PhoneInput
                        data-dd-privacy="mask"
                        data-dd-action-name="Phone input"
                        hasError={!!error}
                        hint={error ? phoneNumberErrors?.message : undefined}
                        label={t('fields.phone.label')}
                        name={name}
                        onBlur={onBlur}
                        onChange={onChange}
                        value={value}
                      />
                    )}
                  />
                )}
                <Form.Field>
                  <Form.Label>{t('fields.ownership-stake.label')}</Form.Label>
                  <Form.Input
                    type="number"
                    data-dd-privacy="mask"
                    data-dd-action-name="Ownership stake input"
                    placeholder="100"
                    min="0"
                    max="100"
                    hasError={!!ownershipStakeErrors}
                    {...register(`bos.${idx}.ownershipStake`, {
                      required: t('fields.ownership-stake.errors.required'),
                      min: { value: 0, message: t('fields.ownership-stake.errors.min') },
                      max: { value: 100, message: t('fields.ownership-stake.errors.max') },
                      valueAsNumber: true,
                    })}
                  />
                  <Form.Errors>{ownershipStakeErrors?.message}</Form.Errors>
                </Form.Field>
              </Stack>
            </Stack>
          );
        })}
        {fields.length > 0 ? (
          <Text variant="body-3" marginTop={5}>
            {t('multi-kyc')}
          </Text>
        ) : null}
        <Divider marginTop={6} marginBottom={6} />
        <Stack marginBottom={7}>
          <LinkButton
            data-dd-action-name="add-beneficial-owner"
            iconComponent={IcoPlusSmall24}
            iconPosition="left"
            variant="label-2"
            onClick={handleAdd}
            disabled={isStakeInvalid || isSubmitting}
          >
            {t('add-another')}
          </LinkButton>
        </Stack>
        <Button size="large" type="submit" loading={isSubmitting}>
          {t('continue')}
        </Button>
      </Stack>
    </form>
  );
};

const getEmptyBo = () => {
  return {
    uuid: uuidv4(),
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    ownershipStake: undefined,
  };
};
export default BosForm;
