import { differenceInDays, differenceInHours, format, formatDistance } from 'date-fns';
import { useTranslation } from 'react-i18next';

export const useFormatRelative = (now = new Date()) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.business-selector.last-activity' });

  return (date: string) => {
    const activityDate = new Date(date);
    const hoursAgo = differenceInHours(now, activityDate);
    const daysAgo = differenceInDays(now, activityDate);

    if (hoursAgo < 24) {
      return t('hours', { time: formatDistance(activityDate, now) });
    }
    if (daysAgo < 30) {
      return t('days', { days: daysAgo, count: daysAgo });
    }
    return t('date', { date: format(activityDate, 'MM/dd/yyyy') });
  };
};
