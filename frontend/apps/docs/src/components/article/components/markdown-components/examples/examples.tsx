import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import { Grid, media, Tab, Tabs, Text } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { defaultOption, options } from './examples.constants';

const Examples = () => {
  const [tab, setTab] = useState(defaultOption);
  const [animatedList] = useAutoAnimate<HTMLDivElement>();
  const { theme } = useTheme();

  return (
    <>
      <Tabs>
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
      <List
        gap={5}
        columns={['repeat(2,1fr)']}
        marginTop={8}
        marginBottom={8}
        width="100%"
        ref={animatedList}
      >
        {tab.links.map(({ name, img, href }) => {
          const parts = img.src.split('/');
          const filename = parts.pop();
          const themedPath = `${parts.join('/')}/${theme}/${filename}`;
          return (
            <Item
              href={href}
              key={name}
              rel="noreferrer noopener"
              target="_blank"
            >
              <IconOpen color="accent" />
              <ImageContainer>
                <Image
                  alt={name}
                  height={img.height}
                  src={themedPath}
                  width={img.width}
                />
              </ImageContainer>
              <Text
                color="secondary"
                variant="body-3"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {name}
              </Text>
            </Item>
          );
        })}
      </List>
    </>
  );
};

const List = styled(Grid.Container)`
  ${media.greaterThan('md')`
      grid-template-columns: repeat(3, 1fr);
    `}
`;

const Item = styled(Link)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    color: ${theme.color.primary};
    display: block;
    height: 116px;
    padding: ${theme.spacing[7]};
    position: relative;
    text-align: left;
    text-decoration: none;
    transition: all 0.1s ease-in;

    @media (hover: hover) {
      &:hover {
        background: ${theme.backgroundColor.secondary};

        ${IconOpen} {
          opacity: 1;
        }
      }
    }
  `};
`;

const IconOpen = styled(IcoArrowUpRight16)`
  ${({ theme }) => css`
    opacity: 0;
    position: absolute;
    right: ${theme.spacing[5]};
    top: ${theme.spacing[5]};
  `};
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[4]};
  `};
`;

export default Examples;
