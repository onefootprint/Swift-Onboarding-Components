import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

type AuthorProps = {
  authorImg: string;
  authorName: string;
};

const Author = ({ authorImg, authorName }: AuthorProps) => (
  <Container>
    {authorImg && (
      <AuthorImg>
        <Image
          alt={`Image of ${authorImg}`}
          src={authorImg}
          height={32}
          width={32}
        />
      </AuthorImg>
    )}
    <Typography variant="label-3">{authorName}</Typography>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
  `}
`;

const AuthorImg = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    overflow: hidden;
    width: 32px;
    height: 32px;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  `}
`;

export default Author;
