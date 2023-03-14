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

  const formatRelativeDate = (date: Date) => {
    const units: Record<string, number> = {
      year: 24 * 60 * 60 * 1000 * 365,
      month: (24 * 60 * 60 * 1000 * 365) / 12,
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      minute: 60 * 1000,
      second: 1000,
    };

    const formatter = new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto',
    });
    const millisecondsElapsed = date.getTime() - Date.now();

    const unitKeys = Object.keys(units);
    for (let i = 0; i < unitKeys.length; i += 1) {
      const unit = unitKeys[i];
      if (Math.abs(millisecondsElapsed) > units[unit]) {
        return formatter.format(
          Math.round(millisecondsElapsed / units[unit]),
          // @ts-ignore
          unit,
        );
      }
    }
    return formatter.format(-1, 'second');
  };

  return {
    formatDateWithLongMonth,

    formatDateWithTime,
    formatRelativeDate,
  };
};

export default useIntl;
