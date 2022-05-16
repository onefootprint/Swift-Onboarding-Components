import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Typography } from 'ui';

import type { Highlight } from '../../highlight-section.types';

type HighlightItemProps = Highlight;

const HighlightItem = ({
  content,
  imgAlt,
  imgSrc,
  title,
}: HighlightItemProps) => (
  <Container>
    <ImageContainer>
      <Image
        alt={imgAlt}
        height={160}
        layout="responsive"
        src={imgSrc}
        width={336}
      />
    </ImageContainer>
    <Content>
      <Typography
        as="div"
        color="primary"
        sx={{ marginBottom: 5 }}
        variant="heading-3"
      >
        {title}
      </Typography>
      <Typography color="secondary" variant="body-1" as="p">
        {content}
      </Typography>
    </Content>
  </Container>
);

const Container = styled.article`
  ${({ theme }) => css`
    z-index: 5;
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    backdrop-filter: blur(1px);
    background: rgba(255, 255, 255, 0.6);
  `}
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]}px;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]}px;
  `}
`;

export default HighlightItem;
