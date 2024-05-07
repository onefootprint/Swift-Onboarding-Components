export type HeaderProps = {
  handleMonthChange: (direction: DirectionChange) => void;
  firstDayCurrentMonth: Date;
  movingDirection: DirectionChange | undefined;
  setMovingDirection: (direction: DirectionChange) => void;
};

export type DateSelectorSheetProps = {
  open: boolean;
  startDate?: Date;
  endDate?: Date;
  ariaLabel?: string;
  asChild?: boolean;
  children: React.ReactNode;
  disableFutureDates?: boolean;
  disablePastDates?: boolean;
  onChange: ({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) => void;
  onOpenChange?: (open: boolean) => void;
  onClickOutside?: () => void;
  alignment?: 'start' | 'center' | 'end';
};

export enum DirectionChange {
  previous = 'previous',
  next = 'next',
}

export type DayButtonProps = {
  day: Date;
  activeStartDate: Date | undefined;
  activeEndDate: Date | undefined;
  visibleMonth: string;
  onClick: (e: React.MouseEvent, day: Date) => void;
  disabled?: boolean;
};
