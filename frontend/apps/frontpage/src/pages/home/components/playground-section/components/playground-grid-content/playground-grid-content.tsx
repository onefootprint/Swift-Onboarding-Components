import IcoShield24 from 'icons/ico/ico-shield-24';
import React from 'react';
import CircleIcon from 'src/components/circle-icon';
import styled from 'styled';
import { media, Typography } from 'ui';

type PlaygroundGridContentProps = {
  title: string;
  subtitle: string;
};

const PlaygroundGridContent = ({
  title,
  subtitle,
}: PlaygroundGridContentProps) => (
  <Container>
    <Typography
      as="div"
      sx={{ marginBottom: 3, display: 'flex' }}
      variant="heading-3"
    >
      <CircleIcon
        backgroundColor="tertiary"
        color="quinary"
        Icon={IcoShield24}
        size="28px"
      />
      {subtitle}
    </Typography>
    <Typography variant="display-1" as="h3">
      {title}
    </Typography>
  </Container>
);

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  position: absolute;
  text-align: center;
  max-width: 90%;

  ${media.greaterThan('md')`
    max-width: unset;
  `}
`;

export default PlaygroundGridContent;
