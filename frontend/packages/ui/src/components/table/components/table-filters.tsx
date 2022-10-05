import React from 'react';
import styled from 'styled-components';

import Box from '../../box';
import Divider from '../../divider';
import SearchInput from '../../search-input';

type TableFilterProps = {
  children: React.ReactNode;
  onChangeText?: (text: string) => void;
  value?: string;
};

const TableFilter = ({
  children,
  onChangeText,
  value = '',
}: TableFilterProps) => (
  <>
    <TableFilterContainer>
      <SearchInput
        inputSize="compact"
        onChangeText={onChangeText}
        sx={{ width: '300px' }}
        value={value}
      />
      {children}
    </TableFilterContainer>
    <Box sx={{ paddingY: 5 }}>
      <Divider />
    </Box>
  </>
);

const TableFilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default TableFilter;
