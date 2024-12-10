import { useTranslation } from 'react-i18next';

const useOptions = () => {
  const { t } = useTranslation('lists', { keyPrefix: 'list.dialog.form' });

  const kindOptions = [
    {
      label: t('kind.options.email_address'),
      value: 'email_address',
    },
    {
      label: t('kind.options.email_domain'),
      value: 'email_domain',
    },
    {
      label: t('kind.options.ssn9'),
      value: 'ssn9',
    },
    {
      label: t('kind.options.phone_number'),
      value: 'phone_number',
    },
    {
      label: t('kind.options.phone_country_code'),
      value: 'phone_country_code',
    },
    {
      label: t('kind.options.ip_address'),
      value: 'ip_address',
    },
  ];

  return kindOptions;
};
export default useOptions;
