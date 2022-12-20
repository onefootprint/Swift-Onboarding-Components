import { Typography } from '@onefootprint/ui';
import React from 'react';
import { KycDataValue } from 'src/hooks/use-user';
import FieldOrPlaceholder from 'src/pages/users/components/field-or-placeholder';
import styled from 'styled-components';

export type DataRowProps = {
  title: string;
  data?: KycDataValue;
};

const DataRow = ({ title, data }: DataRowProps) => (
  <DataRowContainer>
    <Typography variant="label-3" color="tertiary">
      {title}
    </Typography>
    <FieldOrPlaceholder data={data} />
  </DataRowContainer>
);

const DataRowContainer = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

export default DataRow;
