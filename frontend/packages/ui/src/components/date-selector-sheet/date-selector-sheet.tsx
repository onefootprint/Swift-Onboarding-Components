import { Popover } from '@onefootprint/ui';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  parse,
  startOfToday,
} from 'date-fns';
import { motion } from 'framer-motion';
import type React from 'react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import Stack from '../stack';
import DayButton from './components/day-button';
import Header from './components/header';
import RangeInputs from './components/range-inputs';
import WeekHeader from './components/week-header';
import type { DateSelectorSheetProps } from './date-selector-sheet.types';
import { DirectionChange } from './date-selector-sheet.types';
import { containerVariants, getMoveVariants } from './date-selector-sheet.utils';

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
      disableFutureDates,
      disablePastDates,
      onOpenChange,
      onClickOutside,
      onChange,
      position = {
        alignment: 'start',
        side: 'bottom',
      },
    },
    ref,
  ) => {
    const [movingDirection, setMovingDirection] = useState<DirectionChange | undefined>();
    const [visibleMonth, setVisibleMonth] = useState<string>(
      endDate ? format(endDate, 'MMM-yyyy') : format(today, 'MMM-yyyy'),
    );
    const firstDayCurrentMonth = useMemo(() => parse(visibleMonth, 'MMM-yyyy', new Date()), [visibleMonth]);
    const days = useMemo(
      () =>
        eachDayOfInterval({
          start: firstDayCurrentMonth,
          end: endOfMonth(firstDayCurrentMonth),
        }),
      [firstDayCurrentMonth],
    );

    useEffect(() => {
      if (!open) {
        setMovingDirection(undefined);
      }
    }, [open]);

    const goToDate = (targetDate?: Date) => {
      if (!targetDate) return;
      setVisibleMonth(format(targetDate, 'MMM-yyyy'));
    };

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

      if (!isSameMonth(day, firstDayCurrentMonth)) {
        goToDate(day);
      }

      if (isAfter(day, endDate || day)) {
        onChange({ startDate: endDate, endDate: day });
      } else if (isBefore(day, startDate || day)) {
        onChange({ startDate: day, endDate: startDate });
      } else {
        onChange({ startDate: day, endDate: day });
      }
    };

    const handleRangeInputFocus = (trigger: 'start' | 'end') => {
      if (trigger === 'start') {
        goToDate(startDate || today);
      }
      if (trigger === 'end') {
        goToDate(endDate || today);
      }
    };

    const handleRangeChange = ({
      startDate: newStartDate,
      endDate: newEndDate,
      trigger,
    }: {
      startDate?: Date;
      endDate?: Date;
      trigger: 'start' | 'end';
    }) => {
      onChange({ startDate: newStartDate, endDate: newEndDate });
      if (trigger === 'start') {
        goToDate(newStartDate);
      }
      if (trigger === 'end') {
        goToDate(newEndDate);
      }
    };

    return (
      <Popover.Root onOpenChange={onOpenChange} open={open}>
        <Popover.Trigger asChild={asChild}>{children}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            align={position.alignment}
            side={position.side}
            avoidCollisions={position.avoidCollisions}
            asChild
            onPointerDownOutside={onClickOutside}
            aria-label={ariaLabel}
            ref={ref}
            maxWidth="312px"
          >
            <Container transition={containerVariants} layout layoutRoot initial={false}>
              <Header
                handleMonthChange={handleMonthChange}
                firstDayCurrentMonth={firstDayCurrentMonth}
                movingDirection={movingDirection}
                setMovingDirection={setMovingDirection}
              />
              <Stack direction="column" marginBottom={3}>
                <RangeInputs
                  onChange={handleRangeChange}
                  onFocus={handleRangeInputFocus}
                  startDate={startDate}
                  endDate={endDate}
                  disableFutureDates={disableFutureDates}
                  disablePastDates={disablePastDates}
                />
                <div id="error-message" />
              </Stack>
              <WeekHeader />
              <Days
                key={format(firstDayCurrentMonth, 'MMMM yyyy')}
                initial={movingDirection ? 'initial' : false}
                animate={movingDirection ? 'animate' : false}
                exit="exit"
                variants={movingDirection ? getMoveVariants(movingDirection) : {}}
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
                    disabled={(disableFutureDates && isAfter(day, today)) || (disablePastDates && isBefore(day, today))}
                  />
                ))}
              </Days>
            </Container>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

const Container = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    isolation: isolate;
    overflow: hidden;
    padding-bottom: ${theme.spacing[3]};
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
