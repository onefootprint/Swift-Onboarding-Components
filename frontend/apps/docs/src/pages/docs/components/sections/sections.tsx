import { IcoFileText16 } from '@onefootprint/icons';
import { Box, Stack, createFontStyles, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ArticleSection } from 'src/types/article';
import styled, { css } from 'styled-components';

type SectionsProps = {
  sections: ArticleSection[];
};

const Sections = ({ sections }: SectionsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.article-sections',
  });
  const [activeSectionID, setActiveSectionID] = useState(sections[0].id);

  const scrollToArticle = (id: string) => () => {
    const sectionTo = sections.find(section => section.id === id);
    if (sectionTo) {
      const element = document.getElementById(sectionTo.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleScroll = () => {
    const anchoredSections = Array.from(document.querySelectorAll('a[href^="#"]')).filter(el => el.id) as HTMLElement[];
    const firstSectionInView = anchoredSections.find(el => {
      const rect = el.getBoundingClientRect();
      return rect.top >= 52 && rect.bottom <= window.innerHeight;
    });
    if (firstSectionInView) {
      setActiveSectionID(firstSectionInView.id);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <Container>
      <Header>
        <Box>
          <IcoFileText16 />
        </Box>
        {t('title')}
      </Header>
      <nav>
        <LinksContainer tag="ul" direction="column" layoutRoot>
          {sections.map(({ level, anchor, label, id }) => (
            <LinkContainer key={id}>
              <StyledLink $active={activeSectionID === id} $level={level} href={anchor} onClick={scrollToArticle(id)}>
                {label}
              </StyledLink>
              {activeSectionID === id && <ActiveMarker id="marker" />}
            </LinkContainer>
          ))}
        </LinksContainer>
      </nav>
    </Container>
  );
};

const LinksContainer = styled(motion(Stack))`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const LinkContainer = styled(motion(Stack))`
  position: relative;
`;

const ActiveMarker = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.color.accent};
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 50%;
  `};
`;

const StyledLink = styled.a<{ $level: number; $active: boolean }>`
  ${({ theme, $level, $active }) => css`
    all: unset;
    position: relative;
    display: inline-block;
    text-decoration: none;
    color: ${theme.color.tertiary};
    margin-left: calc(${$level} * ${theme.spacing[4]});
    padding: ${theme.spacing[1]} 0;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    && {
      ${createFontStyles('body-3')}
    }

    ${
      $active &&
      css`
      color: ${theme.color.primary};
    `
    }
  `};
`;

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
      padding-right: ${theme.spacing[8]};
    `}
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
