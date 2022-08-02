type FormatOptions = 'date-with-time';

const useIntl =
  (locale = 'en-US') =>
  (value: string, formatOptions: FormatOptions) => {
    if (formatOptions === 'date-with-time') {
      return new Date(value).toLocaleString(locale, {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
      });
    }
    return value;
  };

export default useIntl;
