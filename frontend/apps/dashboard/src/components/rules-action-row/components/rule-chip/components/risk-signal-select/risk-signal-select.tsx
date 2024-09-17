import { Combobox, ComboboxItem, ComboboxList, ComboboxProvider } from '@ariakit/react';
import { Text, createFontStyles, createOverlayBackground } from '@onefootprint/ui';
import * as SelectPrimitive from '@radix-ui/react-select';
import { matchSorter } from 'match-sorter';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRowProps } from 'react-virtualized';
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';
import styled, { css } from 'styled-components';

import useRiskSignals from '../../../../../../hooks/use-risk-signals';
import CustomTrigger from '../custom-trigger';

const ITEM_HEIGHT = 64;

type RiskSignalSelectProps = {
  value?: string;
  onChange: (value: string) => void;
};

const RiskSignalSelect = ({ value, onChange }: RiskSignalSelectProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'details.rules.action-row.risk-signals-select',
  });
  const riskSignalsQuery = useRiskSignals();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedSignal, setSelectedSignal] = useState(value);
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: ITEM_HEIGHT,
    }),
  );
  const [listKey, setListKey] = useState(0);

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

  const matches = useMemo(() => {
    if (!searchValue) return options;
    const keys = ['label', 'description'];
    return matchSorter(options, searchValue, { keys });
  }, [searchValue, options]);

  useEffect(() => {
    cache.current.clearAll();
    setListKey(prevKey => prevKey + 1);
  }, [matches]);

  const renderRow: React.FC<ListRowProps> = ({ index, key, style, parent }) => {
    const option = matches[index];
    if (!option) return null;

    return (
      <CellMeasurer key={key} cache={cache.current} parent={parent} columnIndex={0} rowIndex={index}>
        <Item
          asChild
          key={option.value}
          value={option.value}
          textValue={option.label}
          onClick={() => setSelectedSignal(option.value)}
          role="option"
          aria-label={option.label}
          style={style}
        >
          <ComboboxItem>
            <Text variant="label-3" truncate>
              {option.label}
            </Text>
            <Text variant="body-3" color="tertiary">
              {option.description}
            </Text>
          </ComboboxItem>
        </Item>
      </CellMeasurer>
    );
  };

  return (
    <SelectPrimitive.Root
      defaultValue={value}
      value={value}
      onValueChange={onChange}
      open={open}
      onOpenChange={setOpen}
    >
      <ComboboxProvider
        open={open}
        setOpen={setOpen}
        resetValueOnHide
        includesBaseElement={false}
        setValue={nextValue => {
          setSearchValue(nextValue);
        }}
      >
        <CustomTrigger isOpen={open} ariaLabel={t('aria-label')} color={selectedSignal ? 'primary' : 'tertiary'}>
          {selectedSignal || t('placeholder')}
        </CustomTrigger>
        <Content position="popper" sideOffset={4} align="end">
          <Header>
            <Search
              autoSelect
              placeholder={t('search')}
              onBlurCapture={event => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          </Header>
          {matches.length > 0 ? (
            <ComboboxList role="listbox" aria-label={t('title')}>
              <AutoSizer>
                {({ width }) => (
                  <List
                    key={listKey}
                    width={width}
                    height={350}
                    deferredMeasurementCache={cache.current}
                    rowCount={matches.length}
                    rowHeight={cache.current.rowHeight}
                    rowRenderer={renderRow}
                    overscanRowCount={10}
                  />
                )}
              </AutoSizer>
            </ComboboxList>
          ) : null}
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

const Content = styled(SelectPrimitive.Content)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    height: 350px;
    overflow: auto;
    width: 360px;
    z-index: ${theme.zIndex.dropdown};
  `}
`;

const Item = styled(SelectPrimitive.Item)`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    cursor: pointer;
    outline: none;
    background: ${theme.backgroundColor.primary};

    @media (hover: hover) {
      :hover {
        ${createOverlayBackground('darken-1', 'primary')};
      }
    }

    &[data-active-item] {
      ${createOverlayBackground('darken-1', 'primary')};
    }
  `}
`;

export default RiskSignalSelect;
