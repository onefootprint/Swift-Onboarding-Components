import { Fragment } from 'react';
import styled from 'styled-components';

import { AnimatePresence, motion } from 'framer-motion';
import Item from './components/item/item';
import SubItem from './components/sub-item/sub-item';
import type { StepperOption, StepperProps, StepperStatus } from './stepper.types';

const Stepper = ({ 'aria-label': ariaLabel, onChange, options, value: selected }: StepperProps) => {
  const { option: selectedOption, subOption: selectedSubOption } = selected;
  const valueIndex = options.findIndex(option => option.value === selectedOption.value);
  const subValueIndex = selectedOption.options?.findIndex(option => option.value === selectedSubOption?.value);

  const handleClick = (option: StepperOption) => () => {
    onChange?.(option);
  };
  const getStatus = (index: number): StepperStatus => {
    if (valueIndex > index) {
      return 'completed';
    }
    if (valueIndex < index) {
      return 'next';
    }
    return 'selected';
  };

  const getSubStatus = (subIndex: number): StepperStatus => {
    if (subValueIndex === undefined) return 'selected';

    if (subValueIndex > subIndex) {
      return 'completed';
    }
    if (subValueIndex < subIndex) {
      return 'next';
    }
    return 'selected';
  };

  return (
    <Nav aria-label={ariaLabel}>
      <ul>
        {options.map((option, index) => {
          const status = getStatus(index);
          const isSelected = selectedOption.value === option.value;
          const isLastItem = index === options.length - 1;
          const position = index + 1;
          const subOptions = option.options || [];
          const showSubOptions = isSelected && subOptions.length > 0;
          const hasSubOptions = showSubOptions && subOptions.length > 0;

          return (
            <Fragment key={option.value}>
              <Item
                status={status}
                onClick={handleClick(option)}
                position={position}
                isLastItem={isLastItem}
                hasSubOptions={hasSubOptions}
              >
                {option.label}
              </Item>
              <AnimatePresence>
                {showSubOptions && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {subOptions.map((suboption, subIndex) => {
                      const subStatus = getSubStatus(subIndex);
                      const isLastOption = isLastItem && subIndex === subOptions.length - 1;
                      return (
                        <SubItem
                          onClick={handleClick(suboption)}
                          status={subStatus}
                          key={suboption.value}
                          isLastOption={isLastOption}
                        >
                          {suboption.label}
                        </SubItem>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </Fragment>
          );
        })}
      </ul>
    </Nav>
  );
};

const Nav = styled.nav`
  ul {
    display: flex;
    flex-direction: column;
  }
`;

export default Stepper;
