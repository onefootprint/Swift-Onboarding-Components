import React from 'react';
import styled, { css } from 'styled-components';

type IframeProps = {
  name: string;
  selected: boolean;
  src: string;
};

const Iframe = ({ name, src, selected }: IframeProps) => (
  <ShowIf cond={selected}>
    <iframe
      allow="otp-credentials; publickey-credentials-get *; camera *;"
      src={src}
      title={name}
    />
  </ShowIf>
);

const ShowIf = styled.div<{ cond: boolean }>`
  ${({ cond }) =>
    !cond &&
    css`
      display: none;
    `}
`;

export default Iframe;
