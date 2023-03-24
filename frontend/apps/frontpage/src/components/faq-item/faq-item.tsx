import { IcoChevronDown24 } from '@onefootprint/icons';
import { createFontStyles, Typography } from '@onefootprint/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type FaqItemProps = {
  title: string;
  content: string[];
};

const FaqItem = ({ title, content }: FaqItemProps) => (
  <Accordion.Root type="multiple">
    <Container value={title}>
      <StyledHeader>
        <StyledTrigger>
          <Typography variant="label-1">{title}</Typography>
          <IconContainer className="icon">
            <IcoChevronDown24 />
          </IconContainer>
        </StyledTrigger>
      </StyledHeader>
      <Content>
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.span>
      </Content>
    </Container>
  </Accordion.Root>
);

const Container = styled(Accordion.Item)`
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

    &:hover {
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
      box-shadow: ${theme.elevation[1]};
    }
  `}
`;

const StyledHeader = styled(Accordion.Header)`
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

const StyledTrigger = styled(Accordion.Trigger)`
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

    &:hover {
      border-color: ${theme.borderColor.primary};
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

const Content = styled(Accordion.Content)`
  ${({ theme }) => css`
    ${createFontStyles('body-2')};
    color: ${theme.color.secondary};
    white-space: pre-line;
    padding: 0 ${theme.spacing[7]} ${theme.spacing[7]} ${theme.spacing[7]};
  `}
`;

export default FaqItem;
