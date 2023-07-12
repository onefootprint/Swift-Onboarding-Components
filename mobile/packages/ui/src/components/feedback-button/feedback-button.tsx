import { IcoCheck24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { Box } from '../box';
import { Typography } from '../typography';

export type FeedbackButtonProps = {
  children: string;
};

const FeedbackButton = ({ children }: FeedbackButtonProps) => {
  return (
    <FeedbackButtonContainer>
      <IcoCheck24 color="quinary" />
      <Typography variant="label-3" color="quinary">
        {children}
      </Typography>
      <Box width={24}/>
    </FeedbackButtonContainer>
  );
};

const FeedbackButtonContainer = styled.View`
  ${({ theme }) => {
    const { button } = theme.components;

    return css`
      align-items: center;
      justify-content: center;
      background: ${theme.color.success};
      border-radius: ${button.borderRadius};
      flex-direction: row;
      height: ${button.height};
      justify-content: space-between;
      padding-horizontal: ${theme.spacing[7]};
    `;
  }}
`;

export default FeedbackButton;
