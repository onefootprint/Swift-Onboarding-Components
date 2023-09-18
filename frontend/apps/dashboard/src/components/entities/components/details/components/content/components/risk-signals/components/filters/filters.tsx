import { useTranslation } from '@onefootprint/hooks';
import { RiskSignalAttribute } from '@onefootprint/types';
import { Filters } from '@onefootprint/ui';
import React from 'react';

import useRiskSignalsFilters from '@/entity/hooks/use-risk-signals-filters';

const RiskSignalsFilters = () => {
  const { t, allT } = useTranslation('pages.entity.risk-signals');
  const filters = useRiskSignalsFilters();

  return (
    <Filters
      controls={[
        {
          query: 'risk_signal_severity',
          label: t('filters.severity.label'),
          kind: 'multi-select',
          options: [
            {
              label: t('severity.high'),
              value: 'high',
            },
            {
              label: t('severity.medium'),
              value: 'medium',
            },
            {
              label: t('severity.low'),
              value: 'low',
            },
            {
              label: t('severity.info'),
              value: 'info',
            },
          ],
          selectedOptions: filters.values.severity,
        },
        {
          query: 'risk_signal_scope',
          label: t('filters.scope.label'),
          kind: 'multi-select',
          options: [
            {
              label: allT('signal-attributes.name'),
              value: RiskSignalAttribute.name,
            },
            {
              label: allT('signal-attributes.email'),
              value: RiskSignalAttribute.email,
            },
            {
              label: allT('signal-attributes.phone_number'),
              value: RiskSignalAttribute.phoneNumber,
            },
            {
              label: allT('signal-attributes.dob'),
              value: RiskSignalAttribute.dob,
            },
            {
              label: allT('signal-attributes.ssn'),
              value: RiskSignalAttribute.ssn,
            },
            {
              label: allT('signal-attributes.document'),
              value: RiskSignalAttribute.document,
            },
            {
              label: allT('signal-attributes.address'),
              value: RiskSignalAttribute.address,
            },
            {
              label: allT('signal-attributes.street_address'),
              value: RiskSignalAttribute.streetAddress,
            },
            {
              label: allT('signal-attributes.city'),
              value: RiskSignalAttribute.city,
            },
            {
              label: allT('signal-attributes.state'),
              value: RiskSignalAttribute.state,
            },
            {
              label: allT('signal-attributes.zip'),
              value: RiskSignalAttribute.zip,
            },
            {
              label: allT('signal-attributes.ip_address'),
              value: RiskSignalAttribute.ipAddress,
            },
            {
              label: allT('signal-attributes.device'),
              value: RiskSignalAttribute.device,
            },
            {
              label: allT('signal-attributes.native_device'),
              value: RiskSignalAttribute.native_device,
            },
          ],
          selectedOptions: filters.values.scope,
        },
      ]}
      onChange={(queryKey, queryValue) => {
        filters.push({ [queryKey]: queryValue });
      }}
      onClear={filters.clear}
    />
  );
};

export default RiskSignalsFilters;
