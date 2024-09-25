import type { Color } from '@onefootprint/design-tokens';
import type { Rule } from '@onefootprint/types';
import { RuleAction, RuleActionSection, RuleResultGroup } from '@onefootprint/types';
import { Dropdown, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import kebabCase from 'lodash/kebabCase';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import RuleList from '../rule-list';

export type ActionResultSectionProps = {
  actionSection: RuleActionSection;
  data: Record<RuleAction, Record<string, Rule[]>>;
};

const ActionResultSection = ({ actionSection, data }: ActionResultSectionProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.rule-set-results',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedResultGroup, setSelectedResultGroup] = useState<RuleResultGroup>(RuleResultGroup.isPresent);
  const actionName = kebabCase(actionSection);
  const stepUpActions = [RuleAction.stepUpIdentitySsn, RuleAction.stepUpPoA, RuleAction.stepUpIdentity];
  const textColors: Record<string, Color> = {
    fail: 'error',
    'step-up': 'info',
    'manual-review': 'warning',
    'pass-with-manual-review': 'success',
  };

  const toggleDropdown = () => {
    setIsOpen(isCurrentlyOpen => !isCurrentlyOpen);
  };

  const onChange = (group: RuleResultGroup) => {
    setSelectedResultGroup(group);
    setIsOpen(false);
  };

  return (
    <Stack direction="column" gap={5} role="group" aria-label={t(`${actionName}.title` as ParseKeys<'common'>)}>
      <Stack align="center" justify="space-between">
        <Text variant="label-3" color={textColors[actionName]}>
          {t(`${actionName}.title` as ParseKeys<'common'>)}
        </Text>
        <Dropdown.Root open={isOpen} onOpenChange={toggleDropdown}>
          <Dropdown.Trigger aria-label="Rule result groups" variant="chevron">
            <Stack align="center">
              <Text variant="body-3">{t(kebabCase(selectedResultGroup) as ParseKeys<'common'>)}</Text>
            </Stack>
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content align="end" sideOffset={4} asChild>
              <Dropdown.Group>
                {Object.values(RuleResultGroup).map(group => {
                  const label = t(kebabCase(group) as ParseKeys<'common'>);
                  return (
                    <Dropdown.Item
                      key={group}
                      role="option"
                      aria-label={label}
                      onClick={() => onChange(group)}
                      checked={group === selectedResultGroup}
                    >
                      <Text variant="body-3">{label}</Text>
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Group>
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>
      </Stack>
      {actionSection === RuleActionSection.stepUp ? (
        stepUpActions.map(action => (
          <RuleList key={action} rules={data[action][selectedResultGroup]} stepUpAction={action} />
        ))
      ) : (
        <RuleList rules={data[actionSection][selectedResultGroup]} />
      )}
    </Stack>
  );
};

export default ActionResultSection;
