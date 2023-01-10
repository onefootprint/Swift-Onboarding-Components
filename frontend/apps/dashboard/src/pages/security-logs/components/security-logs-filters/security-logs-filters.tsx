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
                  label: allT('user-data-attributes.name'),
                  value: 'name',
                },
                {
                  label: allT('user-data-attributes.email'),
                  value: UserDataAttribute.email,
                },
                {
                  label: allT('user-data-attributes.phone-number'),
                  value: UserDataAttribute.phoneNumber,
                },
              ],
            },
            {
              label: t('date-attributes.identity.title'),
              options: [
                {
                  label: allT('user-data-attributes.ssn4'),
                  value: UserDataAttribute.ssn4,
                },
                {
                  label: allT('user-data-attributes.ssn9'),
                  value: UserDataAttribute.ssn9,
                },
                {
                  label: allT('user-data-attributes.dob'),
                  value: UserDataAttribute.dob,
                },
              ],
            },
            {
              label: t('date-attributes.address.title'),
              options: [
                {
                  label: allT('user-data-attributes.country'),
                  value: UserDataAttribute.country,
                },
                {
                  label: allT('user-data-attributes.address-line1'),
                  value: UserDataAttribute.addressLine1,
                },
                {
                  label: allT('user-data-attributes.address-line2'),
                  value: UserDataAttribute.addressLine2,
                },
                {
                  label: allT('user-data-attributes.city'),
                  value: UserDataAttribute.city,
                },
                {
                  label: allT('user-data-attributes.zip'),
                  value: UserDataAttribute.zip,
                },
                {
                  label: allT('user-data-attributes.state'),
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
