import { IcoPlusSmall16 } from '@onefootprint/icons';
import { Box, Form, Grid, LinkButton, NativeSelect, Text, TextInput } from '@onefootprint/ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData, StepProps } from 'src/pages/proxy-configs/proxy-configs.types';

import FormGrid from '../form-grid';

const defaultRule = { token: '', target: '' };

const IngressVaulting = ({ id, onSubmit, values }: StepProps) => {
  const { t } = useTranslation('proxy-configs', {
    keyPrefix: 'create.form.ingress-vaulting',
  });
  const { handleSubmit, control, register, watch } = useForm<FormData>({
    defaultValues: {
      ingressSettings: {
        contentType: 'none',
        // Always default to having at least one rule
        rules: values.ingressSettings.rules.length ? values.ingressSettings.rules : [defaultRule],
      },
    },
  });
  const ingressContentType = watch('ingressSettings.contentType');
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingressSettings.rules',
  });

  const handleAdd = () => {
    append(defaultRule);
  };

  const handleRemove = (index: number) => () => {
    remove(index);
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Text variant="label-2" marginBottom={5}>
        {t('title')}
      </Text>
      <Box marginBottom={8}>
        <Form.Field>
          <Form.Label htmlFor="method">{t('content-type.label')}</Form.Label>
          <NativeSelect id="method" {...register('ingressSettings.contentType')}>
            <option value="none">None</option>
            <option value="json">JSON</option>
          </NativeSelect>
        </Form.Field>
      </Box>
      {ingressContentType !== 'none' && (
        <>
          <Text variant="label-2" marginBottom={5}>
            {t('vaulting-rules.title')}
          </Text>
          <FormGrid>
            {fields.map((field, index) => (
              <Box key={field.id}>
                <Grid.Container gap={5} marginBottom={3}>
                  <Form.Field>
                    <Form.Label htmlFor={`token-${index}`}>{t('vaulting-rules.token.label')}</Form.Label>
                    <TextInput
                      autoFocus
                      id={`token-${index}`}
                      placeholder={t('vaulting-rules.token.placeholder')}
                      {...register(`ingressSettings.rules.${index}.token`, {
                        ...createValidationOptions(index, t('vaulting-rules.token.errors.required')),
                      })}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Form.Label htmlFor={`target-${index}`}>{t('vaulting-rules.target.label')}</Form.Label>
                    <TextInput
                      id={`target-${index}`}
                      placeholder={t('vaulting-rules.target.placeholder')}
                      {...register(`ingressSettings.rules.${index}.target`, {
                        ...createValidationOptions(index, t('vaulting-rules.target.errors.required')),
                      })}
                    />
                  </Form.Field>
                </Grid.Container>
                {fields.length >= 2 && (
                  <LinkButton onClick={handleRemove(index)} destructive>
                    Remove
                  </LinkButton>
                )}
              </Box>
            ))}
          </FormGrid>
          <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={handleAdd}>
            {t('add-more')}
          </LinkButton>
        </>
      )}
    </form>
  );
};

const createValidationOptions = (index: number, message: string) => {
  if (index === 0) {
    return {
      required: {
        value: true,
        message,
      },
    };
  }
  return undefined;
};

export default IngressVaulting;
