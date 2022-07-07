import type { Icon } from 'icons';
import IcoChevronDown24 from 'icons/ico/ico-chevron-down-24';
import { darken } from 'polished';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';

import Typography from '../typography';
import useContentVisibility from './hooks/use-content-visibility';

export type AccordionProps = {
  children: React.ReactNode;
  iconComponent: Icon;
  onChange?: (event: React.MouseEvent<HTMLElement>, newOpen: boolean) => void;
  open?: boolean;
  testID?: string;
  title: string;
};

const ANIMATION_DURATION = 240;

const Accordion = ({
  children,
  iconComponent: Icon,
  onChange,
  open = false,
  testID,
  title,
}: AccordionProps) => {
  // TODO: Migrate to use-id once we migrate to react 18
  const summaryId = `accordion-summary-${title.replace(/\s/g, '-')}`;
  const detailsId = `accordion-details-${title.replace(/\s/g, '-')}`;
  const contentRef = useRef<HTMLDivElement>(null);
  const shouldShow = useContentVisibility({
    animationDuration: ANIMATION_DURATION,
    contentRef,
    open,
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onChange?.(event, !open);
  };

  return (
    <Details data-testid={testID}>
      <Summary
        aria-controls={detailsId}
        aria-expanded={open}
        id={summaryId}
        onClick={handleClick}
      >
        <Title>
          <Icon color="primary" />
          <Typography variant="body-2" color="primary">
            {title}
          </Typography>
        </Title>
        <IconIndicator color="primary" inverted={open} />
      </Summary>
      {shouldShow && (
        <Content
          aria-labelledby={summaryId}
          id={detailsId}
          open={open}
          ref={contentRef}
          role="region"
        >
          <ContentInner>{children}</ContentInner>
        </Content>
      )}
    </Details>
  );
};

const Details = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[2]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};

    &:hover {
      border-color: ${darken(0.32, theme.borderColor.primary)};
    }
  `}
`;

const Summary = styled.button`
  ${({ theme }) => css`
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    gap: ${theme.spacing[3]}px;
    justify-content: space-between;
    padding: ${theme.spacing[6]}px ${theme.spacing[5]}px;
    width: 100%;
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]}px;
  `}
`;

const IconIndicator = styled(IcoChevronDown24)<{ inverted: boolean }>`
  transition: transform 0.2s ease-in-out;

  ${({ inverted }) =>
    inverted &&
    css`
      transform: rotate(180deg);
    `}
`;

const Content = styled.div<{ open: boolean }>`
  max-height: 0;
  overflow: hidden;
  transition: max-height ${ANIMATION_DURATION}ms ease-in-out;
`;

const ContentInner = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]}px ${theme.spacing[6]}px ${theme.spacing[5]}px;
  `}
`;

export default Accordion;
