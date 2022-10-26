import { Box, media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

export type PostPreviewProps = {
  author: { avatarImgUrl: string; name: string };
  createdAt: string;
  excerpt: string;
  featureImageAlt: string;
  featureImageUrl: string;
  href: string;
  isFeatured?: boolean;
  primaryTag: string;
  title: string;
};

const PostPreview = ({
  author,
  createdAt,
  excerpt,
  featureImageAlt,
  featureImageUrl,
  href,
  isFeatured,
  primaryTag,
  title,
}: PostPreviewProps) => (
  <Container>
    <StyledLink href={href}>
      <FeatureImageDesktopContainer>
        <FeatureImage
          alt={featureImageAlt}
          height={isFeatured ? 460 : 228}
          src={featureImageUrl}
          width={isFeatured ? 960 : 468}
        />
      </FeatureImageDesktopContainer>
      <FeatureImageMobileContainer>
        <FeatureImage
          alt={featureImageAlt}
          height={228}
          src={featureImageUrl}
          width={358}
        />
      </FeatureImageMobileContainer>
      <Content>
        <Header>
          <Typography color="accent" variant="label-4" sx={{ marginBottom: 2 }}>
            {primaryTag}
          </Typography>
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
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[1]};
    display: flex;
    flex-direction: column;
    height: 100%;
    text-decoration: none;
  `}
`;
const FeatureImage = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0 0;
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
    padding: ${theme.spacing[7]}px;
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[3]}px;
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[6]}px;
    min-height: ${theme.spacing[1]}px;
  `}
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]}px;
  `}
`;

const Avatar = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[4]}px;
  `}
`;

export default PostPreview;
