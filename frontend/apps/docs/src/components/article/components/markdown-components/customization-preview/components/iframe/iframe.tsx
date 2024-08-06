import styled, { css } from 'styled-components';

type IframeProps = {
  name: string;
  selected: boolean;
  src: string;
};

const Iframe = ({ name, src, selected }: IframeProps) => (
  <IframeContainer $show={selected}>
    <StyledIframe
      allow="otp-credentials *; publickey-credentials-get *; camera *; clipboard-write *;"
      src={src}
      title={name}
    />
  </IframeContainer>
);

const IframeContainer = styled.div<{ $show: boolean }>`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute;
  transform: translateX(-50%);
  left: 50%;

  ${({ $show }) =>
    !$show &&
    css`
      display: none;
    `}
`;

const StyledIframe = styled.iframe`
  max-width: 90%;
  width: 500px;
  min-height: 480px;
  height: fit-content;
`;

export default Iframe;
