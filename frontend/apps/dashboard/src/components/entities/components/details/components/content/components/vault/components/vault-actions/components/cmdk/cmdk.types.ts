export type ActionProps = {
  label: string;
  value: string;
  onSelect: () => void;
  closeAfterSelect?: boolean;
  disabled?: boolean;
};

export type ActionsProps = {
  title: string;
  actions: ActionProps[];
  type: ActionType;
};

export type ActionListProps = {
  actionsArray: ActionsProps[];
  setOpen: (open: boolean) => void;
  hasReview?: boolean;
};

export enum ActionType {
  DECRYPT = 'decrypt',
  USER_ACTIONS = 'user-actions',
  REVIEW = 'review',
}
