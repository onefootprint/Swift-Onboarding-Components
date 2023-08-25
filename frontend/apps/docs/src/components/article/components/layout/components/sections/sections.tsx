import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, createFontStyles, media, Typography } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import type { ArticleSection } from 'src/types/article';

import scrollSpy from './utils/scroll-spy';

type SectionsProps = {
  sections: ArticleSection[];
};

const Sections = ({ sections }: SectionsProps) => {
  const [activeSection, setActiveSection] = useState(
    sections.length ? sections[0].id : null,
  );
  const ref = useRef<HTMLLIElement>(null);
  const { t } = useTranslation('components.article-sections');

  useEffect(() => {
    scrollSpy();
    setActiveSection(sections.length ? sections[0].id : null);
  }, [sections]);

  useEffect(() => {
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const handleScroll = () => {
    const elementActiveClass = document.querySelector('.active');
    const elementID = elementActiveClass
      ?.getAttribute('data-scroll-id')
      ?.valueOf();
    if (elementID && elementID !== activeSection) {
      setActiveSection(elementID);
    }
  };

  return (
    <Container>
      <Header>
        <Box>
          <IcoFileText16 />
        </Box>
        <Typography variant="label-4">{t('title')}</Typography>
      </Header>
      <nav>
        <ul id="article-sections-list" className="article-sections-list">
          {sections.map(({ level, anchor, label, id }, index) => (
            <li
              data-level={level}
              key={anchor}
              data-scroll-id={id}
              className={index === 0 ? 'active' : undefined}
              ref={ref}
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
    max-height: calc(100vh - ${theme.spacing[11]});
    position: sticky;
    top: ${theme.spacing[11]};
    width: 100%;

    ${media.greaterThan('lg')`
      display: block;
    `}

    ul {
      padding-left: ${theme.spacing[5]};
      position: relative;
    }

    li {
      margin-bottom: ${theme.spacing[3]};
      position: relative;

      a {
        display: block;
        overflow: hidden;
        text-decoration: none;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${theme.color.tertiary};

        @media (hover: hover) {
          &:hover {
            color: ${theme.color.secondary};
          }
        }
      }

      &[data-level='1'] {
        a {
          ${createFontStyles('label-4')};
        }
      }

      &[data-level='2'] {
        padding-left: ${theme.spacing[2]};

        a {
          ${createFontStyles('body-4')};
        }
      }

      &[data-level='3'] {
        padding-left: ${theme.spacing[6]};
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

          &::before {
            content: '';
            position: absolute;
            width: 3px;
            height: 60%;
            left: calc(-1 * ${theme.spacing[5]});
            top: 50%;
            transform: translateY(-50%);
            background-color: ${theme.color.accent};
            border-radius: ${theme.borderRadius.full};
          }
        }
      }
    }
  `};
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[5]};
  `};
`;

export default Sections;
