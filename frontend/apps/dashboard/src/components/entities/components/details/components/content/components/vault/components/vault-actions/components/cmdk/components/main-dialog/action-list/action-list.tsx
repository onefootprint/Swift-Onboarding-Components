import { createFontStyles } from '@onefootprint/ui';
import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { type ActionListProps, ActionType } from '../../../cmdk.types';

const ActionList = ({ actionsArray, setOpen, hasReview }: ActionListProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.cmdk' });

  const handleOnSelect = (onSelect: { (): void; (): void }, closeAfterSelect: boolean | undefined) => () => {
    if (onSelect) {
      onSelect();
    }
    if (closeAfterSelect) {
      setOpen(false);
    }
  };

  return (
    <List>
      <EmptyState>{t('no-results')}</EmptyState>
      {actionsArray?.map(({ title, actions, type }) =>
        !hasReview && type === ActionType.REVIEW ? null : (
          <Group key={title} heading={title}>
            {actions.map(({ label, value, onSelect, closeAfterSelect, disabled }) => (
              <Option
                key={value}
                value={value}
                onSelect={handleOnSelect(onSelect, closeAfterSelect)}
                disabled={disabled}
              >
                {label}
                <span>{disabled && t('disabled')}</span>
              </Option>
            ))}
          </Group>
        ),
      )}
    </List>
  );
};

const Option = styled(Command.Item)`
  ${({ theme }) => css`
    ${createFontStyles('body-2')}
    cursor: pointer;
    color: ${theme.color.primary};
    padding: ${theme.spacing[4]} 0 ${theme.spacing[4]} ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
    transition: background-color 0.2s ease-in-out;
    display: flex;
    justify-content: space-between;

    a {
      all: unset;
    }

    &[data-selected='true'] {
      background-color: ${theme.backgroundColor.secondary};
    }

    &[aria-disabled='true'] {
      color: ${theme.color.quaternary};
      cursor: not-allowed;
    }
  `}
`;

const EmptyState = styled(Command.Empty)`
  ${({ theme }) => css`
    ${createFontStyles('body-2')}
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: ${theme.color.tertiary};
    padding: ${theme.spacing[5]};
    text-align: center;
  `}
`;

const Group = styled(Command.Group)`
  ${({ theme }) => css`
    padding: ${theme.spacing[1]} 0;

    [cmdk-group-heading] {
      ${createFontStyles('label-3')}
      color: ${theme.color.tertiary};
      padding-bottom: ${theme.spacing[2]};
      margin-top: ${theme.spacing[3]};
      opacity: 70%;
    }
  `}
`;

const List = styled(Command.List)`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
    max-height: 480px;
    overflow-y: auto;
  `}
`;

export default ActionList;
