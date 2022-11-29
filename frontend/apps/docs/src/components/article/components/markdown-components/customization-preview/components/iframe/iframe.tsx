import React from 'react';
import styled, { css } from 'styled-components';

type IframeProps = {
  name: string;
  selected: boolean;
  src: string;
};

const Iframe = ({ name, src, selected }: IframeProps) => (
  <IframeContainer show={selected}>
    <StyledIframe
      allow="otp-credentials; publickey-credentials-get *; camera *;"
      src={src}
      title={name}
    />
  </IframeContainer>
);

const IframeContainer = styled.div<{ show: boolean }>`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;

  ${({ show }) =>
    !show &&
    css`
      display: none;
    `}
`;

const StyledIframe = styled.iframe`
  max-width: 90%;
`;

export default Iframe;
