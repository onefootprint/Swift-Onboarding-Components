import type { Icon } from '@onefootprint/icons';
import { IcoChevronDown24 } from '@onefootprint/icons';
import React, { useId, useRef } from 'react';
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
  const summaryId = useId();
  const detailsId = useId();
  const contentRef = useRef<HTMLDivElement>(null);

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
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};

    &:hover {
      border-color: ${theme.borderColor.tertiary};
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
    gap: ${theme.spacing[3]};
    justify-content: space-between;
    padding: ${theme.spacing[6]} ${theme.spacing[5]};
    width: 100%;
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
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
  overflow: hidden;
`;

const ContentInner = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]} ${theme.spacing[6]} ${theme.spacing[5]};
  `}
`;

export default Accordion;
