import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import {
  Box,
  FormControl,
  FormLabel,
  Grid,
  LinkButton,
  NativeSelect,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import type {
  FormData,
  StepProps,
} from 'src/pages/proxy-configs/proxy-configs.types';

import FormGrid from '../form-grid';

const defaultRule = { token: '', target: '' };

const IngressVaulting = ({ id, onSubmit, values }: StepProps) => {
  const { t } = useTranslation(
    'pages.proxy-configs.create.form.ingress-vaulting',
  );
  const { handleSubmit, control, register, watch } = useForm<FormData>({
    defaultValues: {
      ingressSettings: {
        contentType: 'none',
        // Always default to having at least one rule
        rules: values.ingressSettings.rules.length
          ? values.ingressSettings.rules
          : [defaultRule],
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
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <Box marginBottom={8}>
        <FormControl>
          <FormLabel htmlFor="method">{t('content-type.label')}</FormLabel>
          <NativeSelect
            id="method"
            placeholder={t('content-type.placeholder')}
            {...register('ingressSettings.contentType')}
          >
            <option value="none">None</option>
            <option value="json">JSON</option>
          </NativeSelect>
        </FormControl>
      </Box>
      {ingressContentType !== 'none' && (
        <>
          <Typography variant="label-2" sx={{ marginBottom: 5 }}>
            {t('vaulting-rules.title')}
          </Typography>
          <FormGrid>
            {fields.map((field, index) => (
              <Box key={field.id}>
                <Grid.Container gap={5} marginBottom={3}>
                  <FormControl>
                    <FormLabel htmlFor={`token-${index}`}>
                      {t('vaulting-rules.token.label')}
                    </FormLabel>
                    <TextInput
                      autoFocus
                      id={`token-${index}`}
                      placeholder={t('vaulting-rules.token.placeholder')}
                      {...register(`ingressSettings.rules.${index}.token`, {
                        ...createValidationOptions(
                          index,
                          t('vaulting-rules.token.errors.required'),
                        ),
                      })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor={`target-${index}`}>
                      {t('vaulting-rules.target.label')}
                    </FormLabel>
                    <TextInput
                      id={`target-${index}`}
                      placeholder={t('vaulting-rules.target.placeholder')}
                      {...register(`ingressSettings.rules.${index}.target`, {
                        ...createValidationOptions(
                          index,
                          t('vaulting-rules.target.errors.required'),
                        ),
                      })}
                    />
                  </FormControl>
                </Grid.Container>
                {fields.length >= 2 && (
                  <LinkButton
                    onClick={handleRemove(index)}
                    size="compact"
                    variant="destructive"
                  >
                    Remove
                  </LinkButton>
                )}
              </Box>
            ))}
          </FormGrid>
          <LinkButton
            iconComponent={IcoPlusSmall16}
            iconPosition="left"
            onClick={handleAdd}
            size="compact"
          >
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
