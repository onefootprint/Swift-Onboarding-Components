import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';

import type { ParameterProps } from '@/api-reference/api-reference.types';

import Schema from '../schema';
import useParametersGroupBySections from './hooks/use-parameters-grouped-by-section';

const Parameters = ({ parameters }: { parameters: ParameterProps[] }) => {
  const { t } = useTranslation('pages.api-reference');
  const sections = useParametersGroupBySections(parameters);

  return (
    <Container>
      {sections.map(section => (
        <Parameter key={section.title}>
          <Title>{t(section.title)}</Title>
          <Schema schema={section.parameters} />
        </Parameter>
      ))}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

const Parameter = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

const Title = styled.h3`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.primary};
  `}
`;

export default Parameters;
