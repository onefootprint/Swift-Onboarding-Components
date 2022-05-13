import React from 'react';
import styled, { css } from 'styled';
import { Container, media } from 'ui';

import PlaygroundGradient from './components/playground-gradient';
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
  <Container as="section" id="playground">
    <Inner>
      <PlaygroundGradient />
      <PlaygroundGrid tooltips={tooltips} instructions={instructions} />
      <PlaygroundGrigContent subtitle={subtitle} title={title} />
    </Inner>
  </Container>
);

const Inner = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;
    padding: ${theme.spacing[11]}px 0;
    position: relative;

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[12]}px 0;
    `}
  `}
`;

export default PlaygroundSection;
