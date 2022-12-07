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
        onClick={() => previousMonth && goToMonth(previousMonth)}
      >
        <IcoChevronLeft24 />
      </IconButton>
      <Typograhy variant="label-2" as="h2">
        {format(displayMonth, 'MMM yyy')}
      </Typograhy>
      <IconButton
        aria-label="Next"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
      >
        <IcoChevronRight24 />
      </IconButton>
    </CaptionContainer>
  );
};

const CaptionContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing[5]};
  `};
`;

export default CustomCaption;
