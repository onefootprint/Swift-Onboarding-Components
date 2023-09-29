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

  return schema ? (
    <Box>
      <Title>{t('request-body')}</Title>
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

export default RequestBody;
