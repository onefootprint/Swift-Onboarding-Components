import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Button, Checkbox, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useBusinessValues from '../../../hooks/use-business-values';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.business.business-info.form',
  });
  const { t: allT } = useTranslation('common');
  const business = useBusinessValues();
  const [initialValues] = useState(() => business);
  const { setValue, register } = useFormContext<DataToCollectFormData>();

  const handleCancel = () => {
    setValue('business.basic.name', initialValues.name);
    setValue('business.basic.address', initialValues.address);
    setValue('business.basic.type', initialValues.type);
    setValue('business.basic.phoneNumber', initialValues.phoneNumber);
    setValue('business.basic.tin', initialValues.tin);
    setValue('business.basic.website', initialValues.website);

    onClose();
  };

  return (
    <Stack flexDirection="column" gap={8}>
      <Stack flexDirection="column" gap={4}>
        <Text variant="label-3">{t('address.title')}</Text>
        <Checkbox label={t('address.label')} {...register('business.basic.address')} />
      </Stack>
      <Stack flexDirection="column" gap={4}>
        <Text variant="label-3">{t('type.title')}</Text>
        <Checkbox label={t('type.label')} {...register('business.basic.type')} />
      </Stack>
      <Stack flexDirection="column" gap={4}>
        <Text variant="label-3">{t('website.title')}</Text>
        <Checkbox label={t('website.label')} {...register('business.basic.website')} />
      </Stack>
      <Stack flexDirection="column" gap={4}>
        <Text variant="label-3">{t('phone-number.title')}</Text>
        <Checkbox label={t('phone-number.label')} {...register('business.basic.phoneNumber')} />
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
