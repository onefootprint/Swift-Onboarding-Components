import styled, { css, useTheme } from '@onefootprint/styled';
import FocusTrap from 'focus-trap-react';
import type { Ref } from 'react';
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import mergeRefs from 'react-merge-refs';
import { usePopper } from 'react-popper';

import { useOnClickOutside } from '../../../../hooks';
import {
  createFontStyles,
  createOverlayBackground,
} from '../../../../utils/mixins';
import type { DatePickerProps } from '../../../internal/date-picker';
import DatePicker from '../../../internal/date-picker';

export type ButtonPickerProps = {
  disabledDays?: DatePickerProps['disabled'];
  onChange?: (nextDate: Date) => void;
  value: Date;
};

export type ButtonPickerRef = {
  open: () => void;
};

const ButtonPicker = forwardRef(
  (
    { disabledDays, onChange, value }: ButtonPickerProps,
    ref: Ref<ButtonPickerRef>,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isPopperOpen, setIsPopperOpen] = useState(false);
    const popperRef = useRef<HTMLButtonElement>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
      null,
    );
    const popper = usePopper(popperRef.current, popperElement, {
      placement: 'bottom-start',
      strategy: 'fixed',
      modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
    });
    const theme = useTheme();

    const openPopper = () => {
      setIsPopperOpen(true);
    };

    const closePopper = () => {
      setIsPopperOpen(false);
    };

    const handleButtonClick = () => {
      setIsPopperOpen(prevValue => !prevValue);
    };

    const handleChange = (nextDate?: Date) => {
      if (nextDate) {
        onChange?.(nextDate);
      }
      closePopper();
    };

    useOnClickOutside(containerRef, closePopper);
    useImperativeHandle(ref, () => ({
      open() {
        openPopper();
      },
    }));

    return (
      <div ref={containerRef}>
        <ButtonPickerContainer
          data-open={isPopperOpen}
          onClick={handleButtonClick}
          ref={mergeRefs([buttonRef, popperRef])}
          type="button"
        >
          {new Intl.DateTimeFormat('en-US').format(value)}
        </ButtonPickerContainer>
        {isPopperOpen && (
          <FocusTrap
            active
            focusTrapOptions={{
              allowOutsideClick: true,
              clickOutsideDeactivates: true,
              initialFocus: false,
              onDeactivate: closePopper,
            }}
          >
            <div
              tabIndex={-1}
              style={{
                ...popper.styles.popper,
                zIndex: theme.zIndex.popover,
              }}
              className="dialog-sheet"
              // eslint-disable-next-line
              {...popper.attributes.popper}
              ref={setPopperElement}
              role="dialog"
            >
              <DatePicker
                defaultMonth={value}
                disabled={disabledDays}
                initialFocus={isPopperOpen}
                onChange={handleChange}
                value={value}
              />
            </div>
          </FocusTrap>
        )}
      </div>
    );
  },
);

const ButtonPickerContainer = styled.button`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};
    background: none;
    border-radius: ${theme.borderRadius.default};
    border: none;
    cursor: pointer;
    padding: ${theme.spacing[1]} ${theme.spacing[3]};

    @media (hover: hover) {
      &:hover {
        ${createOverlayBackground('darken-1', 'primary')};
      }
    }

    &[data-open='true'] {
      background: ${theme.backgroundColor.accent};
      color: ${theme.color.quinary};
    }
  `};
`;

export default ButtonPicker;
