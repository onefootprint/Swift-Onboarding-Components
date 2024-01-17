import { useTranslation } from 'react-i18next';

import { FilterDateRange } from '../../../filters.types';

const useDateOptions = () => {
  const { t } = useTranslation('ui', {
    keyPrefix: 'components.filters.date-options',
  });

  return [
    { value: FilterDateRange.AllTime, label: t('all-time') },
    { value: FilterDateRange.Today, label: t('today') },
    { value: FilterDateRange.Last7Days, label: t('last-7-days') },
    { value: FilterDateRange.Last30Days, label: t('last-30-days') },
    { value: FilterDateRange.Custom, label: t('custom') },
  ];
};

export default useDateOptions;
