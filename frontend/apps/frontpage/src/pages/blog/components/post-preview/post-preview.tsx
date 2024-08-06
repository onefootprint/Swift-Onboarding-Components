import { Stack, Text, media } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import styled, { css } from 'styled-components';

import Footer from './components/footer';

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
        <Image alt={featureImageAlt} height={228} src={featureImageUrl} width={468} priority />
      </FeatureImageDesktopContainer>
      <FeatureImageMobileContainer data-type={type}>
        <Image height={228} width={358} alt={featureImageAlt} src={featureImageUrl} />
      </FeatureImageMobileContainer>
      <Content>
        <Header>
          <Text color="accent" variant="label-4" marginBottom={2}>
            {primaryTag}
          </Text>
          <Text color="primary" variant="heading-2">
            {title}
          </Text>
        </Header>
        <Stack direction="column" justify="space-between" flexGrow={1}>
          <Body>
            <Text color="secondary" variant="body-2">
              {excerpt}
            </Text>
          </Body>
        </Stack>
        <Footer authors={authors} publishedAt={publishedAt} />
      </Content>
    </StyledLink>
  </Container>
);

const Container = styled.article``;

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[0]};
    display: flex;
    flex-direction: column;
    height: 100%;
    text-decoration: none;
    transition: border-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out;

    @media (hover: hover) {
      &:hover {
        box-shadow: ${theme.elevation[1]};
        border-color: ${theme.borderColor.primary};
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

export default PostPreview;
