import { useTheme } from '@onefootprint/styled';
import React from 'react';
import { DayPicker, DayPickerSingleProps } from 'react-day-picker';

import CustomCaption from './components/custom-caption';

export type DatePickerProps = {
  disabled?: DayPickerSingleProps['disabled'];
  initialFocus?: DayPickerSingleProps['initialFocus'];
  value?: DayPickerSingleProps['selected'];
  onChange?: (nextDate?: Date) => void;
  defaultMonth?: DayPickerSingleProps['defaultMonth'];
};

const cellSize = 40;
const daysOfWeek = 7;

const DatePicker = ({
  disabled,
  initialFocus,
  value,
  onChange,
  defaultMonth,
}: DatePickerProps) => {
  const theme = useTheme();

  return (
    <>
      <DayPicker
        disabled={disabled}
        defaultMonth={defaultMonth}
        initialFocus={initialFocus}
        mode="single"
        onSelect={onChange}
        selected={value}
        components={{
          Caption: CustomCaption,
        }}
      />
      <style>
        {`
          .rdp {
            background: ${theme.backgroundColor.primary};
            border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
            border-radius: ${theme.spacing[2]};
            box-shadow: ${theme.elevation[2]};
            padding: ${theme.spacing[4]} ${theme.spacing[5]};
            width: 312px;
            margin: ${theme.spacing[2]} 0;
          }

          .rdp-table {
            border-collapse: collapse;
            margin: 0;
            width: ${cellSize * daysOfWeek}px;
          }

          .rdp-table tbody tr:not(:last-child) td {
            padding-bottom: ${theme.spacing[3]};
          }

          .rdp-head_cell {
            -moz-osx-font-smoothing: grayscale;
            -webkit-font-smoothing: antialiased;
            font-family: DM Sans;
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            color: ${theme.color.tertiary};
            height: ${cellSize}px;
            height: 100%;
            padding-bottom: ${theme.spacing[3]};
            text-align: center;
            vertical-align: middle;
          }

          .rdp-cell {
            width: ${cellSize}px;
            height: ${cellSize}px;
          }

          .rdp-button_reset {
            appearance: none;
            position: relative;
            margin: 0;
            padding: 0;
            cursor: default;
            color: inherit;
            background: none;
            font: inherit;
            -moz-appearance: none;
            -webkit-appearance: none;
          }

          .rdp-weeknumber, .rdp-day {
            -moz-osx-font-smoothing: grayscale;
            -webkit-font-smoothing: antialiased;
            font-family: DM Sans;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            align-items: center;
            border-radius: 100%;
            border: 2px solid transparent;
            box-sizing: border-box;
            display: flex;
            height: ${cellSize}px;
            justify-content: center;
            margin: 0;
            max-width: ${cellSize}px;
            overflow: hidden;
            width: ${cellSize}px;
          }

          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
            background-color: ${theme.backgroundColor.secondary};
          }

          .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
            color: ${theme.color.quinary};
            opacity: 1;
            background-color: ${theme.backgroundColor.accent};
          }

          .rdp-button:not([disabled]) {
            cursor: pointer;
          }

          .rdp-vhidden {
            display: none;
          }

          .rdp-button[disabled]:not(.rdp-day_selected) {
            opacity: 0.25;
          }
        `}
      </style>
    </>
  );
};

export default DatePicker;
