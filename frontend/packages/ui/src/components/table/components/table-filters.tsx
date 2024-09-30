'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useDebounce, useUpdateEffect } from 'usehooks-ts';

import SearchInput from '../../search-input';
import Stack from '../../stack';

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
    <Stack gap={5}>
      <SearchInput
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        onChangeText={handleChangeText}
        placeholder={placeholder}
        size="compact"
        value={search}
        width="330px"
      />
      {children}
    </Stack>
  );
};

export default TableFilter;
