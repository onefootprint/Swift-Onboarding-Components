import { RiskSignalAttribute } from '@onefootprint/types';
import { Filters } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useRiskSignalsFilters from '@/entity/hooks/use-risk-signals-filters';

const RiskSignalsFilters = () => {
  const { t } = useTranslation('common');
  const filters = useRiskSignalsFilters();

  return (
    <Filters
      controls={[
        {
          query: 'risk_signal_severity',
          label: t('pages.entity.risk-signals.filters.severity.label'),
          kind: 'multi-select',
          options: [
            {
              label: t('pages.entity.risk-signals.severity.high'),
              value: 'high',
            },
            {
              label: t('pages.entity.risk-signals.severity.medium'),
              value: 'medium',
            },
            {
              label: t('pages.entity.risk-signals.severity.low'),
              value: 'low',
            },
            {
              label: t('pages.entity.risk-signals.severity.info'),
              value: 'info',
            },
          ],
          selectedOptions: filters.values.severity,
        },
        {
          query: 'risk_signal_scope',
          label: t('pages.entity.risk-signals.filters.scope.label'),
          kind: 'multi-select',
          options: [
            {
              label: t('signal-attributes.name'),
              value: RiskSignalAttribute.name,
            },
            {
              label: t('signal-attributes.email'),
              value: RiskSignalAttribute.email,
            },
            {
              label: t('signal-attributes.phone_number'),
              value: RiskSignalAttribute.phoneNumber,
            },
            {
              label: t('signal-attributes.dob'),
              value: RiskSignalAttribute.dob,
            },
            {
              label: t('signal-attributes.ssn'),
              value: RiskSignalAttribute.ssn,
            },
            {
              label: t('signal-attributes.document'),
              value: RiskSignalAttribute.document,
            },
            {
              label: t('signal-attributes.address'),
              value: RiskSignalAttribute.address,
            },
            {
              label: t('signal-attributes.street_address'),
              value: RiskSignalAttribute.streetAddress,
            },
            {
              label: t('signal-attributes.city'),
              value: RiskSignalAttribute.city,
            },
            {
              label: t('signal-attributes.state'),
              value: RiskSignalAttribute.state,
            },
            {
              label: t('signal-attributes.zip'),
              value: RiskSignalAttribute.zip,
            },
            {
              label: t('signal-attributes.ip_address'),
              value: RiskSignalAttribute.ipAddress,
            },
            {
              label: t('signal-attributes.device'),
              value: RiskSignalAttribute.device,
            },
            {
              label: t('signal-attributes.native_device'),
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
