import { Box } from '@onefootprint/ui';
import React from 'react';
import { Error } from 'src/components';

import useEntityId from '@/entity/hooks/use-entity-id';

import { FieldProps } from '../../../../../field';
import Content from './components/content';
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
  const { isLoading, error, data } = useBusinessOwners(id);

  return (
    <Box key={name}>
      <>
        {isLoading && <Loading />}
        {error && <Error error={error} />}
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
      </>
    </Box>
  );
};

export default BusinessOwners;
