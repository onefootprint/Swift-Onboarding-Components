import type { Placement } from '@popperjs/core';
import React, { useCallback, useId, useState } from 'react';
import { usePopper } from 'react-popper';
import styled, { css, useTheme } from 'styled-components';
import { useUpdateEffect } from 'usehooks-ts';

import { createFontStyles } from '../../utils/mixins';
import useGetElementRef from './hooks/use-get-element-ref';
import useVisibility from './hooks/use-visibility';

type Size = 'default' | 'compact';

export type TooltipProps = {
  disabled?: boolean;
  'aria-label'?: string;
  children: React.ReactElement;
  placement?: Placement;
  size?: Size;
  testID?: string;
  text: string;
};

const Tooltip = ({
  disabled,
  'aria-label': ariaLabel,
  children,
  placement = 'bottom',
  size = 'default',
  testID,
  text,
}: TooltipProps) => {
  const id = useId();
  const theme = useTheme();
  const [refElement, setRefElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const {
    forceUpdate,
    styles,
    attributes: { popper },
  } = usePopper(refElement, popperElement, {
    placement,
    strategy: 'fixed',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
    ],
  });
  const isVisible = useVisibility(refElement);
  const shouldShowTooltip = isVisible && !disabled;
  const clonedChildren = useGetElementRef(children, id, setRefElement);

  const recalculateStylesAfterTextChange = useCallback(() => {
    if (forceUpdate) {
      forceUpdate();
    }
  }, [forceUpdate]);

  useUpdateEffect(() => {
    if (text) {
      queueMicrotask(recalculateStylesAfterTextChange);
    }
  }, [text, recalculateStylesAfterTextChange]);

  return (
    <>
      {clonedChildren}
      {shouldShowTooltip && (
        <TooltipContainer
          aria-label={ariaLabel}
          data-popper-escaped={popper && popper['data-popper-escaped']}
          data-popper-placement={popper && popper['data-popper-placement']}
          data-popper-reference-hidden={
            popper && popper['data-popper-reference-hidden']
          }
          data-testid={testID}
          id={id}
          ref={setPopperElement}
          role="tooltip"
          size={size}
          style={{
            ...styles.popper,
            zIndex: theme.zIndex.tooltip,
          }}
        >
          {text}
        </TooltipContainer>
      )}
    </>
  );
};

const TooltipContainer = styled.span<{ size: Size }>`
  ${({ theme, size }) => css`
    ${createFontStyles(size === 'default' ? 'body-4' : 'caption-2')};
    background: ${theme.backgroundColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    color: ${theme.color.quinary};
    max-width: 300px;
    min-width: fit-content;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    text-align: center;
  `}
`;

export default Tooltip;
