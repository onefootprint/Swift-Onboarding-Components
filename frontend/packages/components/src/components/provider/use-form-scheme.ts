import {
  isDobInTheFuture,
  isDobTooOld,
  isDobTooYoung,
  isName,
  isValidDate,
} from '@onefootprint/core';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

const useCreateFormSchema = () => {
  const { t } = useTranslation();

  const schema = z.object({
    firstName: z
      .string()
      .min(1, { message: t('first-name.errors.required') })
      .regex(/\S/, { message: t('first-name.errors.required') })
      .refine(isName, {
        message: t('first-name.errors.invalid'),
      }),
    middleName: z.string().refine(isName, {
      message: t('first-name.errors.invalid'),
    }),
    lastName: z
      .string()
      .min(1, { message: t('last-name.errors.required') })
      .regex(/\S/, { message: t('first-name.errors.required') })
      .refine(isName, {
        message: t('first-name.errors.invalid'),
      }),
    dob: z
      .string()
      .min(1, { message: t('dob.errors.required') })
      .refine(isValidDate, {
        message: t('dob.errors.invalid'),
      })
      .refine(isDobTooOld, {
        message: t('dob.errors.too-old'),
      })
      .refine(isDobInTheFuture, {
        message: t('dob.errors.future-date'),
      })
      .refine(isDobTooYoung, {
        message: t('dob.errors.too-young'),
      }),
  });

  return schema;
};

export default useCreateFormSchema;
