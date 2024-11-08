'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { useId, useState } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils';
import Box from '../box';

const { Tabs: TabsRoot, TabsList, TabsTrigger } = RadixTabs;

export type TabOption<T extends string = string> = {
  label: string;
  value: T;
};

export type TabsProps<T extends string = string> = {
  onChange: (value: T) => void;
  options: TabOption<T>[];
  disabled?: boolean;
  defaultValue?: T;
};

const Tabs = <T extends string = string>({ onChange, options, disabled, defaultValue }: TabsProps<T>) => {
  const firstOptionValue = defaultValue ?? options[0].value;
  const [activeTab, setActiveTab] = useState<T>(firstOptionValue);
  const id = useId();
  const handleChange = (value: string) => {
    setActiveTab(value as T);
    onChange(value as T);
  };
  return (
    <TabsRoot onValueChange={handleChange} defaultValue={firstOptionValue}>
      <Container data-is-disabled={disabled}>
        {options.map(({ label, value }) => (
          <TabContainer key={value} position="relative" marginBottom={2} layoutRoot layout>
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
    gap: ${theme.spacing[5]};
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
    padding: ${theme.spacing[2]} 0;
    transition: color 0.1s ease-in-out;

    &:not([data-state='active']):hover {
      color: ${theme.color.primary};
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
