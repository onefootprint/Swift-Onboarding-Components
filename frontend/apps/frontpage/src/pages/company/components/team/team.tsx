import IcoLinkedin24 from 'icons/ico/ico-linkedin-24';
import IcoTwitter24 from 'icons/ico/ico-twitter-24';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { media, Typography } from 'ui';

type TeamProps = {
  title: string;
  description: string;
  items: {
    avatarSrc: string;
    linkedin?: string;
    name: string;
    role: string;
    twitter?: string;
  }[];
};

const Team = ({ title, description, items }: TeamProps) => (
  <>
    <Typography variant="display-3" as="h3" sx={{ marginBottom: 5 }}>
      {title}
    </Typography>
    <Typography variant="body-1" sx={{ marginBottom: 10 }}>
      {description}
    </Typography>
    <ItemsContainer>
      {items.map(item => (
        <Item key={item.name}>
          <AvatarContainer>
            <Image
              alt={item.name}
              height={160}
              layout="fixed"
              src={item.avatarSrc}
              width={160}
              priority
            />
          </AvatarContainer>

          <Typography variant="heading-3">{item.name}</Typography>
          <Typography variant="body-1" sx={{ marginBottom: 7 }}>
            {item.role}
          </Typography>
          <SocialContainer>
            {item.twitter && (
              <Link href={item.twitter}>
                <a href={item.twitter} target="_blank" rel="noreferrer">
                  <IcoTwitter24 />
                </a>
              </Link>
            )}
            {item.linkedin && (
              <Link href={item.linkedin}>
                <a href={item.linkedin} target="_blank" rel="noreferrer">
                  <IcoLinkedin24 />
                </a>
              </Link>
            )}
          </SocialContainer>
        </Item>
      ))}
    </ItemsContainer>
  </>
);

const ItemsContainer = styled.ul`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: ${theme.spacing[10]}px;
    text-align: center;

    ${media.greaterThan('md')`
      grid-template-columns: repeat(2, 1fr);
    `}

    ${media.greaterThan('lg')`
      text-align: unset;
      grid-template-columns: repeat(3, 1fr);
    `}
  `}
`;

const Item = styled.li`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const AvatarContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]}px;
  `}
`;

const SocialContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]}px;
  `}
`;

export default Team;
