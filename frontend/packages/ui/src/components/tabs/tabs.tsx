import * as RadixTabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import React, { useId, useState } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils';
import Box from '../box';

const { Tabs: TabsRoot, TabsList, TabsTrigger } = RadixTabs;

export type TabOption = {
  label: string;
  value: string;
};

export type TabsProps = {
  onChange: (value: string) => void;
  options: TabOption[];
  disabled?: boolean;
};

const Tabs = ({ onChange, options, disabled }: TabsProps) => {
  const firstOptionValue = options[0].value;
  const [activeTab, setActiveTab] = useState(firstOptionValue);
  const id = useId();
  const handleChange = (value: string) => {
    setActiveTab(value);
    onChange(value);
  };
  return (
    <TabsRoot onValueChange={handleChange} defaultValue={firstOptionValue}>
      <Container data-is-disabled={disabled}>
        {options.map(({ label, value }) => (
          <TabContainer
            key={value}
            position="relative"
            marginBottom={2}
            layoutRoot
            layout
          >
            <Tab key={value} value={value}>
              {label}
            </Tab>
            {value === activeTab && (
              <ActiveMarker
                initial={false}
                layoutId={id}
                transition={{
                  duration: 0.15,
                }}
              />
            )}
          </TabContainer>
        ))}
      </Container>
    </TabsRoot>
  );
};

const Container = styled(motion(TabsList))`
  ${({ theme }) => css`
    display: flex;
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    &[data-is-disabled='true'] {
      opacity: 0.5;
      pointer-events: none;
      user-select: none;
    }
  `}
`;

const TabContainer = styled(motion(Box))``;

const Tab = styled(TabsTrigger)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    background: unset;
    border: unset;
    cursor: pointer;
    text-decoration: none;
    border-bottom: ${theme.borderWidth[2]} solid transparent;
    color: ${theme.color.tertiary};
    margin: 0;
    height: fit-content;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    transition: color 0.1s ease-in-out;

    &:not([data-state='active']):hover {
      color: ${theme.color.primary};

      &::after {
        content: '';
        position: absolute;
        border-radius: ${theme.borderRadius.default};
        height: calc(100% - ${theme.spacing[1]} * 2);
        width: 100%;
        background: ${theme.color.primary};
        top: ${theme.spacing[1]};
        left: ${theme.spacing[1]};
        background: ${theme.backgroundColor.secondary};
        z-index: -1;
      }
    }

    &[data-state='active'] {
      color: ${theme.color.accent};
    }
  `}
`;

const ActiveMarker = styled(motion.div)`
  ${({ theme }) => css`
    height: 100%;
    width: 100%;
    background: ${theme.color.accent};
    position: absolute;
    bottom: -${theme.spacing[2]};
    left: 0;
    right: 0;
    height: 2px;
  `}
`;

export default Tabs;
