import styled, { css } from '@onefootprint/styled';
import React from 'react';
import type { Schemas } from 'src/pages/api-reference/components/articles/articles.types';

import Properties from '../components/properties';
import getSchema from './utils/get-schemas';

const Schema = ({ schema }: { schema: Schemas }) => {
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
