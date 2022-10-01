import { IcoMinusSmall24, IcoPlusSmall24 } from '@onefootprint/icons';
import { createFontStyles, Typography } from '@onefootprint/ui';
import { darken } from 'polished';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

type FaqItemProps = {
  title: string;
  content: string[];
};

const FaqItem = ({ title, content }: FaqItemProps) => {
  const [open, setOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setOpen(prevOpen => !prevOpen);
  };

  return (
    <Details open={open} onClick={handleClick}>
      <Summary>
        <Typography variant="label-1">{title}</Typography>
        <div>{open ? <IcoMinusSmall24 /> : <IcoPlusSmall24 />}</div>
      </Summary>
      <Content>{content}</Content>
    </Details>
  );
};

const Details = styled.details`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};

    &:hover {
      border-color: ${darken(0.32, theme.borderColor.primary)};
    }
  `}
`;

const Summary = styled.summary`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]}px;
    justify-content: space-between;
    list-style: none;
    padding: ${theme.spacing[5]}px ${theme.spacing[6]}px;

    &::-webkit-details-marker {
      display: none;
    }
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-2')};
    color: ${theme.color.secondary};
    margin-top: ${theme.spacing[5]}px;
    padding: 0 ${theme.spacing[6]}px ${theme.spacing[5]}px;
  `}
`;

export default FaqItem;
