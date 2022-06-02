import IcoArrowLeftSmall24 from 'icons/ico/ico-arrow-left-small-24';
import IcoClose24 from 'icons/ico/ico-close-24';
import React from 'react';
import styled, { css } from 'styled';
import { IconButton, ProgressIndicator, ProgressIndicatorProps } from 'ui';

export enum HeaderButtonType {
  close = 'close',
  prev = 'prev',
}

export type HeaderProps = {
  buttonType: HeaderButtonType;
  progressIndicatorProps?: ProgressIndicatorProps;
  onPrev?: () => void;
  onClose?: () => void;
};

const Header = ({
  buttonType,
  progressIndicatorProps,
  onPrev,
  onClose,
}: HeaderProps) => (
  <Container>
    {buttonType === HeaderButtonType.prev ? (
      <IconButton
        iconComponent={IcoArrowLeftSmall24}
        ariaLabel="Previous window"
        onClick={onPrev}
      />
    ) : (
      <IconButton
        iconComponent={IcoClose24}
        ariaLabel="Close window"
        onClick={onClose}
      />
    )}
    {progressIndicatorProps ? (
      <ProgressIndicatorContainer>
        <ProgressIndicator
          max={progressIndicatorProps.max}
          value={progressIndicatorProps.value}
        />
      </ProgressIndicatorContainer>
    ) : null}
  </Container>
);

export default Header;

const ProgressIndicatorContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  margin-left: -32px; // Icon size
`;

const Container = styled.header`
  ${({ theme }) => css`
    margin: ${theme.spacing[5]}px 0 ${theme.spacing[3]}px;
    display: flex;
    align-items: center;
  `}
`;
