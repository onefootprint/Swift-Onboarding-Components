import { IcoLinkedin24, IcoTwitter24 } from '@onefootprint/icons';
import { Text, media } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

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
    <Text variant="display-3" tag="h3" marginBottom={5}>
      {title}
    </Text>
    <Text variant="body-1" marginBottom={7}>
      {description}
    </Text>

    <ItemsContainer>
      {items.map(item => (
        <Item key={item.name}>
          <AvatarContainer>
            <Image alt={item.name} height={160} src={item.avatarSrc} width={160} priority />
          </AvatarContainer>
          <Text variant="heading-3">{item.name}</Text>
          <Text variant="body-1" marginBottom={7}>
            {item.role}
          </Text>
          <SocialContainer>
            {item.twitter && (
              <Link href={item.twitter} target="_blank" rel="noreferrer">
                <IcoTwitter24 />
              </Link>
            )}
            {item.linkedin && (
              <Link href={item.linkedin} target="_blank" rel="noreferrer">
                <IcoLinkedin24 />
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
    gap: ${theme.spacing[10]};
    grid-template-columns: repeat(1, 1fr);
    margin-top: ${theme.spacing[10]};
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
    margin-bottom: ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    width: 160px;
    height: 160px;

    img {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  `}
`;

const SocialContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

export default Team;
