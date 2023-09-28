import styled, { css } from '@onefootprint/styled';
import { Badge, createFontStyles } from '@onefootprint/ui';
import React from 'react';

import type { PathProps } from '@/api-reference/api-reference.types';

const API_BASE_URL = 'api.onefootprint.com';

const Path = ({ type, url }: PathProps) => {
  const assignVariant = () => {
    switch (type) {
      case 'post':
        return 'neutral';
      case 'get':
        return 'success';
      case 'delete':
        return 'error';
      case 'patch':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <Container>
      <StyledBadge variant={assignVariant()}>{type}</StyledBadge>
      <PathContainer>
        <BaseUrl>{API_BASE_URL}</BaseUrl>
        <span>{url}</span>
      </PathContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

const StyledBadge = styled(Badge)`
  ${({ theme }) => css`
    && {
      border-radius: ${theme.borderRadius.default};
      text-transform: uppercase;
    }
  `}
`;

const BaseUrl = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.tertiary};
  `}
`;

const PathContainer = styled.span`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[1]};
  `}
`;

export default Path;
