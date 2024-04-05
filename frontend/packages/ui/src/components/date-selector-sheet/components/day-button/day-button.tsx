import {
  format,
  getDay,
  getWeekOfMonth,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  lastDayOfMonth,
  parse,
} from 'date-fns';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../utils';
import type { DayButtonProps } from '../../date-selector-sheet.types';

const DayButton = ({
  day,
  activeStartDate,
  activeEndDate,
  visibleMonth,
  onClick,
}: DayButtonProps) => {
  const firstDayCurrentMonth = parse(visibleMonth, 'MMM-yyyy', new Date());
  const isInRange =
    activeEndDate &&
    isBefore(day, activeEndDate) &&
    activeStartDate &&
    isAfter(day, activeStartDate);
  const isStart = activeStartDate && isSameDay(day, activeStartDate);
  const isEnd = activeEndDate && isSameDay(day, activeEndDate);
  const getRow = (targetDay: Date) => {
    const lastDay = lastDayOfMonth(firstDayCurrentMonth);
    if (isAfter(targetDay, lastDay)) {
      return getWeekOfMonth(lastDay);
    }
    if (isBefore(targetDay, firstDayCurrentMonth)) {
      return 1;
    }
    return getWeekOfMonth(day);
  };
  const getColumn = (targetDay: Date) => getDay(targetDay);

  return (
    <Container
      data-is-today={isToday(day)}
      data-is-same-month={isSameMonth(day, firstDayCurrentMonth)}
      data-is-in-range={isInRange}
      data-is-selection-start={isStart}
      data-is-selection-end={isEnd}
      $column={getColumn(day)}
      $row={getRow(day) - 1}
      onClick={e => onClick(e, day)}
      aria-label={`Select ${format(day, 'MMMM d, yyyy')}`}
    >
      <time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>
    </Container>
  );
};

const Container = styled.button<{ $column: number; $row: number }>`
  ${({ theme, $column, $row }) => {
    const shadeStyles = css`
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.1;
      background-color: ${theme.backgroundColor.accent};
      z-index: -1;
    `;

    const hoverRegularDayStyles = css`
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${theme.backgroundColor.secondary};
      border-radius: ${theme.borderRadius.full};
      z-index: -1;
    `;

    const hoverInRageStyles = css`
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${theme.backgroundColor.accent};
      border-radius: ${theme.borderRadius.full};
      opacity: 0.1;
      z-index: -1;
    `;

    return css`
      all: unset;
      ${createFontStyles('body-4')};
      cursor: pointer;
      user-select: none;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: ${theme.spacing[9]};
      width: ${theme.spacing[9]};
      color: ${theme.color.quaternary};
      grid-column: ${$column + 1};
      grid-row: ${$row + 1};

      &[data-is-in-range='false'] {
        &:hover {
          &::before {
            ${hoverRegularDayStyles}
          }
        }
      }

      &[data-is-same-month='true'] {
        color: ${theme.color.primary};
      }

      &[data-is-selection-start='true'] {
        border-radius: ${theme.borderRadius.full};
        background-color: ${theme.backgroundColor.accent};
        color: ${theme.color.quinary};

        &::after {
          ${shadeStyles}
          border-top-left-radius: ${theme.borderRadius.full};
          border-bottom-left-radius: ${theme.borderRadius.full};
        }
      }

      &[data-is-selection-end='true'] {
        border-radius: ${theme.borderRadius.full};
        background-color: ${theme.backgroundColor.accent};
        color: ${theme.color.quinary};

        &::after {
          ${shadeStyles}
          border-top-right-radius: ${theme.borderRadius.full};
          border-bottom-right-radius: ${theme.borderRadius.full};
        }
      }

      &[data-is-in-range='true'] {
        &:hover {
          &::after {
            ${hoverInRageStyles}
          }
        }

        &::before {
          ${shadeStyles}
        }
      }
    `;
  }}
`;

export default DayButton;
