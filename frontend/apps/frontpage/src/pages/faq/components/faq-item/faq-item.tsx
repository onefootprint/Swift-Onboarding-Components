import IcoMinusSmall24 from 'icons/ico/ico-minus-small-24';
import IcoPlusSmall24 from 'icons/ico/ico-plus-small-24';
import { darken } from 'polished';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles, Typography } from 'ui';

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
    <Details open={open}>
      <Summary onClick={handleClick}>
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
    cursor: pointer;
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
