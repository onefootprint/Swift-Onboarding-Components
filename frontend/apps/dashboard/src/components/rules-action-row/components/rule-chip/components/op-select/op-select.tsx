import { ComboboxItem, ComboboxList, ComboboxProvider } from '@ariakit/react';
import { ListRuleOp, RiskSignalRuleOp } from '@onefootprint/types';
import { Text, createOverlayBackground } from '@onefootprint/ui';
import * as SelectPrimitive from '@radix-ui/react-select';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CustomTrigger from '../custom-trigger';

type OpSelectProps = {
  defaultOp: RiskSignalRuleOp | ListRuleOp;
  onChange: (newOp: RiskSignalRuleOp | ListRuleOp) => void;
};

const OpSelect = ({ defaultOp, onChange }: OpSelectProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.rules.action-row.rule-chip.op',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<RiskSignalRuleOp | ListRuleOp>(defaultOp);
  const isList = defaultOp === ListRuleOp.isIn || defaultOp === ListRuleOp.isNotIn;

  useEffect(() => {
    setSelectedOp(defaultOp);
  }, [defaultOp]);

  const handleClick = (value: RiskSignalRuleOp | ListRuleOp) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <SelectPrimitive.Root
      defaultValue={selectedOp}
      value={selectedOp}
      onValueChange={onChange}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <ComboboxProvider open={isOpen} setOpen={setIsOpen} resetValueOnHide includesBaseElement={false}>
        <CustomTrigger isOpen={isOpen} ariaLabel={t('trigger-aria-label')}>
          {t(selectedOp)}
        </CustomTrigger>
        <Content position="popper" sideOffset={4} align="end">
          <ComboboxList role="listbox" aria-label={t('aria-label')}>
            <DropdownInner>
              {Object.values(isList ? ListRuleOp : RiskSignalRuleOp).map(value => (
                <ComboboxItem key={value} role="option" aria-label={t(value)} onClick={() => handleClick(value)}>
                  <DropdownOption data-active-item={value === selectedOp}>
                    <Text variant="caption-1" paddingLeft={5} paddingRight={5} paddingTop={2} paddingBottom={2}>
                      {t(value)}
                    </Text>
                  </DropdownOption>
                </ComboboxItem>
              ))}
            </DropdownInner>
          </ComboboxList>
        </Content>
      </ComboboxProvider>
    </SelectPrimitive.Root>
  );
};

const Content = styled(SelectPrimitive.Content)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    max-height: 350px;
    overflow: auto;
    width: 120px;
    z-index: ${theme.zIndex.dropdown};
  `}
`;

const DropdownInner = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    user-select: none;
    border-radius: ${theme.borderRadius.default};
  `};
`;

const DropdownOption = styled.div`
  cursor: pointer;
  flex-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (hover: hover) {
    :hover {
      ${createOverlayBackground('darken-1', 'primary')};
    }
  }

  &[data-active-item='true'] {
    ${createOverlayBackground('darken-1', 'primary')};
  }
`;

export default OpSelect;
