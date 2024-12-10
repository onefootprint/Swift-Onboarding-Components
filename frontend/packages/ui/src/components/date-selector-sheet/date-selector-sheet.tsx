'use client';

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
import Popover from '../popover/';
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
      ariaLabel = 'Select date range',
      asChild,
      children,
      className,
      disableFutureDates,
      disablePastDates,
      endDate,
      onChange,
      onClickOutside,
      onOpenChange,
      open,
      position = {
        alignment: 'start',
        side: 'bottom',
      },
      startDate,
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
        <Popover.Trigger asChild={asChild} className={className}>
          {children}
        </Popover.Trigger>
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
          className="border border-solid border-tertiary"
        >
          <motion.div
            className="flex flex-col pb-2 overflow-hidden isolate"
            transition={containerVariants}
            layout
            layoutRoot
            initial={false}
          >
            <Header
              handleMonthChange={handleMonthChange}
              firstDayCurrentMonth={firstDayCurrentMonth}
              movingDirection={movingDirection}
              setMovingDirection={setMovingDirection}
            />
            <div className="flex flex-col mb-2">
              <RangeInputs
                onChange={handleRangeChange}
                onFocus={handleRangeInputFocus}
                startDate={startDate}
                endDate={endDate}
                disableFutureDates={disableFutureDates}
                disablePastDates={disablePastDates}
              />
              <div id="error-message" />
            </div>
            <WeekHeader />
            <motion.div
              className="grid grid-rows-[40px] gap-y-0.5 grid-cols-7 px-4"
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
            </motion.div>
          </motion.div>
        </Popover.Content>
      </Popover.Root>
    );
  },
);

export default DateSelectorSheet;
