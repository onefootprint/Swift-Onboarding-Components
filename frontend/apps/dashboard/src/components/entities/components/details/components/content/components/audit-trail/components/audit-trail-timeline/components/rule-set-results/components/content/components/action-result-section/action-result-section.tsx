import type { Color } from '@onefootprint/design-tokens';
import type { Rule } from '@onefootprint/types';
import { RuleAction, RuleActionSection, RuleResultGroup } from '@onefootprint/types';
import { SelectCustom, Stack, Text } from '@onefootprint/ui';
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
  const [selectedResultGroup, setSelectedResultGroup] = useState<RuleResultGroup>(RuleResultGroup.isPresent);
  const actionName = kebabCase(actionSection);
  const stepUpActions = [RuleAction.stepUpIdentitySsn, RuleAction.stepUpPoA, RuleAction.stepUpIdentity];
  const textColors: Record<RuleActionSection, Color> = {
    [RuleActionSection.fail]: 'error',
    [RuleActionSection.stepUp]: 'info',
    [RuleActionSection.manualReview]: 'warning',
    [RuleActionSection.passWithManualReview]: 'success',
  };

  const options = Object.values(RuleResultGroup).map(group => ({
    id: group,
    name: t(kebabCase(group) as ParseKeys<'common'>),
  }));

  const onValueChange = (value: string) => {
    setSelectedResultGroup(value as RuleResultGroup);
  };

  return (
    <Stack
      direction="column"
      gap={5}
      // biome-ignore lint/a11y/useSemanticElements: TODO: change to <fieldset />
      role="group"
      aria-label={t(`${actionName}.title` as ParseKeys<'common'>)}
      position="relative"
    >
      <Stack align="center" justify="space-between">
        <Text variant="label-3" color={textColors[actionSection as RuleActionSection]}>
          {t(`${actionName}.title` as ParseKeys<'common'>)}
        </Text>
        <SelectCustom.Root value={selectedResultGroup} onValueChange={onValueChange}>
          <SelectCustom.Trigger aria-label={t('rule-result-groups')}>
            <SelectCustom.Value placeholder={t('select')}>
              {t(kebabCase(selectedResultGroup) as ParseKeys<'common'>)}
            </SelectCustom.Value>
            <SelectCustom.ChevronIcon />
          </SelectCustom.Trigger>
          <SelectCustom.Content>
            <SelectCustom.Group>
              {options.map(option => (
                <SelectCustom.Item key={option.id} value={option.id} asChild>
                  {option.name}
                </SelectCustom.Item>
              ))}
            </SelectCustom.Group>
          </SelectCustom.Content>
        </SelectCustom.Root>
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
