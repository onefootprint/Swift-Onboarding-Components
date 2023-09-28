import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, media, Typography } from '@onefootprint/ui';
import React from 'react';
import { Element } from 'react-scroll';

import type {
  ArticleProps,
  SecurityTypes,
} from '@/api-reference/api-reference.types';

import DemoCode from './components/demo-code';
import Description from './components/description';
import Parameters from './components/parameters';
import Path from './components/path';
import RequestBody from './components/request-body';
import Responses from './components/responses';
import Security from './components/security';

const Article = ({
  id,
  parameters,
  description,
  method,
  path,
  security,
  responses,
  requestBody,
}: ArticleProps) => {
  const { t } = useTranslation('pages.api-reference');
  const encodedId = encodeURIComponent(id);

  return (
    <ArticleContainer id={encodedId} name={encodedId}>
      <ContentColumn>
        <Container>
          {method && path && <Path type={method} url={path} />}
          {description && <Description>{description}</Description>}
        </Container>
        {security && (
          <Requests>
            <Typography variant="label-1" sx={{ marginTop: 3 }}>
              {t('request')}
            </Typography>
            {security?.map((element: SecurityTypes) =>
              Object.keys(element).map(type => (
                <Security key={type} type={type as SecurityTypes} />
              )),
            )}
            <Box sx={{ marginY: 2 }} />
            <Schema>
              {parameters && <Parameters parameters={parameters} />}
              {requestBody && <RequestBody requestBody={requestBody} />}
              {responses && <Responses responses={responses} />}
            </Schema>
          </Requests>
        )}
      </ContentColumn>
      <CodeColumn>
        {responses && (
          <DemoCode requestBody={requestBody} responses={responses} />
        )}
      </CodeColumn>
    </ArticleContainer>
  );
};

const ArticleContainer = styled(Element)<{ name: string }>`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    grid-area: content;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;

    ${media.greaterThan('md')`
      display: grid;
      grid-template-columns: minmax(600px, 1.5fr) 1fr;
      grid-template-areas: 'article code';
    `}
  `}
`;

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const ContentColumn = styled.div`
  ${({ theme }) => css`
    grid-area: article;
    padding: ${theme.spacing[8]} ${theme.spacing[5]} ${theme.spacing[8]}
      ${theme.spacing[8]};
  `}
`;

const Requests = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

const Schema = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const CodeColumn = styled.div`
  ${({ theme }) => css`
    grid-area: code;
    padding: ${theme.spacing[4]} ${theme.spacing[6]} ${theme.spacing[10]};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[4]} ${theme.spacing[6]};
    `}
  `}
`;

export default Article;
