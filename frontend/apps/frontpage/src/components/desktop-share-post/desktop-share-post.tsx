import { IcoFacebook24, IcoLinkedin24, IcoTwitter24 } from '@onefootprint/icons';
import { media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type DesktopSharePostProps = {
  title: string;
  url: string;
};

const DesktopSharePost = ({ title, url }: DesktopSharePostProps) => (
  <Container>
    <Link
      aria-label="Share on Twitter"
      href={`https://twitter.com/intent/tweet?text=${title}&url=${url}`}
      onClick={event => {
        event.preventDefault();
        window.open(
          `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
          'share-twitter',
          'width=550,height=280',
        );
      }}
    >
      <IcoTwitter24 color="tertiary" />
    </Link>
    <Link
      aria-label="Share on LinkedIn"
      href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
      onClick={event => {
        event.preventDefault();
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
          'share-linkedin',
          'width=550,height=550',
        );
      }}
    >
      <IcoLinkedin24 color="tertiary" />
    </Link>
    <Link
      aria-label="Share on Facebook"
      href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
      onClick={event => {
        event.preventDefault();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, 'share-facebook', 'width=555,height=745');
      }}
    >
      <IcoFacebook24 color="tertiary" />
    </Link>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: flex;
      gap: ${theme.spacing[4]};
    `}
  `}
`;

const Link = styled.a`
  background: none;
  border: none;
`;

export default DesktopSharePost;
