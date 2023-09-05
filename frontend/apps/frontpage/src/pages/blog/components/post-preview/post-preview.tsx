import styled, { css } from '@onefootprint/styled';
import { Box, createFontStyles, media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export type PostPreviewProps = {
  authors: { id: string; avatarImgUrl: string; name: string }[];
  publishedAt: string;
  excerpt: string;
  featureImageAlt: string;
  featureImageUrl: string;
  href: string;
  primaryTag: string;
  title: string;
  type: 'featured' | 'regular';
};

const PostPreview = ({
  authors,
  publishedAt,
  excerpt,
  featureImageAlt,
  featureImageUrl,
  href,
  primaryTag,
  title,
  type,
}: PostPreviewProps) => (
  <Container>
    <StyledLink href={href}>
      <FeatureImageDesktopContainer data-type={type}>
        <Image
          alt={featureImageAlt}
          height={228}
          src={featureImageUrl}
          width={468}
        />
      </FeatureImageDesktopContainer>
      <FeatureImageMobileContainer data-type={type}>
        <Image
          height={228}
          width={358}
          alt={featureImageAlt}
          src={featureImageUrl}
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
            <AvatarGroup count={authors.length}>
              {authors.map(author => (
                <Avatar
                  key={author.id}
                  alt={author.name}
                  height={20}
                  src={author.avatarImgUrl}
                  width={20}
                />
              ))}
            </AvatarGroup>
            <AuthorsName>
              {authors.map(author => author.name).join(' & ')}
            </AuthorsName>
            <Typography color="tertiary" variant="body-4">
              | <time>{publishedAt}</time>
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
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[1]};
    display: flex;
    flex-direction: column;
    height: 100%;
    text-decoration: none;
    transition: background-color 0.4s ease-in-out;

    @media (hover: hover) {
      &:hover {
        box-shadow: ${theme.elevation[0]};
        background-color: ${theme.backgroundColor.secondary};
      }
    }
  `}
`;

const FeatureImageDesktopContainer = styled.div`
  ${({ theme }) => css`
    display: none;
    overflow: hidden;
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;
    img {
      object-fit: cover;
      object-position: center;
      width: 100%;
      height: 100%;
    }

    &[data-type='featured'] {
      max-height: 540px;
    }

    &[data-type='regular'] {
      max-height: 228px;
    }

    ${media.greaterThan('md')`
    display: block;
  `}
  `}
`;

const FeatureImageMobileContainer = styled.div`
  ${({ theme }) => css`
    overflow: hidden;
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;
    img {
      object-fit: cover;
      object-position: center;
      width: 100%;
      height: 100%;
    }

    ${media.greaterThan('md')`
      display: none;
    `}

    &[data-type='featured'] {
      max-height: 228px;
    }

    &[data-type='regular'] {
      max-height: 228px;
    }
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: ${theme.spacing[7]};
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

const AvatarGroup = styled.div<{ count: number }>`
  ${({ theme, count }) => css`
    width: ${count === 2 ? theme.spacing[8] : theme.spacing[5]};
    position: relative;
  `}
`;

const Avatar = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[2]} solid ${theme.backgroundColor.secondary};

    &:nth-child(2) {
      position: absolute;
      left: ${theme.spacing[4]};
    }
  `}
`;

const AuthorsName = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};
    color: ${theme.color.tertiary};
  `}
`;

export default PostPreview;
