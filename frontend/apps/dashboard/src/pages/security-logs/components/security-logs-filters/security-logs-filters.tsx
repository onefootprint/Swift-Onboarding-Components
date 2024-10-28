import { BusinessDI, IdDI } from '@onefootprint/types';
import { Filters } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import useSecurityLogsFilters from '../../../../hooks/use-security-logs-filters';

const SecurityLogsFilters = () => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('security-logs', {
    keyPrefix: 'filters',
  });
  const filters = useSecurityLogsFilters();

  return (
    <Filters
      controls={[
        {
          query: 'data_attributes_personal',
          label: t('attributes.id.label'),
          kind: 'multi-select-grouped',
          options: [
            {
              label: t('attributes.id.basic.title'),
              options: [
                {
                  label: allT(`di.${IdDI.firstName}` as ParseKeys<'common'>),
                  value: IdDI.firstName,
                },
                {
                  label: allT(`di.${IdDI.middleName}` as ParseKeys<'common'>),
                  value: IdDI.middleName,
                },
                {
                  label: allT(`di.${IdDI.lastName}` as ParseKeys<'common'>),
                  value: IdDI.lastName,
                },
                {
                  label: allT(`di.${IdDI.email}` as ParseKeys<'common'>),
                  value: IdDI.email,
                },
                {
                  label: allT(`di.${IdDI.phoneNumber}` as ParseKeys<'common'>),
                  value: IdDI.phoneNumber,
                },
              ],
            },
            {
              label: t('attributes.id.identity.title'),
              options: [
                {
                  label: allT(`di.${IdDI.ssn4}` as ParseKeys<'common'>),
                  value: IdDI.ssn4,
                },
                {
                  label: allT(`di.${IdDI.ssn9}` as ParseKeys<'common'>),
                  value: IdDI.ssn9,
                },
                {
                  label: allT(`di.${IdDI.dob}` as ParseKeys<'common'>),
                  value: IdDI.dob,
                },
              ],
            },
            {
              label: t('attributes.id.address.title'),
              options: [
                {
                  label: allT(`di.${IdDI.addressLine1}` as ParseKeys<'common'>),
                  value: IdDI.addressLine1,
                },
                {
                  label: allT(`di.${IdDI.addressLine2}` as ParseKeys<'common'>),
                  value: IdDI.addressLine2,
                },
                {
                  label: allT(`di.${IdDI.city}` as ParseKeys<'common'>),
                  value: IdDI.city,
                },
                {
                  label: allT(`di.${IdDI.zip}` as ParseKeys<'common'>),
                  value: IdDI.zip,
                },
                {
                  label: allT(`di.${IdDI.state}` as ParseKeys<'common'>),
                  value: IdDI.state,
                },
                {
                  label: allT(`di.${IdDI.country}` as ParseKeys<'common'>),
                  value: IdDI.country,
                },
              ],
            },
            {
              label: t('attributes.id.legal-status.title'),
              options: [
                {
                  label: allT(`di.${IdDI.usLegalStatus}` as ParseKeys<'common'>),
                  value: IdDI.usLegalStatus,
                },
                {
                  label: allT('di.id.country_of_birth'),
                  value: IdDI.nationality,
                },
                {
                  label: allT(`di.${IdDI.citizenships}` as ParseKeys<'common'>),
                  value: IdDI.citizenships,
                },
                {
                  label: allT(`di.${IdDI.visaKind}` as ParseKeys<'common'>),
                  value: IdDI.visaKind,
                },
                {
                  label: allT(`di.${IdDI.visaExpirationDate}` as ParseKeys<'common'>),
                  value: IdDI.visaExpirationDate,
                },
              ],
            },
          ],
          selectedOptions: filters.values.dataAttributesPersonal ?? [],
        },
        {
          query: 'data_attributes_business',
          label: t('attributes.business.label'),
          kind: 'multi-select-grouped',
          options: [
            {
              label: t('attributes.business.basic.title'),
              options: [
                {
                  label: allT(`di.${BusinessDI.name}` as ParseKeys<'common'>),
                  value: BusinessDI.name,
                },
                {
                  label: allT(`di.${BusinessDI.doingBusinessAs}` as ParseKeys<'common'>),
                  value: BusinessDI.doingBusinessAs,
                },
                {
                  label: allT(`di.${BusinessDI.tin}` as ParseKeys<'common'>),
                  value: BusinessDI.tin,
                },
                {
                  label: allT(`di.${BusinessDI.corporationType}` as ParseKeys<'common'>),
                  value: BusinessDI.corporationType,
                },
                {
                  label: allT(`di.${BusinessDI.phoneNumber}` as ParseKeys<'common'>),
                  value: BusinessDI.phoneNumber,
                },
                {
                  label: allT(`di.${BusinessDI.website}` as ParseKeys<'common'>),
                  value: BusinessDI.website,
                },
                {
                  label: allT(`di.${BusinessDI.beneficialOwners}` as ParseKeys<'common'>),
                  value: BusinessDI.beneficialOwners,
                },
              ],
            },
            {
              label: t('attributes.business.address.title'),
              options: [
                {
                  label: allT(`di.${BusinessDI.addressLine1}` as ParseKeys<'common'>),
                  value: BusinessDI.addressLine1,
                },
                {
                  label: allT(`di.${BusinessDI.addressLine2}` as ParseKeys<'common'>),
                  value: BusinessDI.addressLine2,
                },
                {
                  label: allT(`di.${BusinessDI.city}` as ParseKeys<'common'>),
                  value: BusinessDI.city,
                },
                {
                  label: allT(`di.${BusinessDI.zip}` as ParseKeys<'common'>),
                  value: BusinessDI.zip,
                },
                {
                  label: allT(`di.${BusinessDI.state}` as ParseKeys<'common'>),
                  value: BusinessDI.state,
                },
                {
                  label: allT(`di.${BusinessDI.country}` as ParseKeys<'common'>),
                  value: BusinessDI.country,
                },
              ],
            },
          ],
          selectedOptions: filters.values.dataAttributesBusiness ?? [],
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
