import { ListRuleOp, RiskSignalRuleOp } from '@onefootprint/types';
import { SelectCustom } from '@onefootprint/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BaseTrigger from '../base-trigger';

type OpSelectProps = {
  defaultOp: RiskSignalRuleOp | ListRuleOp;
  onChange: (newOp: RiskSignalRuleOp | ListRuleOp) => void;
};

const OpSelect = ({ defaultOp, onChange }: OpSelectProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'rules.action-row.rule-chip.op' });
  const [open, setOpen] = useState(false);

  const isList = defaultOp === ListRuleOp.isIn || defaultOp === ListRuleOp.isNotIn;

  const options = useMemo(
    () =>
      Object.values(isList ? ListRuleOp : RiskSignalRuleOp).map(value => ({
        value,
        label: t(value),
      })),
    [isList, t],
  );

  return (
    <SelectCustom.Root
      defaultValue={defaultOp}
      value={defaultOp}
      onValueChange={onChange}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectCustom.Trigger aria-label={t('trigger-aria-label')}>
        <BaseTrigger value={t(defaultOp)} open={open} />
      </SelectCustom.Trigger>
      <SelectCustom.Content sideOffset={4} align="start" popper minWidth="max-content">
        <SelectCustom.Group>
          {options.map(option => (
            <SelectCustom.Item
              size="compact"
              key={option.value}
              value={option.value}
              onSelect={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </SelectCustom.Item>
          ))}
        </SelectCustom.Group>
      </SelectCustom.Content>
    </SelectCustom.Root>
  );
};

export default OpSelect;
