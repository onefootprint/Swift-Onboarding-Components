import React from 'react';
import styled, { css } from 'styled-components';

type PlacemarkProps = {
  $zIndex?: number;
};

const Placemark = ({ $zIndex }: PlacemarkProps) => <PlacemarkItem $zIndex={$zIndex} />;

const PlacemarkItem = styled.div<{ $zIndex?: number }>`
  ${({ theme, $zIndex }) => css`
    position: absolute;
    z-index: ${$zIndex};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: ${theme.borderWidth[2]} solid white;
    border-radius: ${theme.borderRadius.full};
    width: 20px;
    height: 20px;
    background-color: ${theme.backgroundColor.accent};
  `}
`;

export default Placemark;
