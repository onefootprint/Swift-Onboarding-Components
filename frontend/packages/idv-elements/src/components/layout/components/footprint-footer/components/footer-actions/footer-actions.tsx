import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  createOverlayBackground,
  Dropdown,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

type FooterActionsProps = {
  onWhatsThisClick?: () => void;
};

const FooterActions = ({ onWhatsThisClick }: FooterActionsProps) => (
  <Dropdown.Root>
    <DropdownTrigger>
      <IcoDotsHorizontal24 />
    </DropdownTrigger>
    <DropdownContent align="end">
      <Dropdown.Item onClick={onWhatsThisClick}>
        <Typography variant="caption-1" color="secondary" as="span">
          What&apos;s this?
        </Typography>
      </Dropdown.Item>
      <Anchor
        href={`${FRONTPAGE_BASE_URL}/privacy-policy`}
        target="_blank"
        rel="noreferrer"
      >
        <Dropdown.Item onClick={event => event.stopPropagation()}>
          <Typography variant="caption-1" color="secondary" as="span">
            Privacy
          </Typography>
        </Dropdown.Item>
      </Anchor>
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
