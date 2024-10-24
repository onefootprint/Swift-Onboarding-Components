import { isEmail, isPhoneNumber } from '@onefootprint/core';
import { uuid4 } from '@onefootprint/dev-tools';
import { IcoPlusSmall24, IcoUserCircle24 } from '@onefootprint/icons';
import type { HostedBusinessOwner } from '@onefootprint/services';
import { Button, Divider, Form, LinkButton, PhoneInput, Stack, Text, useToast } from '@onefootprint/ui';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { NewBusinessOwner } from '../manage-bos.types';
import { hasDuplicatedEmail, hasDuplicatedPhoneNumber, isOwnershipStakeInvalid } from '../utils/manage-bos.utils';

type FormData = { bos: NewBusinessOwner[] };

export type BosFormProps = {
  existingBos: HostedBusinessOwner[];
  onSubmit: (bos: NewBusinessOwner[]) => void;
};

const BosForm = ({ existingBos, onSubmit }: BosFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.beneficial-owners.form' });
  const toast = useToast();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      bos: [getEmptyBo()],
    },
  });
  const { append, fields, remove } = useFieldArray({ name: 'bos', control });
  const newBos = useWatch({ control, name: 'bos' });
  const isStakeInvalid = isOwnershipStakeInvalid(existingBos, newBos);

  const handleAdd = () => {
    append(getEmptyBo());
  };

  const onSubmitFormData = (formData: FormData) => {
    if (isStakeInvalid) {
      toast.show({
        title: t('errors.ownership-stake-total.title'),
        description: t('errors.ownership-stake-total.description'),
        variant: 'error',
      });
      return;
    }

    if (hasDuplicatedEmail(existingBos, formData.bos)) {
      toast.show({
        title: t('errors.duplicate-email.title'),
        description: t('errors.duplicate-email.description'),
        variant: 'error',
      });
      return;
    }

    if (hasDuplicatedPhoneNumber(existingBos, formData.bos)) {
      toast.show({
        title: t('errors.duplicate-phone-number.title'),
        description: t('errors.duplicate-phone-number.description'),
        variant: 'error',
      });
      return;
    }

    onSubmit(formData.bos);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitFormData)}>
      <Stack direction="column" width="100%">
        {fields.map((field, idx) => {
          const firstNameErrors = errors.bos?.[idx]?.firstName;
          const lastNameErrors = errors.bos?.[idx]?.lastName;
          const emailErrors = errors.bos?.[idx]?.email;
          const phoneNumberErrors = errors.bos?.[idx]?.phoneNumber;
          const ownershipStakeErrors = errors.bos?.[idx]?.ownershipStake;

          return (
            <Stack
              key={field.id}
              direction="column"
              borderRadius="sm"
              borderColor="tertiary"
              borderStyle="solid"
              borderWidth={1}
              marginTop={5}
              paddingInline={5}
              paddingBottom={5}
            >
              <Stack paddingTop={5} paddingBottom={5} gap={3} alignItems="center">
                <IcoUserCircle24 />
                <Text variant="label-3">
                  {idx === 0 ? t('fields-header.beneficial-owner-you') : t('fields-header.beneficial-owner-other')}
                </Text>
                <LinkButton $marginLeft="auto" onClick={() => remove(idx)}>
                  {t('fields-header.remove')}
                </LinkButton>
              </Stack>
              <Stack direction="column" gap={6}>
                <Form.Field>
                  <Form.Label>{t('fields.first-name.label')}</Form.Label>
                  <Form.Input
                    autoFocus
                    data-dd-privacy="mask"
                    data-dd-action-name="First name input"
                    placeholder={t('fields.first-name.placeholder')}
                    hasError={!!firstNameErrors}
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
                    {...register(`bos.${idx}.lastName`, {
                      required: t('fields.last-name.error'),
                    })}
                  />
                  <Form.Errors>{lastNameErrors}</Form.Errors>
                </Form.Field>
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
    uuid: uuid4(),
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    ownershipStake: 0,
  };
};
export default BosForm;
