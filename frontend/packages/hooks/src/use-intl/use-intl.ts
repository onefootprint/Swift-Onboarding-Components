const useIntl = (locale = 'en-US') => {
  const formatDateWithLongMonth = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

  const formatDateWithTime = (date: Date, options?: Record<string, any>) =>
    date.toLocaleString(locale, {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      ...options,
    });

  return {
    formatDateWithLongMonth,
    formatDateWithTime,
  };
};

export default useIntl;
