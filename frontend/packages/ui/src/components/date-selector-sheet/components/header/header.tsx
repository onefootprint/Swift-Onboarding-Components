import { IcoChevronLeft24, IcoChevronRight24 } from '@onefootprint/icons';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

import IconButton from '../../../icon-button';
import Stack from '../../../stack';
import Text from '../../../text';
import { DirectionChange, type HeaderProps } from '../../date-selector-sheet.types';
import { getMoveVariants } from '../../date-selector-sheet.utils';

const Header = ({ handleMonthChange, firstDayCurrentMonth, movingDirection, setMovingDirection }: HeaderProps) => {
  const handleDirectionChange = (newDirection: DirectionChange) => {
    handleMonthChange(newDirection);
    setMovingDirection(newDirection);
  };

  return (
    <Container justify="space-between" align="center">
      <IconButton aria-label="Previous month" onClick={() => handleDirectionChange(DirectionChange.previous)}>
        <IcoChevronLeft24 />
      </IconButton>
      <TextContainer
        key={format(firstDayCurrentMonth, 'MMMM yyyy')}
        initial={movingDirection ? 'initial' : false}
        animate={movingDirection ? 'animate' : false}
        exit="exit"
        variants={movingDirection ? getMoveVariants(movingDirection) : {}}
        transition={{ duration: 0.5 }}
      >
        <Text variant="label-2">{format(firstDayCurrentMonth, 'MMMM yyyy')}</Text>
      </TextContainer>
      <IconButton aria-label="Next month" onClick={() => handleDirectionChange(DirectionChange.next)}>
        <IcoChevronRight24 />
      </IconButton>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[4]};
    height: 52px;
  `}
`;

const TextContainer = styled(motion.div)`
  user-select: none;
  pointer-events: none;
`;
export default Header;
