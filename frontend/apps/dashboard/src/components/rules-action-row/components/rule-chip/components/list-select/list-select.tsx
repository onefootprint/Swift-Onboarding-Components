import { ComboboxItem, ComboboxList, ComboboxProvider } from '@ariakit/react';
import type { DataIdentifier, List } from '@onefootprint/types';
import { createFontStyles, createOverlayBackground } from '@onefootprint/ui';
import * as SelectPrimitive from '@radix-ui/react-select';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import listKindsForDataIdentifier from '../../utils/list-kinds-for-data-identifier';
import CustomTrigger from '../custom-trigger';

type ListProps = {
  defaultList?: List;
  di?: DataIdentifier;
  lists?: List[];
  onChange: (id: string) => void;
};

const ListSelect = ({ defaultList, di, lists = [], onChange }: ListProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'rules.action-row.rule-chip.list' });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<List | undefined>(defaultList);
  const filteredLists = di ? lists?.filter(({ kind }) => listKindsForDataIdentifier(di).includes(kind)) : lists;

  useEffect(() => {
    setSelectedList(defaultList);
  }, [defaultList]);

  const handleClick = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <SelectPrimitive.Root
      defaultValue={selectedList?.id}
      value={selectedList?.id}
      onValueChange={onChange}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <ComboboxProvider open={isOpen} setOpen={setIsOpen} resetValueOnHide includesBaseElement={false}>
        <CustomTrigger
          isOpen={isOpen}
          ariaLabel={t('value.trigger-aria-label')}
          color={selectedList ? 'primary' : 'tertiary'}
        >
          {selectedList?.name || t('value.placeholder')}
        </CustomTrigger>
        <Content position="popper" sideOffset={4} align="end">
          <Header>
            {di && filteredLists.length > 0 && (
              <Note>
                <Trans
                  ns="playbook-details"
                  i18nKey="rules.action-row.rule-chip.list.value.validation-note"
                  components={{
                    b: <Bold />,
                  }}
                  values={{ type: di }}
                />
              </Note>
            )}
          </Header>
          {filteredLists.length > 0 ? (
            <ComboboxList role="listbox" aria-label={t('value.aria-label')}>
              <DropdownInner>
                {filteredLists.map(({ id, alias }) => (
                  <ComboboxItem key={id} role="option" aria-label={id} onClick={() => handleClick(id)}>
                    <DropdownOption data-active-item={id === selectedList?.id}>{alias ?? id}</DropdownOption>
                  </ComboboxItem>
                ))}
              </DropdownInner>
            </ComboboxList>
          ) : (
            <DropdownOption data-empty>{t('value.empty')}</DropdownOption>
          )}
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
    width: 260px;
    z-index: ${theme.zIndex.dropdown};
  `}
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
`;

const Note = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('caption-4')};
    background: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    color: ${theme.color.primary};
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `}
`;

const Bold = styled.b`
  ${createFontStyles('caption-3')};
`;

const DropdownInner = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]} 0;
    display: flex;
    flex-direction: column;
    user-select: none;
    border-radius: ${theme.borderRadius.default};
  `};
`;

const DropdownOption = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    ${createFontStyles('caption-1')};
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

    &[data-empty='true'] {
      padding: ${theme.spacing[3]} ${theme.spacing[5]};
      pointer-events: none;
      color: ${theme.color.tertiary};
    }
  `};
`;

export default ListSelect;
