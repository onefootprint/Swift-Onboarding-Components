import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React, { useState } from 'react';

import DevToolsDialog from '../dev-tools-dialog';

const DevToolsButton = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button aria-label="Toggle developer tools" onClick={handleOpen}>
        Dev Tools
      </Button>
      <DevToolsDialog open={open} onClose={handleClose} />
    </>
  );
};

const Button = styled.button`
  ${({ theme }) => {
    const { button } = theme.components;

    return css`
      ${createFontStyles('caption-3')};
      background: ${button.variant.primary.bg};
      border-bottom-left-radius: ${theme.borderRadius.default};
      border-bottom-right-radius: ${theme.borderRadius.default};
      border: none;
      color: ${theme.color.quinary};
      cursor: pointer;
      height: 24px;
      left: calc(${theme.spacing[7]} * -1);
      padding: ${theme.spacing[2]} ${theme.spacing[3]};
      position: fixed;
      top: 50%;
      transform: rotate(-90deg);
      z-index: ${theme.zIndex.overlay};

      @media (hover: hover) {
        &:hover {
          background-color: ${button.variant.primary.hover.bg};
          border-color: ${button.variant.primary.hover.borderColor};
          color: ${button.variant.primary.hover.color};
        }
      }

      &:active {
        background-color: ${button.variant.primary.active.bg};
        border-color: ${button.variant.primary.active.borderColor};
        color: ${button.variant.primary.active.color};
      }
    `;
  }}
`;

export default DevToolsButton;
