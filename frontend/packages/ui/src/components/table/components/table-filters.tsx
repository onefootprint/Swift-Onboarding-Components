import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useDebounce, useUpdateEffect } from 'usehooks-ts';

import SearchInput from '../../search-input';

type TableFilterProps = {
  children: React.ReactNode;
  initialValue?: string;
  onChangeText?: (text: string) => void;
  placeholder: string;
};

const TableFilter = ({
  children,
  onChangeText,
  initialValue = '',
  placeholder,
}: TableFilterProps) => {
  const [search, setSearch] = useState(initialValue);
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
        onChangeText={handleChangeText}
        placeholder={placeholder}
        sx={{ width: '232px' }}
        value={search}
      />
      {children}
    </TableFilterContainer>
  );
};

const TableFilterContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    margin-bottom: ${theme.spacing[4]};
    gap: ${theme.spacing[5]};
  `}
`;

export default TableFilter;
