import { useTranslation } from '@onefootprint/hooks';
import { IcoLink24 } from '@onefootprint/icons';
import { Tooltip } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

type CopyLinkProps = {
  slug: string;
};

const HIDE_TIMEOUT = 600;
let confirmationTimeout: null | NodeJS.Timeout = null;

const CopyLink = ({ slug }: CopyLinkProps) => {
  const { t } = useTranslation('pages.changelog');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(
    () => () => {
      clearTooltipTimeout();
    },
    [],
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowConfirmation(true);
    scheduleToHideConfirmation();
    navigator.clipboard.writeText(slug);
  };

  const clearTooltipTimeout = () => {
    if (confirmationTimeout) {
      clearTimeout(confirmationTimeout);
      confirmationTimeout = null;
    }
  };

  const scheduleToHideConfirmation = () => {
    confirmationTimeout = setTimeout(() => {
      setShowConfirmation(false);
    }, HIDE_TIMEOUT);
  };

  return (
    <CopyLinkContainer onClick={handleClick}>
      <Tooltip
        position="top"
        text={showConfirmation ? t('copy.confirmation') : t('copy.title')}
      >
        <IcoLink24 color="tertiary" />
      </Tooltip>
    </CopyLinkContainer>
  );
};

const CopyLinkContainer = styled.button`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth} solid ${theme.borderColor.tertiary};
    cursor: pointer;
    height: 32px;
    width: 32px;

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &:focus {
      border: ${theme.borderWidth} solid ${theme.borderColor.primary};
    }

    &:active {
      background-color: ${theme.backgroundColor.senary};
    }
  `}
`;

export default CopyLink;
