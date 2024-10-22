import { Command } from '@onefootprint/ui';
import { SelectCustom } from '@onefootprint/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useRiskSignals from '../../../../../../hooks/use-risk-signals';
import BaseTrigger from '../base-trigger';

type RiskSignalSelectProps = {
  value?: string;
  onChange: (value: string) => void;
};

const RiskSignalSelect = ({ value, onChange }: RiskSignalSelectProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'rules.action-row.risk-signals-select' });
  const riskSignalsQuery = useRiskSignals();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const options = useMemo(
    () =>
      riskSignalsQuery.data?.map(riskSignal => ({
        id: riskSignal.id,
        label: riskSignal.reasonCode,
        value: riskSignal.reasonCode,
        description: riskSignal.description,
      })) || [],
    [riskSignalsQuery.data],
  );

  return (
    <SelectCustom.Root defaultValue={value} value={value} onValueChange={onChange} open={open} onOpenChange={setOpen}>
      <SelectCustom.Trigger aria-label={t('aria-label')}>
        <BaseTrigger value={value} placeholder={t('placeholder')} open={open} />
      </SelectCustom.Trigger>
      <SelectCustom.Content
        sideOffset={4}
        align="start"
        popper
        minWidth="max-content"
        aria-label={t('options-aria-label')}
      >
        <Command.Root>
          <Command.Input value={inputValue} onValueChange={setInputValue} size="compact" />
          <Command.List>
            <Command.Empty>{t('no-results')}</Command.Empty>
            <Command.Group>
              {options.map(option => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                    setInputValue('');
                  }}
                >
                  {option.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command.Root>
      </SelectCustom.Content>
    </SelectCustom.Root>
  );
};

export default RiskSignalSelect;
