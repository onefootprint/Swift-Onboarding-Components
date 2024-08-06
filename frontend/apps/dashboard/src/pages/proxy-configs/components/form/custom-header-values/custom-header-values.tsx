import { IcoPlusSmall16 } from '@onefootprint/icons';
import { Box, Checkbox, Grid, LinkButton, Stack, Text, TextInput } from '@onefootprint/ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData, StepProps } from 'src/pages/proxy-configs/proxy-configs.types';

import FormGrid from '../form-grid';

const defaultHeader = { name: '', value: '', secret: false };

const CustomHeaderValues = ({ id, onSubmit, values }: StepProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.proxy-configs.create.form.custom-header',
  });
  const { handleSubmit, control, register } = useForm<FormData>({
    defaultValues: {
      headers: values.headers,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'headers',
  });

  const handleAdd = () => {
    append(defaultHeader);
  };

  const handleRemove = (index: number) => () => {
    remove(index);
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Text variant="label-2" marginBottom={5}>
        {t('title')}
      </Text>
      <FormGrid>
        {fields.map((field, index) => (
          <Box key={field.id}>
            <Box marginBottom={5}>
              <Grid.Container columns={['1fr', '1fr']}>
                <TextInput
                  autoFocus
                  label={t('name.label')}
                  placeholder={t('name.label')}
                  {...register(`headers.${index}.name`)}
                />

                <TextInput
                  label={t('value.label')}
                  placeholder={t('value.label')}
                  {...register(`headers.${index}.value`)}
                />
              </Grid.Container>
            </Box>
            <Stack align="center" justify="space-between">
              <Checkbox label={t('secret.label')} {...register(`headers.${index}.secret`)} />
              {fields.length >= 2 && (
                <LinkButton onClick={handleRemove(index)} destructive>
                  {t('remove')}
                </LinkButton>
              )}
            </Stack>
          </Box>
        ))}
      </FormGrid>
      <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={handleAdd}>
        {t('add-more')}
      </LinkButton>
    </form>
  );
};

export default CustomHeaderValues;
