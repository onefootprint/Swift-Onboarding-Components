import { useTranslation } from '@onefootprint/hooks';
import { IdDI } from '@onefootprint/types';
import { Filters } from '@onefootprint/ui';
import React from 'react';

import useSecurityLogsFilters from '../../hooks/use-security-logs-filters';
import getFilterValueForDI from '../../utils/get-filter-value-for-di';

const UsersFilters = () => {
  const { t, allT } = useTranslation('pages.security-logs.filters');
  const filters = useSecurityLogsFilters();

  return (
    <Filters
      controls={[
        {
          query: 'data_attributes',
          label: t('date-attributes.label'),
          kind: 'multi-select-grouped',
          options: [
            {
              label: t('date-attributes.basic.title'),
              options: [
                {
                  label: allT(`di.${IdDI.firstName}`),
                  value: 'name',
                },
                {
                  label: allT(`di.${IdDI.lastName}`),
                  value: 'name',
                },
                {
                  label: allT(`di.${IdDI.email}`),
                  value: getFilterValueForDI(IdDI.email),
                },
                {
                  label: allT(`di.${IdDI.phoneNumber}`),
                  value: getFilterValueForDI(IdDI.phoneNumber),
                },
              ],
            },
            {
              label: t('date-attributes.identity.title'),
              options: [
                {
                  label: allT(`di.${IdDI.ssn4}`),
                  value: getFilterValueForDI(IdDI.ssn4),
                },
                {
                  label: allT(`di.${IdDI.ssn9}`),
                  value: getFilterValueForDI(IdDI.ssn9),
                },
                {
                  label: allT(`di.${IdDI.dob}`),
                  value: getFilterValueForDI(IdDI.dob),
                },
              ],
            },
            {
              label: t('date-attributes.address.title'),
              options: [
                {
                  label: allT(`di.${IdDI.country}`),
                  value: getFilterValueForDI(IdDI.country),
                },
                {
                  label: allT(`di.${IdDI.addressLine1}`),
                  value: getFilterValueForDI(IdDI.addressLine1),
                },
                {
                  label: allT(`di.${IdDI.addressLine2}`),
                  value: getFilterValueForDI(IdDI.addressLine2),
                },
                {
                  label: allT(`di.${IdDI.city}`),
                  value: getFilterValueForDI(IdDI.city),
                },
                {
                  label: allT(`di.${IdDI.zip}`),
                  value: getFilterValueForDI(IdDI.zip),
                },
                {
                  label: allT(`di.${IdDI.state}`),
                  value: getFilterValueForDI(IdDI.state),
                },
              ],
            },
          ],
          selectedOptions: filters.values.dataAttributes,
        },
        {
          query: 'date_range',
          label: t('date-range.label'),
          kind: 'date',
          selectedOptions: filters.values.dateRange,
        },
      ]}
      onChange={(queryKey, queryValue) => {
        filters.push({ [queryKey]: queryValue });
      }}
      onClear={() => {
        filters.clear();
      }}
    />
  );
};

export default UsersFilters;
