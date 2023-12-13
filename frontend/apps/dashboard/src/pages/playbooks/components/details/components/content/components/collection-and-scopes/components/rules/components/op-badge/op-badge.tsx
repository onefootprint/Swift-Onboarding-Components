import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React, { useState } from 'react';

export type OpBadgeProps = {
  isActive: boolean;
  isEditable: boolean;
  onClick: (isActive: boolean) => void;
};

const OpBadge = ({ isActive, isEditable, onClick }: OpBadgeProps) => {
  const { t } = useTranslation('pages.playbooks.details.rules.action-row');
  const [isSelected, setIsSelected] = useState(isActive);

  const handleClick = () => {
    const newIsSelected = !isSelected;
    onClick(newIsSelected);
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
    background-color: ${theme.backgroundColor.neutral};
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
      border: 0;
      color: ${theme.color.error};
    }

    &[data-is-editable='true'] {
      cursor: pointer;
    }
  `}
`;

export default OpBadge;
