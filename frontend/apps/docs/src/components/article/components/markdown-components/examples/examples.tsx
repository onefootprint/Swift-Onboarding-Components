import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Tab, Tabs } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { defaultOption, options } from './examples.constants';

const Examples = () => {
  const [tab, setTab] = useState(defaultOption);
  const [animatedList] = useAutoAnimate<HTMLDivElement>();
  return (
    <ExamplesContainer>
      <Tabs variant="pill">
        {Object.values(options).map(option => (
          <Tab
            key={option.name}
            onClick={() => setTab(option)}
            selected={tab.name === option.name}
          >
            {option.name}
          </Tab>
        ))}
      </Tabs>
      <List ref={animatedList}>
        {tab.links.map(({ name, href }) => (
          <Item
            href={href}
            key={name}
            rel="noreferrer noopener"
            target="_blank"
          >
            {name}
          </Item>
        ))}
      </List>
    </ExamplesContainer>
  );
};

const ExamplesContainer = styled.div``;

const List = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-gap: ${theme.spacing[8]};
    grid-template-columns: repeat(3, 1fr);
    margin: ${theme.spacing[8]} 0;
    width: 100%;
  `};
`;

const Item = styled(Link)`
  ${({ theme }) => css`
    align-items: center;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    color: ${theme.color.primary};
    display: flex;
    gap: ${theme.spacing[4]};
    height: 114px;
    padding: ${theme.spacing[8]};
    text-decoration: none;
    text-align: center;
    justify-content: center;

    &:hover {
      border-color: ${theme.color.accent};
    }
  `};
`;

export default Examples;
