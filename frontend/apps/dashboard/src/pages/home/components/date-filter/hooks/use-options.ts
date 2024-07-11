import { useTranslation } from 'react-i18next';

import type { DateRangeSelectOption } from '../date-filter.types';

const useOptions = (): DateRangeSelectOption[] => {
  const { t } = useTranslation('home');

  return [
    {
      label: t('onboarding-metrics.filters.today'),
      value: 'today',
    },
    {
      label: t('onboarding-metrics.filters.last-7-days'),
      value: 'last-7-days',
    },
    {
      label: t('onboarding-metrics.filters.last-4-weeks'),
      value: 'last-4-weeks',
    },
    {
      label: t('onboarding-metrics.filters.last-3-months'),
      value: 'last-3-months',
    },
    {
      label: t('onboarding-metrics.filters.last-12-months'),
      value: 'last-12-months',
    },
    {
      label: t('onboarding-metrics.filters.month-to-date'),
      value: 'month-to-date',
    },
    {
      label: t('onboarding-metrics.filters.quarter-to-date'),
      value: 'quarter-to-date',
    },
    {
      label: t('onboarding-metrics.filters.year-to-date'),
      value: 'year-to-date',
    },
    {
      label: t('onboarding-metrics.filters.all-time'),
      value: 'all-time',
    },
    {
      label: t('onboarding-metrics.filters.custom'),
      value: 'custom',
    },
  ];
};

export default useOptions;
