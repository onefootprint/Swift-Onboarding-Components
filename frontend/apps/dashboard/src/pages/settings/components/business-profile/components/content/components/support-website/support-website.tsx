import { useTranslation } from 'react-i18next';

import Fieldset from '../fieldset';
import Form from './components/form';

export type SupportWebsiteProps = {
  value?: string | null;
};

const SupportWebsite = ({ value }: SupportWebsiteProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.support-website',
  });

  return (
    <Fieldset label={t('label')} value={value} deleteKey={value ? 'clear_support_website' : undefined}>
      {({ id, handleSubmit }) => (
        <Form
          id={id}
          value={value}
          onSubmit={(newSupportWebsite: string) => handleSubmit({ supportWebsite: newSupportWebsite })}
        />
      )}
    </Fieldset>
  );
};

export default SupportWebsite;
