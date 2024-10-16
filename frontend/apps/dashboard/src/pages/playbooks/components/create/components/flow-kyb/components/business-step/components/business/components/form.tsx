import { Button, Checkbox, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { BusinessFormData } from '../../../business-step.types';
import useMeta from '../../../hooks/use-meta';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.business.data.form' });
  const { setValue, register } = useFormContext<BusinessFormData>();
  const business = useMeta();
  const [initialValues] = useState(() => business.data);

  const handleCancel = () => {
    setValue('data.name', initialValues.name);
    setValue('data.address', initialValues.address);
    setValue('data.type', initialValues.type);
    setValue('data.phoneNumber', initialValues.phoneNumber);
    setValue('data.tin', initialValues.tin);
    setValue('data.website', initialValues.website);
    onClose();
  };

  return (
    <Stack flexDirection="column" gap={8}>
      <Stack flexDirection="column" gap={4}>
        <Text variant="label-3">{t('address.title')}</Text>
        <Checkbox label={t('address.label')} {...register('data.address')} />
      </Stack>
      <Stack flexDirection="column" gap={4}>
        <Text variant="label-3">{t('type.title')}</Text>
        <Checkbox label={t('type.label')} {...register('data.type')} />
      </Stack>
      <Stack flexDirection="column" gap={4}>
        <Text variant="label-3">{t('website.title')}</Text>
        <Checkbox label={t('website.label')} {...register('data.website')} />
      </Stack>
      <Stack flexDirection="column" gap={4}>
        <Text variant="label-3">{t('phone-number.title')}</Text>
        <Checkbox label={t('phone-number.label')} {...register('data.phoneNumber')} />
      </Stack>
      <Stack tag="footer" flexDirection="column" gap={4}>
        <Button variant="primary" fullWidth onClick={onClose}>
          {allT('save')}
        </Button>
        <Button variant="secondary" fullWidth onClick={handleCancel}>
          {allT('cancel')}
        </Button>
      </Stack>
    </Stack>
  );
};

export default Form;
