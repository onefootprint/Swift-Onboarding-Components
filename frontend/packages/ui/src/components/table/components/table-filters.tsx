import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useDebounce, useUpdateEffect } from 'usehooks-ts';

import SearchInput from '../../search-input';

type TableFilterProps = {
  children: React.ReactNode;
  onChangeText?: (text: string) => void;
  initialValue?: string;
};

const TableFilter = ({
  children,
  onChangeText,
  initialValue = '',
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
        sx={{ width: '300px' }}
        value={search}
      />
      {children}
    </TableFilterContainer>
  );
};

const TableFilterContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default TableFilter;
