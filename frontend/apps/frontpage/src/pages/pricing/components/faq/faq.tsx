import { Typography } from '@onefootprint/ui';
import React from 'react';
import Accordion from 'src/components/accordion';
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
    <Accordion.List>
      {items.map(item => (
        <Accordion.Item
          content={Array.isArray(item.content) ? item.content : [item.content]}
          key={item.id}
          title={item.title}
        />
      ))}
    </Accordion.List>
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

export default Faq;
