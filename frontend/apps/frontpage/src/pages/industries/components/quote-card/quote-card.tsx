import { Box, media, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import AuthorImage from './components/author-image';
import QuoteFooter from './components/quote-footer';
import QuoteIcon from './components/quote-icon';

type QuoteCardProps = {
  quote: string;
  author: string;
  role: string;
  company: string;
  caseStudyLink?: string;
  authorImage: string;
};

const QuoteCard = ({
  quote,
  author,
  role,
  company,
  caseStudyLink,
  authorImage,
}: QuoteCardProps) => (
  <CardContainer>
    <AuthorImage src={authorImage} alt={`${author} image`} />
    <QuoteContainer>
      <Box position="relative">
        <QuoteIconContainer>
          <QuoteIcon variant="open" />
        </QuoteIconContainer>
        <Text variant="body-2">{`${quote}"`}</Text>
      </Box>
      <QuoteFooter
        author={author}
        role={role}
        company={company}
        caseStudyLink={caseStudyLink}
      />
    </QuoteContainer>
  </CardContainer>
);

const CardContainer = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[9]};
    width: fit-content;
    gap: ${theme.spacing[9]};
    background-color: ${theme.backgroundColor.primary};

    ${media.greaterThan('md')`
      flex-direction: row;
      justify-content: space-between;
      gap: 80px;
    `}
  `}
`;

const QuoteContainer = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    position: relative;
    max-width: 600px;
  `}
`;

const QuoteIconContainer = styled(Box)`
  ${({ theme }) => css`
    position: absolute;
    transform: translateX(-100%) scale(0.8);
    top: 0;
    left: ${theme.spacing[3]};

    ${media.greaterThan('md')`
      top: 0;
      left: -${theme.spacing[3]};
    `}
  `}
`;

export default QuoteCard;
