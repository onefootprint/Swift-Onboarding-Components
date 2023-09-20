import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';

import type { DescriptionProps } from '../../../../articles.types';

const Description = ({ description }: DescriptionProps) => (
  <Container>{description}</Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.secondary};
    padding: ${theme.spacing[3]} 0 ${theme.spacing[4]} 0;
  `}
`;

export default Description;
