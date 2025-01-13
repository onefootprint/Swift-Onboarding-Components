import type { SelectOption } from '@onefootprint/ui';
import { SelectCustom, TextInput } from '@onefootprint/ui';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type InviteFieldsProps = {
  index: number;
  roles: SelectOption[];
};

const InviteFields = ({ index, roles }: InviteFieldsProps) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.members.invite',
  });
  const { register, control } = useFormContext();
  const shouldShowLabel = index === 0;
  const isRequired = index === 0;

  return (
    <div className="grid grid-cols-[2fr_minmax(68px,1fr)] gap-4">
      <TextInput
        type="email"
        label={shouldShowLabel ? t('form.email.label') : undefined}
        placeholder={t('form.email.placeholder')}
        {...register(
          `invitations.${index}.email`,
          isRequired
            ? {
                required: {
                  value: true,
                  message: t('form.email.errors.required'),
                },
              }
            : undefined,
        )}
      />
      <Controller
        control={control}
        name={`invitations.${index}.role`}
        rules={{ required: isRequired }}
        render={({ field, fieldState }) => (
          <div className="w-full">
            {shouldShowLabel && (
              <div className="flex mb-2">
                <label className="text-label-3 text-primary" htmlFor={`invitations.${index}.role`}>
                  {t('form.role.label')}
                </label>
              </div>
            )}
            <SelectCustom.Root
              value={field.value?.value}
              onValueChange={value => {
                const selectedRole = roles.find(role => role.value === value);
                field.onChange(selectedRole);
              }}
            >
              <SelectCustom.Trigger className="w-full" asChild>
                <div className="w-ful h-fit" id={`invitations.${index}.role`}>
                  <SelectCustom.Input
                    placeholder={t('form.role.placeholder')}
                    hasError={!!fieldState.error}
                    width="100%"
                  >
                    {field.value?.label}
                  </SelectCustom.Input>
                </div>
              </SelectCustom.Trigger>
              <SelectCustom.Content popper>
                <SelectCustom.Group>
                  {roles.map(role => (
                    <SelectCustom.Item key={role.value} value={role.value}>
                      {role.label}
                    </SelectCustom.Item>
                  ))}
                </SelectCustom.Group>
              </SelectCustom.Content>
            </SelectCustom.Root>
          </div>
        )}
      />
    </div>
  );
};

export default InviteFields;
