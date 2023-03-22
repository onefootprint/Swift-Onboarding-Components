import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Filters } from '@onefootprint/ui';
import React from 'react';

import useSecurityLogsFilters from '../../hooks/use-security-logs-filters';

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
                  label: allT(`di.${UserDataAttribute.firstName}`),
                  value: 'name',
                },
                {
                  label: allT(`di.${UserDataAttribute.lastName}`),
                  value: 'name',
                },
                {
                  label: allT(`di.${UserDataAttribute.email}`),
                  value: UserDataAttribute.email,
                },
                {
                  label: allT(`di.${UserDataAttribute.phoneNumber}`),
                  value: UserDataAttribute.phoneNumber,
                },
              ],
            },
            {
              label: t('date-attributes.identity.title'),
              options: [
                {
                  label: allT(`di.${UserDataAttribute.ssn4}`),
                  value: UserDataAttribute.ssn4,
                },
                {
                  label: allT(`di.${UserDataAttribute.ssn9}`),
                  value: UserDataAttribute.ssn9,
                },
                {
                  label: allT(`di.${UserDataAttribute.dob}`),
                  value: UserDataAttribute.dob,
                },
              ],
            },
            {
              label: t('date-attributes.address.title'),
              options: [
                {
                  label: allT(`di.${UserDataAttribute.country}`),
                  value: UserDataAttribute.country,
                },
                {
                  label: allT(`di.${UserDataAttribute.addressLine1}`),
                  value: UserDataAttribute.addressLine1,
                },
                {
                  label: allT(`di.${UserDataAttribute.addressLine2}`),
                  value: UserDataAttribute.addressLine2,
                },
                {
                  label: allT(`di.${UserDataAttribute.city}`),
                  value: UserDataAttribute.city,
                },
                {
                  label: allT(`di.${UserDataAttribute.zip}`),
                  value: UserDataAttribute.zip,
                },
                {
                  label: allT(`di.${UserDataAttribute.state}`),
                  value: UserDataAttribute.state,
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
