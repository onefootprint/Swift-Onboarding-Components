import { Drawer, SearchInput, Stack, Text } from '@onefootprint/ui';
import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RiskSignalSeverity } from '@onefootprint/types';
import useRiskSignals from 'src/hooks/use-risk-signals';

type RiskSignalsGlossaryProps = {
  open: boolean;
  onClose: () => void;
};

const RiskSignalsGlossary = ({ open, onClose }: RiskSignalsGlossaryProps) => {
  const riskSignalsQuery = useRiskSignals();
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation('common', {
    keyPrefix: 'components.risk-signals-glossary',
  });

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredRiskSignals = useMemo(
    () =>
      riskSignalsQuery.data?.filter(
        riskSignal =>
          riskSignal.reasonCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          riskSignal.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [riskSignalsQuery.data, searchTerm],
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case RiskSignalSeverity.High:
        return 'error';
      case RiskSignalSeverity.Medium:
        return 'warning';
      case RiskSignalSeverity.Low:
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <Drawer open={open} title={t('title')} onClose={onClose}>
      <Stack direction="column" paddingBottom={5}>
        <SearchInput placeholder={t('search')} onChange={handleSearchChange} />
      </Stack>
      <Stack direction="column" gap={3}>
        {filteredRiskSignals?.length === 0 && (
          <Stack paddingTop={5} paddingBottom={5}>
            <Text variant="body-3" color="tertiary">
              {t('no-results')}
            </Text>
          </Stack>
        )}
        {filteredRiskSignals?.map(riskSignal => (
          <Stack key={riskSignal.reasonCode} direction="column" gap={2} paddingTop={2} paddingBottom={2}>
            <Stack direction="row" gap={2} display="inline-flex" align="center">
              <Text variant="label-3">{riskSignal.reasonCode}</Text>
              <Text variant="label-3">⋅</Text>
              <Text variant="label-3" color={getSeverityColor(riskSignal.severity)}>
                {riskSignal.severity.charAt(0).toUpperCase() + riskSignal.severity.slice(1)}
              </Text>
            </Stack>
            <Text variant="body-3" color="tertiary">
              {riskSignal.description}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Drawer>
  );
};

export default RiskSignalsGlossary;
