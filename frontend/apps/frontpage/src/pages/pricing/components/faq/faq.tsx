import { media, Typography } from '@onefootprint/ui';
import React from 'react';
import FaqItem from 'src/components/faq-item';
import styled, { css } from 'styled-components';

type FaqProps = {
  title: string;
  items: {
    content: string;
    id: string;
    title: string;
  }[];
};

const Faq = ({ title, items }: FaqProps) => (
  <FaqContainer>
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
  </FaqContainer>
);

const FaqContainer = styled.div`
  ${({ theme }) => css`
    margin: ${theme.spacing[11]} auto;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
  `}
`;

const TitleContainer = styled.div`
  text-align: center;
`;

const QuestionsContainer = styled.div`
  ${({ theme }) => css`
    margin: auto;
    display: grid;
    gap: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[10]};

    ${media.greaterThan('sm')`
      width: 720px;
    `}
  `}
`;

export default Faq;
