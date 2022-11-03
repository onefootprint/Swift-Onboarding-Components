import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import EncryptedCell from 'src/components/encrypted-cell';
import { DataValue } from 'src/pages/users/types/vault-data.types';
import styled from 'styled-components';

export type DataRowProps = {
  title: string;
  data?: DataValue;
  showButton: {
    label: string;
    onClick: () => void;
  };
};

const ImageDataRow = ({
  title,
  data,
  showButton: { label, onClick },
}: DataRowProps) => (
  <DataRowContainer>
    <Typography variant="label-3" color="tertiary">
      {title}
    </Typography>
    {data === null && <EncryptedCell />}
    {data === undefined && (
      <Typography
        variant="body-3"
        color="primary"
        sx={{ whiteSpace: 'nowrap' }}
      >
        -
      </Typography>
    )}
    {typeof data === 'string' && (
      <LinkButton onClick={onClick} size="compact">
        {label}
      </LinkButton>
    )}
  </DataRowContainer>
);

const DataRowContainer = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

export default ImageDataRow;
