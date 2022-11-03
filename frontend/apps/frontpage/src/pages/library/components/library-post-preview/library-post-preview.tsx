import { Box, media, Typography } from '@onefootprint/ui';
import Image from 'next/legacy/image';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

export type LibraryPostPreviewProps = {
  author: { avatarImgUrl: string; name: string };
  createdAt: string;
  excerpt: string;
  featureImageAlt: string;
  featureImageUrl: string;
  href: string;
  title: string;
};

const LibraryPostPreview = ({
  author,
  createdAt,
  excerpt,
  featureImageAlt,
  featureImageUrl,
  href,
  title,
}: LibraryPostPreviewProps) => (
  <Container>
    <StyledLink href={href}>
      <FeatureImageDesktopContainer>
        <FeatureImage
          alt={featureImageAlt}
          height={228}
          src={featureImageUrl}
          width={468}
          layout="responsive"
        />
      </FeatureImageDesktopContainer>
      <FeatureImageMobileContainer>
        <FeatureImage
          alt={featureImageAlt}
          height={228}
          src={featureImageUrl}
          width={358}
          layout="responsive"
        />
      </FeatureImageMobileContainer>
      <Content>
        <Header>
          <Typography color="primary" variant="heading-2">
            {title}
          </Typography>
        </Header>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'space-between',
          }}
        >
          <Body>
            <Typography color="secondary" variant="body-2">
              {excerpt}
            </Typography>
          </Body>
          <Footer>
            <Avatar
              alt={author.name}
              height={16}
              src={author.avatarImgUrl}
              width={16}
            />
            <Typography color="tertiary" variant="body-4">
              {author.name} | <time>{createdAt}</time>
            </Typography>
          </Footer>
        </Box>
      </Content>
    </StyledLink>
  </Container>
);

const Container = styled.article``;

const StyledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
`;

const FeatureImage = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    object-fit: cover;
  `}
`;

const FeatureImageDesktopContainer = styled.div`
  display: none;

  ${media.greaterThan('md')`
    display: block;
  `}
`;

const FeatureImageMobileContainer = styled.div`
  ${media.greaterThan('md')`
    display: none;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: ${theme.spacing[7]} 0;
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[6]};
    min-height: ${theme.spacing[1]};
  `}
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
  `}
`;

const Avatar = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
  `}
`;

export default LibraryPostPreview;
