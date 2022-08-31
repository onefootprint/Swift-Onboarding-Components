import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { Box, media, Typography } from 'ui';

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
    <Link href={href} passHref>
      <Anchor>
        <FeatureImageDesktopContainer>
          <FeatureImage
            alt={featureImageAlt}
            height={228}
            layout="responsive"
            objectFit="cover"
            src={featureImageUrl}
            width={468}
          />
        </FeatureImageDesktopContainer>
        <FeatureImageMobileContainer>
          <FeatureImage
            height={228}
            layout="responsive"
            objectFit="cover"
            src={featureImageUrl}
            width={358}
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
                layout="fixed"
                src={author.avatarImgUrl}
                width={16}
              />
              <Typography color="tertiary" variant="body-4">
                {author.name} | <time>{createdAt}</time>
              </Typography>
            </Footer>
          </Box>
        </Content>
      </Anchor>
    </Link>
  </Container>
);

const Container = styled.article``;

const Anchor = styled.a`
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
`;

const FeatureImage = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px;
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

export default LibraryPostPreview;
