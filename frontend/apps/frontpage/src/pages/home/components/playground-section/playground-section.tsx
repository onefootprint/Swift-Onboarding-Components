import { useTranslation } from '@onefootprint/hooks';
import { Container, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import PlaygroundGrid from './components/playground-grid';
import PlaygroundGrigContent from './components/playground-grid-content';

const PlaygroundSection = () => {
  const { t } = useTranslation('pages.home.playground');
  return (
    <Gradient id="playground">
      <Container sx={{ overflow: 'hidden' }}>
        <Inner>
          <PlaygroundGrid
            tooltips={t('tooltips') as unknown as string[]}
            instructions={t('instructions')}
          />
          <PlaygroundGrigContent subtitle={t('subtitle')} title={t('title')} />
        </Inner>
      </Container>
    </Gradient>
  );
};

const Gradient = styled.section`
  background: url('/images/grid-blur.svg') no-repeat;
  background-position: center;
  background-size: cover;

  ${({ theme }) => css`
    padding: ${theme.spacing[15]} 0;

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[15]} 0;
    `}
  `}

  ${media.greaterThan('lg')`
    background-position: top center;
    background-size: unset;
  `}
`;

const Inner = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  position: relative;
`;

export default PlaygroundSection;
