import { useTranslation } from '@onefootprint/hooks';
import { BusinessDI, IdDI } from '@onefootprint/types';
import { Filters } from '@onefootprint/ui';
import React from 'react';

import useSecurityLogsFilters from '../../hooks/use-security-logs-filters';

const SecurityLogsFilters = () => {
  const { t, allT } = useTranslation('pages.security-logs.filters');
  const filters = useSecurityLogsFilters();

  return (
    <Filters
      controls={[
        {
          query: 'data_attributes',
          label: t('attributes.label'),
          kind: 'multi-select-grouped',
          options: [
            {
              label: t('attributes.id.basic.title'),
              options: [
                {
                  label: allT(`di.${IdDI.firstName}`),
                  value: IdDI.firstName,
                },
                {
                  label: allT(`di.${IdDI.lastName}`),
                  value: IdDI.lastName,
                },
                {
                  label: allT(`di.${IdDI.email}`),
                  value: IdDI.email,
                },
                {
                  label: allT(`di.${IdDI.phoneNumber}`),
                  value: IdDI.phoneNumber,
                },
              ],
            },
            {
              label: t('attributes.id.identity.title'),
              options: [
                {
                  label: allT(`di.${IdDI.ssn4}`),
                  value: IdDI.ssn4,
                },
                {
                  label: allT(`di.${IdDI.ssn9}`),
                  value: IdDI.ssn9,
                },
                {
                  label: allT(`di.${IdDI.dob}`),
                  value: IdDI.dob,
                },
              ],
            },
            {
              label: t('attributes.id.address.title'),
              options: [
                {
                  label: allT(`di.${IdDI.addressLine1}`),
                  value: IdDI.addressLine1,
                },
                {
                  label: allT(`di.${IdDI.addressLine2}`),
                  value: IdDI.addressLine2,
                },
                {
                  label: allT(`di.${IdDI.city}`),
                  value: IdDI.city,
                },
                {
                  label: allT(`di.${IdDI.zip}`),
                  value: IdDI.zip,
                },
                {
                  label: allT(`di.${IdDI.state}`),
                  value: IdDI.state,
                },
                {
                  label: allT(`di.${IdDI.country}`),
                  value: IdDI.country,
                },
              ],
            },
            {
              label: t('attributes.business.basic.title'),
              options: [
                {
                  label: allT(`di.${BusinessDI.name}`),
                  value: BusinessDI.name,
                },
                {
                  label: allT(`di.${BusinessDI.doingBusinessAs}`),
                  value: BusinessDI.doingBusinessAs,
                },
                {
                  label: allT(`di.${BusinessDI.tin}`),
                  value: BusinessDI.tin,
                },
                {
                  label: allT(`di.${BusinessDI.phoneNumber}`),
                  value: BusinessDI.phoneNumber,
                },
                {
                  label: allT(`di.${BusinessDI.website}`),
                  value: BusinessDI.website,
                },
                {
                  label: allT(`di.${BusinessDI.beneficialOwners}`),
                  value: BusinessDI.beneficialOwners,
                },
              ],
            },
            {
              label: t('attributes.business.address.title'),
              options: [
                {
                  label: allT(`di.${BusinessDI.addressLine1}`),
                  value: BusinessDI.addressLine1,
                },
                {
                  label: allT(`di.${BusinessDI.addressLine2}`),
                  value: BusinessDI.addressLine2,
                },
                {
                  label: allT(`di.${BusinessDI.city}`),
                  value: BusinessDI.city,
                },
                {
                  label: allT(`di.${BusinessDI.zip}`),
                  value: BusinessDI.zip,
                },
                {
                  label: allT(`di.${BusinessDI.state}`),
                  value: BusinessDI.state,
                },
                {
                  label: allT(`di.${BusinessDI.country}`),
                  value: BusinessDI.country,
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

export default SecurityLogsFilters;
