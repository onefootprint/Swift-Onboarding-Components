import { useTranslation } from '@onefootprint/hooks';
import { SignalAttribute } from '@onefootprint/types';
import { Filters } from '@onefootprint/ui';
import React from 'react';

import useRiskSignalsFilters from '../../hooks/use-risk-signals-filters';

const RiskSignalsFilters = () => {
  const { t, allT } = useTranslation('pages.user-details.risk-signals');
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
              value: SignalAttribute.name,
            },
            {
              label: allT('signal-attributes.email'),
              value: SignalAttribute.email,
            },
            {
              label: allT('signal-attributes.phone_number'),
              value: SignalAttribute.phoneNumber,
            },
            {
              label: allT('signal-attributes.dob'),
              value: SignalAttribute.dob,
            },
            {
              label: allT('signal-attributes.ssn'),
              value: SignalAttribute.ssn,
            },
            {
              label: allT('signal-attributes.document'),
              value: SignalAttribute.document,
            },
            {
              label: allT('signal-attributes.address'),
              value: SignalAttribute.address,
            },
            {
              label: allT('signal-attributes.street_address'),
              value: SignalAttribute.streetAddress,
            },
            {
              label: allT('signal-attributes.city'),
              value: SignalAttribute.city,
            },
            {
              label: allT('signal-attributes.state'),
              value: SignalAttribute.state,
            },
            {
              label: allT('signal-attributes.zip'),
              value: SignalAttribute.zip,
            },
            {
              label: allT('signal-attributes.ip_address'),
              value: SignalAttribute.ipAddress,
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
