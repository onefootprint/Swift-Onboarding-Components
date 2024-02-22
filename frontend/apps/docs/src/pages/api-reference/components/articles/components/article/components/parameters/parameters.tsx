import { createFontStyles } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { ParameterProps } from '@/api-reference/api-reference.types';

import Schema from '../schema';
import useParametersGroupBySections from './hooks/use-parameters-grouped-by-section';

const Parameters = ({ parameters }: { parameters: ParameterProps[] }) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const sections = useParametersGroupBySections(parameters);

  return (
    <Container>
      {sections.map(section => (
        <Parameter key={section.title}>
          <Title>{t(section.title as ParseKeys<'common'>)}</Title>
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
