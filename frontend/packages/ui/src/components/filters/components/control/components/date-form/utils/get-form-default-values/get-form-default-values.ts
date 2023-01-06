import { FilterSelectedOption } from '../../../../../../filters.types';
import { Period } from '../../../../hooks/use-date-options';

type Response = {
  period: string;
  customDate: {
    from: Date;
    to: Date;
  };
};

const getFormDefaultValue = (
  selectedOptions: FilterSelectedOption[],
  now = new Date(),
): Response => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 7,
  );
  const defaultCustomDate = {
    from: today,
    to: nextWeek,
  };

  const isEmpty = selectedOptions.length === 0;
  if (isEmpty) {
    return {
      period: Period.AllTime,
      customDate: defaultCustomDate,
    };
  }

  const isRange = selectedOptions.length === 2;
  if (isRange) {
    const [from, to] = selectedOptions;
    return {
      period: Period.Custom,
      customDate: {
        from: new Date(from),
        to: new Date(to),
      },
    };
  }

  const [period] = selectedOptions;
  return {
    period,
    customDate: defaultCustomDate,
  };
};

export default getFormDefaultValue;
