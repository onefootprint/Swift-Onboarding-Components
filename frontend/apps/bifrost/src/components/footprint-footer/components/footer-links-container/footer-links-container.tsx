import React from 'react';
import styled, { css } from 'styled';
import { LinkButton, Typography } from 'ui';

export interface FooterLink {
  label: string;
  link: string;
}

export interface FooterLinksContainerProps {
  links: FooterLink[];
}

const FooterLinksContainer = ({ links }: FooterLinksContainerProps) => {
  const content: JSX.Element[] = [];

  links.forEach((l: FooterLink, i: number) => {
    content.push(
      <li>
        <LinkButton size="tiny" href={l.link}>
          {l.label}
        </LinkButton>
      </li>,
    );
    if (i < links.length - 1) {
      content.push(
        <Typography
          key={`${l.label}-divider`}
          variant="label-4"
          color="secondary"
        >
          &#183;
        </Typography>,
      );
    }
  });

  return <LinksContainer>{content}</LinksContainer>;
};

const LinksContainer = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ theme }) => css`
    margin-top: ${theme.spacing[3]}px;

    > :not(:last-child) {
      margin-right: ${theme.spacing[2]}px;
    }

    a {
      text-decoration: none;
      span {
        color: ${theme.color.secondary};
      }
    }
  `}
`;

export default FooterLinksContainer;
