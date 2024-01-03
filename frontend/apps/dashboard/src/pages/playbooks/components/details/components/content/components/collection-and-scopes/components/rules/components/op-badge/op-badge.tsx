import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { RuleOp } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

export type OpBadgeProps = {
  defaultValue: RuleOp;
  isEditable: boolean;
  onClick: (newValue: RuleOp) => void;
};

const OpBadge = ({ defaultValue, isEditable, onClick }: OpBadgeProps) => {
  const { t } = useTranslation('pages.playbooks.details.rules.action-row');
  const [isSelected, setIsSelected] = useState(defaultValue === RuleOp.notEq);

  useEffect(() => {
    setIsSelected(defaultValue === RuleOp.notEq);
  }, [defaultValue]);

  const handleClick = () => {
    const newIsSelected = !isSelected;
    onClick(newIsSelected ? RuleOp.notEq : RuleOp.eq);
    setIsSelected(newIsSelected);
  };

  if (isEditable) {
    return (
      <Badge
        data-is-selected={isSelected}
        data-is-editable={isEditable}
        onClick={handleClick}
      >
        {t('not')}
      </Badge>
    );
  }
  return isSelected ? (
    <Badge data-is-selected={isSelected} onClick={handleClick}>
      {t('not')}
    </Badge>
  ) : null;
};

const Badge = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    border-radius: ${theme.borderRadius.large};
    border: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    color: ${theme.color.quaternary};
    margin-right: ${theme.spacing[2]};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    display: inline-flex;
    justify-content: center;
    align-items: center;

    &[data-is-selected='true'] {
      background-color: ${theme.backgroundColor.error};
      border: ${theme.borderWidth[1]} solid ${theme.backgroundColor.error};
      color: ${theme.color.error};
    }

    &[data-is-editable='true'] {
      cursor: pointer;
    }
  `}
`;

export default OpBadge;
