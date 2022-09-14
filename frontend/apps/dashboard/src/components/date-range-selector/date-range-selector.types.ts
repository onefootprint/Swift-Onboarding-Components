import { DateRange } from 'types';
import * as yup from 'yup';

export type DateRangeSelectorFormValues = {
  dateRange: DateRange;
  customDateStart?: string;
  customDateEnd?: string;
};

export const dateRangeSelectorFormSchema = yup
  .object()
  .shape({
    onboardingStatuses: yup.array().of(yup.string()),
    dateRange: yup.string().required(),
    customDateStart: yup.string().when('dateRange', {
      is: DateRange.custom,
      then: yup.string().required('Must provide date range start'),
    }),
    customDateEnd: yup
      .string()
      .when('dateRange', {
        is: DateRange.custom,
        then: yup.string().required('Must provide date range end'),
      })
      .test(
        'End after start',
        'Date end should be after date start',
        (value: string | undefined, context: yup.TestContext) =>
          context.parent.dateRange !== DateRange.custom ||
          (!!value &&
            (!context.parent.customDateStart ||
              context.parent.customDateStart < value)),
      ),
  })
  .required();
