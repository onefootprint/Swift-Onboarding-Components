import { useTranslation } from 'react-i18next';

import Fieldset from '../fieldset';
import Form from './components/form';

export type SupportPhoneProps = {
  value?: string | null;
};

const SupportPhone = ({ value }: SupportPhoneProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.support-phone',
  });

  return (
    <Fieldset label={t('label')} value={value} deleteKey={value ? 'clear_support_phone' : undefined}>
      {({ id, handleSubmit }) => (
        <Form
          id={id}
          value={value}
          onSubmit={(newSupportPhone: string) => handleSubmit({ supportPhone: newSupportPhone })}
        />
      )}
    </Fieldset>
  );
};

export default SupportPhone;
