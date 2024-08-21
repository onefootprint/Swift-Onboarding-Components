'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useDebounce, useUpdateEffect } from 'usehooks-ts';

import SearchInput from '../../search-input';

type TableFilterProps = {
  children: React.ReactNode;
  initialValue?: string;
  onChangeText?: (text: string) => void;
  placeholder: string;
};

const TableFilter = ({ children, onChangeText, initialValue = '', placeholder }: TableFilterProps) => {
  const [search, setSearch] = useState(initialValue);

  useEffect(() => {
    setSearch(initialValue);
  }, [initialValue]);

  const debouncedSearch = useDebounce(search, 300);

  const handleChangeText = (nextValue: string) => {
    setSearch(nextValue);
  };

  useUpdateEffect(() => {
    onChangeText?.(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <TableFilterContainer>
      <SearchInput
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        onChangeText={handleChangeText}
        placeholder={placeholder}
        value={search}
        width="330px"
        size="compact"
      />
      {children}
    </TableFilterContainer>
  );
};

const TableFilterContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    margin-bottom: ${theme.spacing[5]};
    gap: ${theme.spacing[5]};
  `}
`;

export default TableFilter;
