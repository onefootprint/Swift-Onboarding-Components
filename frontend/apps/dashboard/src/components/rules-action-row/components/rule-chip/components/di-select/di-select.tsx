import { Combobox, ComboboxItem, ComboboxList, ComboboxProvider } from '@ariakit/react';
import type { DataIdentifier, ListKind } from '@onefootprint/types';
import { createFontStyles, createOverlayBackground } from '@onefootprint/ui';
import * as SelectPrimitive from '@radix-ui/react-select';
import { matchSorter } from 'match-sorter';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import dataIdentifiersForListKind from '../../utils/data-identifiers-for-list-kind';
import CustomTrigger from '../custom-trigger';

type DISelectProps = {
  defaultDI?: DataIdentifier;
  listKind?: ListKind;
  onChange: (di: string) => void;
};

const DISelect = ({ defaultDI, listKind, onChange }: DISelectProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'rules.action-row.rule-chip.list' });
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedDI, setSelectedDI] = useState<DataIdentifier | undefined>(defaultDI);

  useEffect(() => {
    setSelectedDI(defaultDI);
  }, [defaultDI]);

  const matches = useMemo(() => {
    const options = dataIdentifiersForListKind(listKind);
    if (!searchValue) return options;
    return matchSorter(options, searchValue);
  }, [searchValue, listKind]);

  return (
    <SelectPrimitive.Root
      defaultValue={defaultDI}
      value={defaultDI}
      onValueChange={onChange}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <ComboboxProvider
        open={isOpen}
        setOpen={setIsOpen}
        resetValueOnHide
        includesBaseElement={false}
        setValue={nextValue => {
          setSearchValue(nextValue);
        }}
      >
        <CustomTrigger
          isOpen={isOpen}
          ariaLabel={t('field.trigger-aria-label')}
          color={selectedDI ? 'primary' : 'tertiary'}
        >
          {selectedDI || t('field.placeholder')}
        </CustomTrigger>
        <Content position="popper" sideOffset={4} align="end">
          <Header>
            <Search
              autoSelect
              placeholder={t('field.search-placeholder')}
              onBlurCapture={event => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
            {listKind && matches.length > 0 && (
              <Note>
                <Trans
                  ns="playbook-details"
                  i18nKey="rules.action-row.rule-chip.list.field.validation-note"
                  components={{
                    b: <Bold />,
                  }}
                  values={{ type: listKind }}
                />
              </Note>
            )}
          </Header>
          {matches.length > 0 ? (
            <ComboboxList role="listbox" aria-label={t('field.aria-label')}>
              <DropdownInner>
                {matches.map(di => (
                  <ComboboxItem key={di} role="option" aria-label={di} onClick={() => onChange(di)}>
                    <DropdownOption data-active-item={di === selectedDI}>{di}</DropdownOption>
                  </ComboboxItem>
                ))}
              </DropdownInner>
            </ComboboxList>
          ) : (
            <DropdownOption data-empty>
              {dataIdentifiersForListKind(listKind).length ? t('field.search-empty') : t('field.empty')}
            </DropdownOption>
          )}
        </Content>
      </ComboboxProvider>
    </SelectPrimitive.Root>
  );
};

const Header = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
`;

const Search = styled(Combobox)`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    border: none;
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    color: ${theme.color.primary};
    height: 40px;
    outline: none;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    width: 100%;

    ::placeholder {
      color: ${theme.color.tertiary};
    }
  `}
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

const Content = styled(SelectPrimitive.Content)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    max-height: 350px;
    overflow: auto;
    width: 270px;
    z-index: ${theme.zIndex.dropdown};
  `}
`;

const DropdownInner = styled.div`
  ${({ theme }) => css`
    max-height: 350px;
    padding: ${theme.spacing[2]} 0;
    overflow: scroll;
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

export default DISelect;
