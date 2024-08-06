import styled, { css } from 'styled-components';

import getSchema from '@/api-reference/utils/get-schemas';

import Properties from '../components/properties';

const Schema = ({ schema }: { schema: string }) => {
  const schemaDetails = getSchema(schema);
  // @ts-expect-error: Property 'properties' does not exist on type 'ContentSchema | undefined'.
  const { properties } = schemaDetails;

  return (
    <Container>
      {properties &&
        Object.keys(properties).map(key => <Properties key={key} title={key} properties={properties[key]} />)}
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
