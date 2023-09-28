import styled, { css } from '@onefootprint/styled';
import React from 'react';

import getSchema from '@/api-reference/utils/get-schemas';

import Properties from '../components/properties';

const Schema = ({ schema }: { schema: string }) => {
  const schemaDetails = getSchema(schema);
  const { properties } = schemaDetails as Record<string, any>;

  return (
    <Container>
      {properties &&
        Object.keys(properties).map(key => (
          <Properties key={key} title={key} properties={properties[key]} />
        ))}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    margin-left: ${theme.spacing[3]};
  `}
`;

export default Schema;
