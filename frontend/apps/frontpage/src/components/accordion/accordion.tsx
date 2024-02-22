import { IcoChevronDown24 } from '@onefootprint/icons';
import { createFontStyles, media, Typography } from '@onefootprint/ui';
import * as AccordionRadix from '@radix-ui/react-accordion';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css, keyframes } from 'styled-components';

type AccordionItemProps = {
  title: string;
  content: string[] | string;
};

type AccordionTitleProps = {
  children: string;
};

type AccordionListProps = {
  children: React.ReactNode;
};

type AccrodionContentProps = {
  children: string[] | string;
};

const Accordion = ({ children }: AccordionListProps) => (
  <ListContainer type="multiple">{children}</ListContainer>
);

const AccordionItem = ({ title, content }: AccordionItemProps) => (
  <AccordionContainer value={title}>
    <AccordionItem.Title>{title}</AccordionItem.Title>
    <AccordionItem.Content>{content}</AccordionItem.Content>
  </AccordionContainer>
);

const AccordionTitle = ({ children }: AccordionTitleProps) => (
  <TitleContainer>
    <StyledTrigger>
      <Typography variant="label-1">{children}</Typography>
      <IconContainer className="icon">
        <IcoChevronDown24 />
      </IconContainer>
    </StyledTrigger>
  </TitleContainer>
);

const AccordionContent = ({ children }: AccrodionContentProps) => (
  <Content>
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.span>
  </Content>
);

AccordionItem.Title = AccordionTitle;
AccordionItem.Content = AccordionContent;
Accordion.Item = AccordionItem;
Accordion.List = Accordion;

const slideDown = keyframes`
  0% {
    height: 0;
  }
  100% {
    height: var(--radix-accordion-content-height);
  }
`;

const slideUp = keyframes`
  0% {
    height: var(--radix-accordion-content-height);
  }
  100% {
    height: 0;
  }
`;

const AccordionContainer = styled(AccordionRadix.Item)`
  ${({ theme }) => css`
    ${createFontStyles('body-2')};
    color: ${theme.color.secondary};
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    overflow: hidden;
    transition: all 0.2s ease-out;

    @media (hover: hover) {
      &:hover {
        border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
        box-shadow: ${theme.elevation[1]};
      }
    }
  `}
`;

const TitleContainer = styled(AccordionRadix.Header)`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('label-1')};
    color: ${theme.color.primary};
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const StyledTrigger = styled(AccordionRadix.Trigger)`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[6]} ${theme.spacing[7]};

    .icon {
      transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
    }

    @media (hover: hover) {
      &:hover {
        border-color: ${theme.borderColor.primary};
      }
    }

    &[data-state='open'] {
      .icon {
        transform: rotate(180deg);
      }
    }
  `}
`;

const IconContainer = styled.span`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[2]};

    $[data-state='open'] {
      transform: rotate(180deg);
    }
  `}
`;

const Content = styled(AccordionRadix.Content)`
  ${({ theme }) => css`
    ${createFontStyles('body-2')};
    color: ${theme.color.secondary};
    white-space: pre-line;
    padding: 0 ${theme.spacing[7]} ${theme.spacing[7]} ${theme.spacing[7]};

    &[data-state='open'] {
      animation-name: ${slideDown};
      animation-duration: 0.2s;
      animation-timing-function: ease-out;
    }

    &[data-state='closed'] {
      animation-name: ${slideUp};
      animation-duration: 0.1s;
      animation-timing-function: ease-in;
    }
  `}
`;

const ListContainer = styled(AccordionRadix.Root)`
  ${({ theme }) => css`
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[10]};

    ${media.greaterThan('sm')`
      width: 720px;
    `}
  `}
`;

export default Accordion;
