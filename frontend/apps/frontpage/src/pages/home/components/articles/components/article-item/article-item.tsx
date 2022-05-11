import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Typography } from 'ui';

import type { Article } from '../../articles.types';

type ArticleItemProps = Article;

const ArticleItem = ({
  titleText,
  imageAltText,
  imagePath,
  descriptionText,
}: ArticleItemProps) => (
  <Container>
    <ImageContainer>
      <Image
        alt={imageAltText}
        height={160}
        layout="responsive"
        src={imagePath}
        width={336}
      />
    </ImageContainer>
    <Content>
      <Typography
        color="primary"
        variant="heading-2"
        as="div"
        sx={{ marginBottom: 5 }}
      >
        {titleText}
      </Typography>
      <Typography color="secondary" variant="body-1" as="p">
        {descriptionText}
      </Typography>
    </Content>
  </Container>
);

const Container = styled.article`
  ${({ theme }) => css`
    backdrop-filter: blur(60px);
    background: rgba(255, 255, 255, 0.6);
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
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

export default ArticleItem;
