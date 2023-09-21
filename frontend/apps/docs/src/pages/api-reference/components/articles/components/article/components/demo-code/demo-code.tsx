import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CodeBlock, media } from '@onefootprint/ui';
import _ from 'lodash';
import React, { Fragment } from 'react';

import type {
  RequestProps,
  ResponseContentProps,
  ResponseProps,
} from '../../../../articles.types';
import getSchema from '../responses/components/schema/utils/get-schemas';

type DemoCodeProps = {
  responses: ResponseProps;
  requests?: RequestProps;
};

const buildRequestExample = (properties: any) => {
  const example: Record<string, any> = {};
  Object.keys(properties).forEach(key => {
    if (key === 'fields') {
      const { items } = properties[key];
      const fieldElement = items.enum[0];
      example[key] = [fieldElement];
    }
    if (key === 'filters' && properties[key].items.properties) {
      const filtersObject: Record<string, any> = {};
      const filters = properties[key].items.properties;
      Object.keys(filters).forEach(filterKey => {
        const filterObject: Record<string, any> = {};
        const processedFilters: Record<string, any> = {};
        if (filters[filterKey].properties) {
          const nestedProperties = filters[filterKey].properties;
          Object.keys(nestedProperties).forEach((nestedKey: string) => {
            processedFilters[nestedKey] = nestedProperties[nestedKey].type;
          });
        }
        filterObject[filterKey] = processedFilters;
        filtersObject[filterKey] = filterObject;
        example[key] = filtersObject;
      });
    }
  });
  return example;
};

const DemoCode = ({ responses, requests }: DemoCodeProps) => {
  const { t } = useTranslation('pages.api-reference');
  return (
    <Container>
      {Object.keys(responses).map(code => {
        const response = responses[
          code as keyof typeof responses
        ] as ResponseContentProps;
        const regex = /#\/components\/schemas\/(.+)/;
        const responseKeys = response.content['application/json'].schema.$ref;
        const match = responseKeys && responseKeys.match(regex);
        const responseSchema = match ? match[1] : null;
        const responseSchemaDetails =
          responseSchema && getSchema(responseSchema);
        // @ts-ignore - fix this later - type mismatch
        const responseSchemaExample = responseSchemaDetails?.example;
        const requestKeys = requests?.content['application/json'].schema.$ref;
        const matchRequest = requestKeys && requestKeys.match(regex);
        const requestSchema = matchRequest ? matchRequest[1] : null;
        const requestSchemaDetails = requestSchema && getSchema(requestSchema);
        // @ts-ignore - fix this later - type mismatch
        const requestSchemaExample = requestSchemaDetails?.example;
        // @ts-ignore - fix this later - type mismatch
        const requestSchemaProperties = requestSchemaDetails?.properties;
        const requestSchemaPropertiesExample =
          requestSchemaProperties &&
          buildRequestExample(requestSchemaProperties);

        return (
          <Fragment key={_.uniqueId()}>
            {requestSchemaExample && (
              <Request language={t('request-example')}>
                {JSON.stringify(requestSchemaExample, null, 2)}
              </Request>
            )}
            {requestSchemaPropertiesExample &&
              Object.keys(requestSchemaPropertiesExample).length > 0 && (
                <Request language={t('request-example')}>
                  {JSON.stringify(requestSchemaPropertiesExample, null, 2)}
                </Request>
              )}
            {responseSchemaExample && (
              <Response language={t('response-example')}>
                {JSON.stringify(responseSchemaExample, null, 2)}
              </Response>
            )}
          </Fragment>
        );
      })}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    position: relative;
    margin-top: 0;
    height: 100%;
    max-width: 720px;

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[9]};
    `}
  `}
`;

const Response = styled(CodeBlock)``;

const Request = styled(CodeBlock)``;

export default DemoCode;
