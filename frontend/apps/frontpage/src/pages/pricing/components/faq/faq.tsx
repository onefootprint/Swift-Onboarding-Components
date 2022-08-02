import React from 'react';
import FaqItem from 'src/components/faq-item';
import styled, { css } from 'styled-components';
import { media, Typography } from 'ui';

type FaqProps = {
  title: string;
  items: {
    content: string;
    id: string;
    title: string;
  }[];
};

const Faq = ({ title, items }: FaqProps) => (
  <>
    <TitleContainer>
      <Typography variant="display-3" as="h4">
        {title}
      </Typography>
    </TitleContainer>
    <QuestionsContainer>
      {items.map(item => (
        <FaqItem
          content={Array.isArray(item.content) ? item.content : [item.content]}
          key={item.id}
          title={item.title}
        />
      ))}
    </QuestionsContainer>
  </>
);

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]}px;
    text-align: center;

    ${media.greaterThan('md')`
      margin-bottom: ${theme.spacing[8]}px;
    `}
  `}
`;

const QuestionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
    margin-bottom: ${theme.spacing[10]}px;
  `}
`;

export default Faq;
