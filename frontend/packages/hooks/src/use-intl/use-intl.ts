const useIntl = (locale = 'en-US') => {
  const formatDateWithLongMonth = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

  const formatDateWithTime = (date: Date) =>
    date.toLocaleString(locale, {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
    });

  return {
    formatDateWithLongMonth,
    formatDateWithTime,
  };
};

export default useIntl;
