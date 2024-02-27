import type { Color } from '@onefootprint/design-tokens';
import { IcoCheck16, IcoChevronDown16 } from '@onefootprint/icons';
import type { Rule } from '@onefootprint/types';
import {
  RuleAction,
  RuleActionSection,
  RuleResultGroup,
} from '@onefootprint/types';
import { Dropdown, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { kebabCase } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import RuleList from '../rule-list';

export type ActionResultSectionProps = {
  obConfigurationId: string;
  actionSection: RuleActionSection;
  data: Record<RuleAction, Record<string, Rule[]>>;
};

const ActionResultSection = ({
  obConfigurationId,
  actionSection,
  data,
}: ActionResultSectionProps) => {
  const { t } = useTranslation('common', {
    keyPrefix:
      'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details.rules',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedResultGroup, setSelectedResultGroup] =
    useState<RuleResultGroup>(RuleResultGroup.triggered);
  const actionName = kebabCase(actionSection);
  const stepUpActions = [
    RuleAction.stepUpIdentitySsn,
    RuleAction.stepUpPoA,
    RuleAction.stepUpIdentity,
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectResultGroup = (group: RuleResultGroup) => {
    setSelectedResultGroup(group);
    setIsDropdownOpen(false);
  };

  return (
    <Stack
      direction="column"
      gap={5}
      role="group"
      aria-label={t(`${actionName}.title` as ParseKeys<'common'>)}
    >
      <Stack align="center" justify="space-between">
        <Text
          variant="label-3"
          color={t(`${actionName}.color` as ParseKeys<'common'>) as Color}
        >
          {t(`${actionName}.title` as ParseKeys<'common'>)}
        </Text>
        <Dropdown.Root open={isDropdownOpen} onOpenChange={toggleDropdown}>
          <CustomDropdownTrigger aria-label="Rule result group options">
            <Stack align="center">
              <Text variant="body-3">
                {t(kebabCase(selectedResultGroup) as ParseKeys<'common'>)}
              </Text>
              <Stack align="center" justify="center" marginLeft={2}>
                <IcoChevronDown16 />
              </Stack>
            </Stack>
          </CustomDropdownTrigger>
          <Dropdown.Content
            align="end"
            sideOffset={4}
            style={{
              padding: '0',
            }}
          >
            <DropdownInner>
              {Object.values(RuleResultGroup).map(group => (
                <DropdownOption
                  key={group}
                  role="option"
                  aria-label={t(kebabCase(group) as ParseKeys<'common'>)}
                  onClick={() => selectResultGroup(group)}
                >
                  <Text variant="body-3">
                    {t(kebabCase(group) as ParseKeys<'common'>)}
                  </Text>
                  {group === selectedResultGroup && <IcoCheck16 />}
                </DropdownOption>
              ))}
            </DropdownInner>
          </Dropdown.Content>
        </Dropdown.Root>
      </Stack>
      {actionSection === RuleActionSection.stepUp ? (
        stepUpActions.map(action => (
          <RuleList
            obConfigurationId={obConfigurationId}
            rules={data[action][selectedResultGroup]}
            stepUpAction={action}
          />
        ))
      ) : (
        <RuleList
          obConfigurationId={obConfigurationId}
          rules={data[actionSection][selectedResultGroup]}
        />
      )}
    </Stack>
  );
};

const CustomDropdownTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    width: unset;
    &[data-state='open'] {
      background: unset;
    }
    &:hover {
      background-color: ${theme.backgroundColor.primary} !important;
    }
  `};
`;

const DropdownInner = styled.div`
  ${({ theme }) => css`
    width: 230px;
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[3]} 0px;
    user-select: none;
    border-radius: ${theme.borderRadius.default};
  `};
`;

const DropdownOption = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    cursor: pointer;
    flex-wrap: nowrap;
    overflow: hidden;
  `};
`;

export default ActionResultSection;
