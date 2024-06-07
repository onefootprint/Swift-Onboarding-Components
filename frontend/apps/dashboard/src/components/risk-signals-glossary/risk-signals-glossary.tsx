import { Drawer, SearchInput, Stack, Text } from '@onefootprint/ui';
import type { ChangeEvent } from 'react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useRiskSignals from '../../hooks/use-risk-signals';

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

  return (
    <Drawer open={open} title={t('title')} onClose={onClose}>
      <Stack direction="column" paddingBottom={5}>
        <SearchInput placeholder={t('search')} onChange={handleSearchChange} />
      </Stack>
      <Stack direction="column" gap={3}>
        {filteredRiskSignals?.length === 0 && (
          <Stack paddingTop={5} paddingBottom={5}>
            <Text variant="body-4" color="tertiary">
              {t('no-results')}
            </Text>
          </Stack>
        )}
        {filteredRiskSignals?.map(riskSignal => (
          <Stack key={riskSignal.reasonCode} direction="column" gap={2} paddingTop={2} paddingBottom={2}>
            <Text variant="label-4">{riskSignal.reasonCode}</Text>
            <Text variant="body-4" color="tertiary">
              {riskSignal.description}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Drawer>
  );
};

export default RiskSignalsGlossary;
