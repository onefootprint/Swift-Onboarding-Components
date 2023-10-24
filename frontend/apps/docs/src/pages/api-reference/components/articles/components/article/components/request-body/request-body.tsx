import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, createFontStyles } from '@onefootprint/ui';
import React from 'react';

import type { Content } from '@/api-reference/api-reference.types';
import { getSchemaFromComponent } from '@/api-reference/utils/get-schemas';

import Schema from '../schema';

type RequestBodyProps = {
  requestBody: Content;
};

const RequestBody = ({ requestBody }: RequestBodyProps) => {
  const { t } = useTranslation('pages.api-reference');
  const schema = getSchemaFromComponent(requestBody);
  const isOptional = !requestBody?.required;

  return schema ? (
    <Box>
      <Header>
        <Title>{t('request-body')}</Title>
        {isOptional && (
          <>
            <Separator>·</Separator>
            <Optional>{t('optional')}</Optional>
          </>
        )}
      </Header>
      <Schema schema={schema} isInBrackets />
    </Box>
  ) : null;
};

const Title = styled.h3`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    margin-bottom: ${theme.spacing[2]};
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]};
  `};
`;

const Separator = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    padding: 0 ${theme.spacing[2]};
  `}
`;

const Optional = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('caption-4')}
    color: ${theme.color.quaternary};
  `}
`;

export default RequestBody;
