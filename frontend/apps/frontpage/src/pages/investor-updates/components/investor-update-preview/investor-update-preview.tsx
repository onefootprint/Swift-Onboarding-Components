import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import { LinkButton, Text, media } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type InvestorUpdatePreviewProps = {
  index: number;
  excerpt: string;
  href: string;
  title: string;
  publishedAt: string;
  image?: string;
};

const InvestorUpdatePreview = ({ index, publishedAt, excerpt, href, title, image }: InvestorUpdatePreviewProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.investor-updates',
  });

  return (
    <Link href={href} passHref legacyBehavior>
      <Article>
        {image && (
          <ImageContainer>
            <Image src={image} alt={title} height={400} width={400} />
          </ImageContainer>
        )}
        <Content>
          <Header>
            <Text variant="label-2" marginBottom={6} marginRight={2}>
              {t('header-title-prefix', { index })}
            </Text>
            <Text variant="body-2" color="tertiary">
              | {publishedAt}
            </Text>
          </Header>
          <ArticleDetails>
            <Text variant="heading-1" marginBottom={6}>
              {title}
            </Text>
            <Text variant="body-2">{excerpt}</Text>
            <LinkButton $marginTop={7} iconComponent={IcoArrowRightSmall16} iconPosition="right" href={href}>
              {t('read-more')}
            </LinkButton>
          </ArticleDetails>
        </Content>
      </Article>
    </Link>
  );
};

const Article = styled.article`
  ${({ theme }) => css`
  display: block;
  cursor: pointer;
  transition: background-color 0.1s ease-in-out;
  border-radius: ${theme.borderRadius.default};
  border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: ${theme.elevation[1]};

  ${media.greaterThan('md')`
    display: flex;
    flex-direction: row;
    box-shadow: ${theme.elevation[0]};
    gap: ${theme.spacing[8]};
    padding: ${theme.spacing[8]};
    border: none;
  `}

  @media (hover: hover) {
    &:hover {
      box-shadow: ${theme.elevation[0]};
    }
  }

  @media (hover: hover) {
    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
  }
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: ${theme.spacing[8]};

    a {
      text-decoration: none;
    }

    ${media.greaterThan('md')`
      padding: 0;
    `}
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: row;
    margin-right: ${theme.spacing[7]};
  `}
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    flex-shrink: 0;
    height: 180px;
    width: 100%;

    img {
      object-fit: cover;
      object-position: center;
      width: 100%;
      height: 100%;
    }

    ${media.greaterThan('md')`
      height: 240px;
      width: 240px;
    `}
  `}
`;

const ArticleDetails = styled.div`
  display: flex;
  flex-direction: column;

  ${media.greaterThan('md')`
    max-width: 80%;
  `}
`;

export default InvestorUpdatePreview;
