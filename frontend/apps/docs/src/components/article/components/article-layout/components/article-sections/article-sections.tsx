import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText16 } from '@onefootprint/icons';
import React, { useEffect } from 'react';
import type { ArticleSection } from 'src/types/article';
import styled, { css } from 'styled-components';
import { Box, createFontStyles, media, Typography } from 'ui';

import scrollSpy from './utils/scroll-spy';

type ArticleSectionsProps = {
  sections: ArticleSection[];
};

const ArticleSections = ({ sections }: ArticleSectionsProps) => {
  const { t } = useTranslation('components.article-sections');
  useEffect(() => {
    scrollSpy();
  }, [sections]);

  return (
    <Container>
      <Header>
        <Box>
          <IcoFileText16 />
        </Box>
        <Typography variant="label-4">{t('title')}</Typography>
      </Header>
      <nav>
        <ul
          id="article-sections-list"
          className="article-sections-list"
          style={
            {
              '--index-from-selected': 0,
            } as React.CSSProperties
          }
        >
          {sections.map(({ level, anchor, label, id }, index) => (
            <li
              data-level={level}
              key={anchor}
              data-scroll-id={id}
              className={index === 0 ? 'active' : undefined}
            >
              <a href={anchor}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
};

const Container = styled.aside`
  ${({ theme }) => css`
    display: none;
    height: max-content;
    max-height: calc(100vh - ${theme.spacing[11]}px);
    position: sticky;
    top: ${theme.spacing[11]}px;
    width: 100%;

    ${media.greaterThan('lg')`
      display: block;
    `}

    ul {
      padding-left: ${theme.spacing[5]}px;

      &::before {
        background-color: ${theme.color.accent};
        content: '';
        height: 20px;
        left: ${theme.spacing[1]}px;
        position: absolute;
        transform: translateY(
          calc(
            ${theme.spacing[7] + theme.spacing[2]}px *
              var(--index-from-selected)
          )
        );
        transition: transform 0.25s;
        width: ${theme.borderWidth[2]}px;
      }
    }

    li {
      margin-bottom: ${theme.spacing[3]}px;

      a {
        display: block;
        overflow: hidden;
        text-decoration: none;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${theme.color.tertiary};

        &:hover {
          color: ${theme.color.secondary};
        }
      }

      &[data-level='1'] {
        a {
          ${createFontStyles('label-4')};
        }
      }

      &[data-level='2'] {
        padding-left: ${theme.spacing[3]}px;

        a {
          ${createFontStyles('body-4')};
        }
      }

      &[data-active='true'] {
        a {
          color: ${theme.color.primary};
        }
      }

      &.active {
        a {
          color: ${theme.color.primary};
        }
      }
    }
  `};
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]}px;
    margin-bottom: ${theme.spacing[5]}px;
  `};
`;

export default ArticleSections;
