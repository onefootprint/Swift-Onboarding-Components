import { useTranslation } from 'react-i18next';

import Fieldset from '../fieldset';
import Form from './components/form';

export type WebsiteProps = {
  value?: string | null;
};

const Website = ({ value }: WebsiteProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.website',
  });

  return (
    <Fieldset label={t('label')} value={value}>
      {({ id, handleSubmit }) => (
        <Form id={id} value={value} onSubmit={(newWebsite: string) => handleSubmit({ websiteUrl: newWebsite })} />
      )}
    </Fieldset>
  );
};

export default Website;
