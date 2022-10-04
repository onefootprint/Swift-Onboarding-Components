import { IcoChevronLeft24, IcoChevronRight24 } from '@onefootprint/icons';
import { format } from 'date-fns';
import React from 'react';
import { CaptionProps, useNavigation } from 'react-day-picker';
import styled, { css } from 'styled-components';

import IconButton from '../../../icon-button';
import Typograhy from '../../../typography';

const CustomCaption = ({ displayMonth }: CaptionProps) => {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <CaptionContainer>
      <IconButton
        aria-label="Previous"
        disabled={!previousMonth}
        iconComponent={IcoChevronLeft24}
        onClick={() => previousMonth && goToMonth(previousMonth)}
      />
      <Typograhy variant="label-2" as="h2">
        {format(displayMonth, 'MMM yyy')}
      </Typograhy>
      <IconButton
        aria-label="Next"
        disabled={!nextMonth}
        iconComponent={IcoChevronRight24}
        onClick={() => nextMonth && goToMonth(nextMonth)}
      />
    </CaptionContainer>
  );
};

const CaptionContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing[5]}px;
  `};
`;

export default CustomCaption;
