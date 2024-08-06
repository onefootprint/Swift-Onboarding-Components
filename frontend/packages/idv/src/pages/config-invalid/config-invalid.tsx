import { useTranslation } from 'react-i18next';

import { HeaderTitle, NavigationHeader } from '../../components';

const ConfigInvalid = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.pages.config-invalid',
  });

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
    </>
  );
};

export default ConfigInvalid;
