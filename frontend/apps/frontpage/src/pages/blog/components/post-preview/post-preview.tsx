import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';
import { media, Typography } from 'ui';

export type PostPreviewProps = {
  author: { avatarImgUrl: string; name: string };
  createdAt: string;
  excerpt: string;
  featureImageAlt: string;
  featureImageUrl: string;
  href: string;
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
  primaryTag,
  title,
}: PostPreviewProps) => (
  <Container>
    <Anchor href={href}>
      <FeatureImageDesktopContainer>
        <FeatureImage
          alt={featureImageAlt}
          height={300}
          layout="responsive"
          objectFit="cover"
          src={featureImageUrl}
          width={960}
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
          <Typography color="accent" variant="label-4" sx={{ marginBottom: 2 }}>
            {primaryTag}
          </Typography>
          <Typography color="primary" variant="heading-2">
            {title}
          </Typography>
        </Header>
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
      </Content>
    </Anchor>
  </Container>
);

const Container = styled.article``;

const Anchor = styled.a`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[1]};
    display: block;
    text-decoration: none;
  `}
`;
const FeatureImage = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0 0;
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
