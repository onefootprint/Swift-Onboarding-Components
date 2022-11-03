import { Typography } from '@onefootprint/ui';
import Image from 'next/legacy/image';
import React from 'react';
import styled, { css } from 'styled-components';

type CompetitorAnalysisProps = {
  anchor: string;
  coverImgUrl?: string;
  title: string;
  content: string[];
};

const CompetitorAnalysis = ({
  anchor,
  title,
  content,
  coverImgUrl,
}: CompetitorAnalysisProps) => (
  <Container>
    {coverImgUrl && (
      <ImageContainer>
        <Image
          alt={title}
          height={380}
          priority
          src={coverImgUrl}
          width={800}
        />
      </ImageContainer>
    )}
    <Typography
      color="primary"
      id={anchor}
      sx={{ marginBottom: 8 }}
      variant="display-3"
      as="h3"
    >
      {title}
    </Typography>
    <ContentContainer>
      {content.map(text => (
        <Typography as="p" color="secondary" key={text} variant="body-1">
          {text}
        </Typography>
      ))}
    </ContentContainer>
  </Container>
);

const Container = styled.article`
  max-width: 800px;
  margin: 0 auto;
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;
    margin-bottom: ${theme.spacing[10]};
  `}
`;

const ContentContainer = styled.div`
  ${({ theme }) => css`
    p:not(:last-child) {
      margin-bottom: ${theme.spacing[9]};
    }
  `}
`;

export default CompetitorAnalysis;
