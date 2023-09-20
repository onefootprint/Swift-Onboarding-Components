import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CodeInline, createFontStyles } from '@onefootprint/ui';
import React from 'react';

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

  return (
    <Container>
      {pathParameters?.length > 0 && (
        <ParameterGroup>
          <ParameterTitle>{t('path-parameters')}</ParameterTitle>
          {pathParameters?.map((parameter: ParameterProps) => (
            <ParameterLabel key={parameter.name}>
              {parameter.name}
            </ParameterLabel>
          ))}
        </ParameterGroup>
      )}
      {queryParameters?.length > 0 && (
        <ParameterGroup>
          <>
            <ParameterTitle>{t('query-parameters')}</ParameterTitle>
            {queryParameters?.map((parameter: ParameterProps) => (
              <ParameterLabel key={parameter.name}>
                {parameter.name}
              </ParameterLabel>
            ))}
          </>
        </ParameterGroup>
      )}
      {headerParameters?.length > 0 && (
        <ParameterGroup>
          <ParameterTitle>{t('header-parameters')}</ParameterTitle>
          {headerParameters?.map((parameter: ParameterProps) => (
            <HeaderParametersContainer key={parameter.name}>
              <Title>
                <CodeInline disable>{parameter.name}</CodeInline>
                <Type>{parameter.schema.type}</Type>
              </Title>
              <Description>{parameter.description}</Description>
            </HeaderParametersContainer>
          ))}
        </ParameterGroup>
      )}
    </Container>
  );
};

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    ${createFontStyles('snippet-2')}
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

const ParameterLabel = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.secondary};
  `}
`;

const HeaderParametersContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[3]};
  `}
`;

export default Parameters;
