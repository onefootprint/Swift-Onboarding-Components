import { createPopper } from '@popperjs/core';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'styled';
import { Typography } from 'ui';

import S from './square.styles';

type SquareProps = {
  lastColumn: boolean;
  selected: boolean;
};

const Square = ({ lastColumn, selected }: SquareProps) => {
  const theme = useTheme();
  const [isTooltipVisible, setTooltipVisibility] = useState(false);
  const squareRef = useRef<HTMLLIElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) {
      initPopper();
    }
  }, [selected, squareRef.current, tooltipRef.current]);

  const initPopper = () => {
    if (squareRef.current && tooltipRef.current) {
      createPopper(
        squareRef.current as Element,
        tooltipRef.current as HTMLElement,
        {
          placement: 'top',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, theme.spacing[3]],
              },
            },
          ],
        },
      );
    }
  };

  const handleMouseEnter = () => setTooltipVisibility(true);

  const handleMouseLeave = () => setTooltipVisibility(false);

  return (
    <S.Square
      lastColumn={lastColumn}
      selected={selected}
      ref={squareRef}
      onMouseEnter={selected ? handleMouseEnter : undefined}
      onMouseLeave={selected ? handleMouseLeave : undefined}
    >
      <S.Tooltip visible={isTooltipVisible} ref={tooltipRef}>
        <Typography color="primary" variant="caption-2">
          We got you covered! 😎
        </Typography>
      </S.Tooltip>
    </S.Square>
  );
};

export default Square;
