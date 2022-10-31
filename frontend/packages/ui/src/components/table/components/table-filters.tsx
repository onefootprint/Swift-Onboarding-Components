import React, { useState } from 'react';
import styled from 'styled-components';
import { useDebounce, useUpdateEffect } from 'usehooks-ts';

import Box from '../../box';
import Divider from '../../divider';
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
    <>
      <TableFilterContainer>
        <SearchInput
          onChangeText={handleChangeText}
          sx={{ width: '300px' }}
          value={search}
        />
        {children}
      </TableFilterContainer>
      <Box sx={{ paddingY: 5 }}>
        <Divider />
      </Box>
    </>
  );
};

const TableFilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default TableFilter;
