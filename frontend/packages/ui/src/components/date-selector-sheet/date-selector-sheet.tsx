import * as Popover from '@radix-ui/react-popover';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  parse,
  startOfToday,
  startOfWeek,
} from 'date-fns';
import { motion } from 'framer-motion';
import React, { forwardRef, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import DayButton from './components/day-button';
import Header from './components/header';
import WeekHeader from './components/week-header';
import type { DateSelectorSheetProps } from './date-selector-sheet.types';
import { DirectionChange } from './date-selector-sheet.types';
import {
  containerVariants,
  getMoveVariants,
} from './date-selector-sheet.utils';

const today = startOfToday();

const DateSelectorSheet = forwardRef<HTMLDivElement, DateSelectorSheetProps>(
  (
    {
      startDate,
      endDate,
      ariaLabel = 'Select date range',
      open,
      asChild,
      children,
      onOpenChange,
      onClickOutside,
      onChange,
    },
    ref,
  ) => {
    const [movingDirection, setMovingDirection] = useState<
      DirectionChange | undefined
    >();
    const [visibleMonth, setVisibleMonth] = useState<string>(
      endDate ? format(endDate, 'MMM-yyyy') : format(today, 'MMM-yyyy'),
    );
    const firstDayCurrentMonth = useMemo(
      () => parse(visibleMonth, 'MMM-yyyy', new Date()),
      [visibleMonth],
    );
    const days = useMemo(
      () =>
        eachDayOfInterval({
          start: startOfWeek(firstDayCurrentMonth),
          end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
        }),
      [firstDayCurrentMonth],
    );

    const handleMonthChange = (direction: DirectionChange) => {
      const monthAdjustment = direction === DirectionChange.next ? 1 : -1;
      const adjustedMonth = add(firstDayCurrentMonth, {
        months: monthAdjustment,
      });
      setVisibleMonth(format(adjustedMonth, 'MMM-yyyy'));
    };

    const handleSelectDay = (day: Date, event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      if (isAfter(day, endDate || day)) {
        onChange({ startDate: endDate, endDate: day });
      } else if (isBefore(day, startDate || day)) {
        onChange({ startDate: day, endDate: startDate });
      } else {
        onChange({ startDate: day, endDate: day });
      }
    };

    return (
      <Popover.Root onOpenChange={onOpenChange} open={open}>
        <Popover.Trigger style={{ cursor: 'pointer' }} asChild={asChild}>
          {children}
        </Popover.Trigger>
        {open && (
          <Popover.Content
            sideOffset={8}
            align="start"
            forceMount
            asChild
            onPointerDownOutside={onClickOutside}
          >
            <Container aria-label={ariaLabel} ref={ref}>
              <motion.span transition={containerVariants} layout layoutRoot>
                <Header
                  handleMonthChange={handleMonthChange}
                  firstDayCurrentMonth={firstDayCurrentMonth}
                  movingDirection={movingDirection}
                  setMovingDirection={setMovingDirection}
                />
                <WeekHeader />
                <Days
                  key={format(firstDayCurrentMonth, 'MMMM yyyy')}
                  initial={movingDirection ? 'initial' : false}
                  animate={movingDirection ? 'animate' : false}
                  exit="exit"
                  variants={
                    movingDirection ? getMoveVariants(movingDirection) : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  {days.map(day => (
                    <DayButton
                      key={day.toISOString()}
                      day={day}
                      onClick={event => handleSelectDay(day, event)}
                      visibleMonth={visibleMonth}
                      activeStartDate={startDate}
                      activeEndDate={endDate}
                    />
                  ))}
                </Days>
              </motion.span>
            </Container>
          </Popover.Content>
        )}
      </Popover.Root>
    );
  },
);

const Container = styled(motion.div)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    display: flex;
    flex-direction: column;
    isolation: isolate;
    max-width: 312px;
    overflow: hidden;
    padding-bottom: ${theme.spacing[3]};
    z-index: ${theme.zIndex.popover + 10};
  `}
`;

const Days = styled(motion.div)`
  ${({ theme }) => css`
    display: grid;
    grid-auto-rows: ${theme.spacing[9]};
    grid-row-gap: ${theme.spacing[1]};
    grid-template-columns: repeat(7, 1fr);
    padding: 0 ${theme.spacing[5]};
  `}
`;

export default DateSelectorSheet;
