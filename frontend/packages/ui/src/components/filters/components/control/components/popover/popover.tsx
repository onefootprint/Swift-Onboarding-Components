import FocusTrap from 'focus-trap-react';
import type React from 'react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useLockedBody } from 'usehooks-ts';

import { useEventListener, useOnClickOutside } from '../../../../../../hooks';
import Button from '../../../../../button';
import ScrollArea from '../../../../../scroll-area';
import Text from '../../../../../text';

export type PopoverProps = {
  children: React.ReactNode;
  id: string;
  onClose: () => void;
  title: string;
};

const Popover = ({ children, id, onClose, title }: PopoverProps) => {
  const { t } = useTranslation('ui');
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
          <Text variant="label-3">{title}</Text>
        </Header>
        <Body id={bodyId}>
          <ScrollArea>{children}</ScrollArea>
        </Body>
        <Footer>
          <Button onClick={onClose} variant="secondary">
            {t('components.filters.popover.cancel')}
          </Button>
          <Button form="filter-form" type="submit" variant="primary">
            {t('components.filters.popover.apply')}
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
    height: 40px;
    justify-content: center;
    position: relative;
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[6]};
    max-height: 50vh;
  `}
  overflow: auto;
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
