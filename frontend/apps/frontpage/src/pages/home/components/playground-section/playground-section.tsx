import React from 'react';
import styled, { css } from 'styled';
import { Container, media } from 'ui';

import PlaygroundGrid from './components/playground-grid';
import PlaygroundGrigContent from './components/playground-grid-content';

type PlaygroundSectionProps = {
  title: string;
  subtitle: string;
  instructions: string;
  tooltips: string[];
};

const PlaygroundSection = ({
  title,
  subtitle,
  instructions,
  tooltips,
}: PlaygroundSectionProps) => (
  <Gradient id="playground">
    <Container>
      <Inner>
        <PlaygroundGrid tooltips={tooltips} instructions={instructions} />
        <PlaygroundGrigContent subtitle={subtitle} title={title} />
      </Inner>
    </Container>
  </Gradient>
);

const Gradient = styled.section`
  background: url('/images/grid-blur.svg') no-repeat;
  background-position: center;
  background-size: cover;

  ${({ theme }) => css`
    padding: ${theme.spacing[11]}px 0;

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[12]}px 0;
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
