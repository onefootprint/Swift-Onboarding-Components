import type { Lang } from '@/app/types';

const dateFormatter = (lang: Lang = 'en', strDate?: string) => {
  if (!strDate) return '';
  const locale = lang === 'en' ? 'en-US' : 'es-MX';
  const date = new Date(strDate);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    hourCycle: 'h24',
  }).format(date);
};

export default dateFormatter;
