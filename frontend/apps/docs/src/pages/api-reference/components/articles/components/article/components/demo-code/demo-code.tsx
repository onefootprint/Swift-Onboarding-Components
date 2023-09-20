import styled, { css } from '@onefootprint/styled';
import { CodeBlock, media } from '@onefootprint/ui';
import _ from 'lodash';
import React from 'react';

import type {
  ResponseContentProps,
  ResponseProps,
} from '../../../../articles.types';
import getSchema from '../responses/components/schema/utils/get-schemas';

const DemoCode = ({ responses }: { responses: ResponseProps }) => (
  <Container>
    {Object.keys(responses).map(code => {
      const response = responses[
        code as keyof typeof responses
      ] as ResponseContentProps;
      const regex = /#\/components\/schemas\/(.+)/;
      const keys = response.content['application/json'].schema.$ref;
      const match = keys && keys.match(regex);
      const schema = match ? match[1] : null;
      const schemaDetails = schema && getSchema(schema);
      // @ts-ignore - fix this later - type mismatch
      const schemaExample = schemaDetails?.example;

      return (
        schemaExample && (
          <CodeBlock language="JSON" key={_.uniqueId()}>
            {JSON.stringify(schemaExample, null, 2)}
          </CodeBlock>
        )
      );
    })}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    position: relative;
    margin-top: 0;
    height: 100%;
    max-width: 720px;

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[9]};
    `}
  `}
`;

export default DemoCode;
