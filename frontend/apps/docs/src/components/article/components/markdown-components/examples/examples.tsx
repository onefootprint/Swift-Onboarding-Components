import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import { media, Tab, Tabs, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { defaultOption, options } from './examples.constants';

const Examples = () => {
  const [tab, setTab] = useState(defaultOption);
  const [animatedList] = useAutoAnimate<HTMLDivElement>();
  return (
    <>
      <Tabs variant="underlined">
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
        {tab.links.map(({ name, img, href }) => (
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
                src={img.src}
                width={img.width}
              />
            </ImageContainer>
            <Typography
              color="secondary"
              variant="body-3"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </Typography>
          </Item>
        ))}
      </List>
    </>
  );
};

const List = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
    margin: ${theme.spacing[8]} 0;
    width: 100%;

    ${media.greaterThan('md')`
      grid-template-columns: repeat(3, 1fr);
    `}
  `};
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

    &:hover {
      background: ${theme.backgroundColor.secondary};

      ${IconOpen} {
        opacity: 1;
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
