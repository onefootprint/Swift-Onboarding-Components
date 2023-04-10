import { Box } from '@onefootprint/ui';
import React from 'react';

import useEntityId from '@/entity/hooks/use-entity-id';

import { FieldProps } from '../../../../components/field';
import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useBusinessOwners from './hooks/use-business-owners.ts';

export type BusinessOwnersProps = FieldProps;

const BusinessOwners = ({
  canDecrypt,
  disabled,
  label,
  name,
  showCheckbox,
  value,
}: FieldProps) => {
  const id = useEntityId();
  const { isLoading, errorMessage, data } = useBusinessOwners(id);

  return (
    <Box key={name}>
      {isLoading && <Loading />}
      {errorMessage && <Error message={errorMessage} />}
      {data && data.length > 0 && (
        <Content
          businessOwners={data}
          canDecrypt={canDecrypt}
          disabled={disabled}
          label={label}
          name={name}
          showCheckbox={showCheckbox}
          value={value}
        />
      )}
    </Box>
  );
};

export default BusinessOwners;
