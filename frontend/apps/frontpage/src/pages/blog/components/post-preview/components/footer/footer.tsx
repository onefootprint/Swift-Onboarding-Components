import { Grid, createFontStyles, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type FooterProps = {
  authors: { id: string; avatarImgUrl: string; name: string }[];
  publishedAt: string;
};

const Footer = ({ authors, publishedAt }: FooterProps) => {
  const verticalStack = authors.length > 1;
  return (
    <Container verticalStack={verticalStack}>
      <AvatarGroup count={authors.length}>
        {authors.map(author => (
          <Avatar key={author.id} alt={author.name} height={20} src={author.avatarImgUrl} width={20} />
        ))}
      </AvatarGroup>
      <AuthorsName verticalStack={verticalStack}>{authors.map(author => author.name).join(' & ')}</AuthorsName>
      {!verticalStack && <Separator>·</Separator>}
      <DateComponent>{publishedAt}</DateComponent>
    </Container>
  );
};

const Container = styled(Grid.Container)<{ verticalStack: boolean }>`
  ${({ theme, verticalStack }) => css`
    grid-template-columns: repeat(4, max-content);
    gap: ${theme.spacing[2]};
    grid-template-rows: 1fr;
    grid-template-areas: 'avatars name separator date';

    ${
      verticalStack &&
      css`
      grid-template-columns: max-content 1fr;
      grid-template-rows: repeat(3, max-content);
      align-items: flex-start;
      grid-template-areas: 'avatars name' 'avatars date';
      column-gap: ${theme.spacing[3]};
      row-gap: ${theme.spacing[1]};

      ${media.greaterThan('sm')`
        grid-template-columns: max-content max-content max-content;
        gap: ${theme.spacing[3]};
        grid-template-rows: 1fr;
        grid-template-areas: 'avatars name date';
      `}
    `
    }
  `}
`;

const Separator = styled.span`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    ${createFontStyles('body-4')};
    color: ${theme.color.tertiary};
    grid-area: separator;
  `}
`;

const AvatarGroup = styled.div<{ count: number }>`
  ${({ theme, count }) => css`
    width: ${count === 2 ? theme.spacing[8] : theme.spacing[5]};
    position: relative;
    grid-area: avatars;
  `}
`;

const Avatar = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[2]} solid ${theme.backgroundColor.secondary};

    &:nth-child(2) {
      position: absolute;
      left: ${theme.spacing[4]};
    }
  `}
`;

const AuthorsName = styled.div<{ verticalStack: boolean }>`
  ${({ theme, verticalStack }) => css`
    ${createFontStyles('body-4')};
    color: ${theme.color.tertiary};
    grid-area: name;
    margin-left: ${verticalStack ? 0 : theme.spacing[2]};
  `}
`;

const DateComponent = styled.time`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};
    color: ${theme.color.tertiary};
    grid-area: date;
  `}
`;

export default Footer;
