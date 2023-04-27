import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import {
  createOverlayBackground,
  Dropdown,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type Link = { label: string; href: string };

type FooterActionsProps = {
  links: Link[];
};

const FooterActions = ({ links }: FooterActionsProps) => (
  <Dropdown.Root>
    <DropdownTrigger>
      <IcoDotsHorizontal24 />
    </DropdownTrigger>
    <DropdownContent align="end">
      {links.map(({ href, label }) => (
        <Anchor href={href} key={label} target="_blank" rel="noreferrer">
          <Dropdown.Item onClick={event => event.stopPropagation()}>
            <Typography variant="caption-1" color="secondary" as="span">
              {label}
            </Typography>
          </Dropdown.Item>
        </Anchor>
      ))}
    </DropdownContent>
  </Dropdown.Root>
);

const DropdownTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};

    &[data-state='open'] {
      ${createOverlayBackground('darken-1', 'senary')};
    }
  `}
`;

const Anchor = styled.a`
  text-decoration: none;
`;

const DropdownContent = styled(Dropdown.Content)`
  min-width: fit-content;
`;

export default FooterActions;
