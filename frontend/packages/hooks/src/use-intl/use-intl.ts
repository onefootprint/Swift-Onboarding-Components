const useIntl = (locale = 'en-US') => {
  const formatDateWithShortMonth = (date: Date) => {
    // Eg: 02 Aug. 2023
    const day = date.toLocaleString('default', { day: '2-digit' });
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.toLocaleString('default', { year: 'numeric' });
    return `${day} ${month}. ${year}`;
  };

  const formatDateWithLongMonth = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

  const formatUtcDate = (date: Date, options?: Record<string, unknown>) =>
    date.toLocaleString(locale, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'utc',
      ...options,
    });

  const formatDateWithTime = (date: Date, options?: Record<string, unknown>) =>
    date.toLocaleString(locale, {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      ...options,
    });

  const formatTime = (date: Date, options?: Record<string, unknown>) =>
    date.toLocaleString(locale, {
      hour: '2-digit',
      minute: 'numeric',
      hour12: true,
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
    formatDateWithShortMonth,
    formatDateWithLongMonth,
    formatDateWithTime,
    formatUtcDate,
    formatRelativeDate,
    formatTime,
  };
};

export default useIntl;
