import { IcoChevronLeft24, IcoChevronRight24 } from '@onefootprint/icons';
import React from 'react';
import type { CaptionProps } from 'react-day-picker';
import { useNavigation } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import IconButton from '../../../icon-button';
import Typograhy from '../../../typography';

const shortMonthDateFormatter = (date: Date) =>
  date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });

const CustomCaption = ({ displayMonth }: CaptionProps) => {
  const { t } = useTranslation('ui');
  const { goToMonth, nextMonth, previousMonth } = useNavigation();

  return (
    <CaptionContainer>
      <IconButton
        aria-label={t(
          'components.internal.date-picker.custom-caption.previous',
        )}
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
      >
        <IcoChevronLeft24 />
      </IconButton>
      <Typograhy variant="label-2" as="h2">
        {shortMonthDateFormatter(displayMonth)}
      </Typograhy>
      <IconButton
        aria-label={t('components.internal.date-picker.custom-caption.next')}
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
