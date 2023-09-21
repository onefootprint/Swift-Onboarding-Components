import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CodeInline, createFontStyles } from '@onefootprint/ui';
import React, { Fragment } from 'react';

import type { ParameterProps } from '../../../../articles.types';
import Description from './components/description';

const Parameters = ({ parameters }: { parameters: ParameterProps[] }) => {
  const { t } = useTranslation('pages.api-reference');

  const pathParameters = parameters?.filter(
    (parameter: { in: string }) => parameter.in === 'path',
  );

  const queryParameters = parameters?.filter(
    parameter => parameter.in === 'query',
  );

  const headerParameters = parameters?.filter(
    parameter => parameter.in === 'header',
  );

  const sections = [
    {
      title: 'path-parameters',
      parameters: pathParameters,
    },
    {
      title: 'query-parameters',
      parameters: queryParameters,
    },
    {
      title: 'header-parameters',
      parameters: headerParameters,
    },
  ];

  return (
    <Container>
      {sections.map(section => {
        if (section.parameters?.length > 0) {
          return (
            <ParameterGroup key={section.title}>
              <ParameterTitle>{t(section.title)}</ParameterTitle>
              {section.parameters?.map((parameter: ParameterProps) => (
                <Fragment key={parameter.name}>
                  <Title>
                    <CodeInline disable>{parameter.name}</CodeInline>
                    <Separator>·</Separator>
                    <Type>{parameter.schema.type}</Type>
                  </Title>
                  {parameter.description && (
                    <Description>{parameter.description}</Description>
                  )}
                </Fragment>
              ))}
            </ParameterGroup>
          );
        }
        return null;
      })}
    </Container>
  );
};

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    ${createFontStyles('snippet-2')}
    color: ${theme.color.secondary};
  `}
`;

const Type = styled.p`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    margin-top: ${theme.spacing[4]};
  `}
`;

const ParameterGroup = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

const ParameterTitle = styled.h3`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.primary};
    margin-bottom: ${theme.spacing[2]};
  `}
`;

const Separator = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.secondary};
    padding: 0 ${theme.spacing[2]};
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;
export default Parameters;
