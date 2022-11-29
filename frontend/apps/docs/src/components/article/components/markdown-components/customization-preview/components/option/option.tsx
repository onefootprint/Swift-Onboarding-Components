import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

export type OptionProps = {
  image: string;
  name: string;
  onClick: () => void;
  selected: boolean;
};

const Option = ({ name, image, selected, onClick }: OptionProps) => (
  <OptionContainer data-selected={selected} onClick={onClick}>
    <Image src={image} width={120} height={97} alt={name} />
    {name}
  </OptionContainer>
);

const OptionContainer = styled.button`
  ${({ theme }) => css`
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    justify-content: center;
    margin: 0;
    padding: 0;

    img {
      border: ${theme.borderWidth[2]} solid transparent;
      border-radius: ${theme.spacing[3]};
    }

    &[data-selected='true'] img {
      border: ${theme.borderWidth[2]} solid ${theme.color.accent};
    }
  `}
`;

export default Option;
