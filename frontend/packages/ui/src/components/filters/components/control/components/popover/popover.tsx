import FocusTrap from 'focus-trap-react';
import React, { useId, useRef } from 'react';
import styled, { css } from 'styled-components';
import {
  useEventListener,
  useLockedBody,
  useOnClickOutside,
} from 'usehooks-ts';

import Button from '../../../../../button';
import Typography from '../../../../../typography';

export type PopoverProps = {
  children: React.ReactNode;
  id: string;
  onClose: () => void;
  title: string;
};

const Popover = ({ children, id, onClose, title }: PopoverProps) => {
  const headerId = useId();
  const bodyId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside<HTMLDivElement>(containerRef, onClose);
  useLockedBody();
  useEventListener('keydown', event => {
    if (event.key === 'Escape') {
      onClose();
    }
  });

  return (
    <FocusTrap>
      <PopoverContainer
        aria-describedby={bodyId}
        aria-label={title}
        aria-labelledby={headerId}
        id={id}
        ref={containerRef}
        role="dialog"
      >
        <Header id={headerId}>
          <Typography variant="label-3">{title}</Typography>
        </Header>
        <Body id={bodyId}>{children}</Body>
        <Footer>
          <Button onClick={onClose} size="small" variant="secondary">
            Cancel
          </Button>
          <Button
            form="filter-form"
            size="small"
            type="submit"
            variant="primary"
          >
            Apply
          </Button>
        </Footer>
      </PopoverContainer>
    </FocusTrap>
  );
};

const PopoverContainer = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[3]};
    width: 300px;
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    height: 36px;
    justify-content: center;
    position: relative;
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[6]};
  `}
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[4]};
    justify-content: flex-end;
    padding: ${theme.spacing[4]};
  `}
`;

export default Popover;
