import type { Icon } from 'icons';
import IcoChevronDown24 from 'icons/ico/ico-chevron-down-24';
import React from 'react';
import styled, { css } from 'styled-components';

import Typography from '../typography';

export type AccordionProps = {
  children: React.ReactNode;
  iconComponent: Icon;
  onChange?: (event: React.MouseEvent<HTMLElement>, newOpen: boolean) => void;
  open?: boolean;
  testID?: string;
  title: string;
};

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
      {open && (
        <Content role="region" id={detailsId} aria-labelledby={summaryId}>
          {children}
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
  `}
`;

const Summary = styled.div`
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

const Content = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]}px ${theme.spacing[6]}px ${theme.spacing[5]}px;
  `}
`;

export default Accordion;
