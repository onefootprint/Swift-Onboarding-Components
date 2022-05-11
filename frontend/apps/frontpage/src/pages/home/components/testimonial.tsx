import Image, { StaticImageData } from 'next/image';
import React from 'react';
import { Button, Container, Typography } from 'ui';

type HeroProps = {
  authorImage: StaticImageData;
  authorName: string;
  authorRole: string;
  contentText: string;
};

const Hero = ({
  authorImage,
  authorName,
  authorRole,
  contentText,
}: HeroProps) => (
  <Container>
    <Typography variant="display-1" color="primary" as="h1">
      {authorName}
    </Typography>
    <Typography variant="display-4" color="secondary" as="h2">
      {authorRole}
    </Typography>
    <Button>{contentText}</Button>
    <Image src={authorImage} alt={`${authorName} picture`} />
  </Container>
);

export default Hero;
