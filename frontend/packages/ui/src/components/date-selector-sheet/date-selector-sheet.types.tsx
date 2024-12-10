export type HeaderProps = {
  handleMonthChange: (direction: DirectionChange) => void;
  firstDayCurrentMonth: Date;
  movingDirection: DirectionChange | undefined;
  setMovingDirection: (direction: DirectionChange) => void;
};

export type DateSelectorSheetProps = {
  ariaLabel?: string;
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  disableFutureDates?: boolean;
  disablePastDates?: boolean;
  endDate?: Date;
  onChange: ({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) => void;
  onClickOutside?: () => void;
  onOpenChange?: (open: boolean) => void;
  open: boolean;
  position?: {
    alignment?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    avoidCollisions?: boolean;
  };
  startDate?: Date;
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
