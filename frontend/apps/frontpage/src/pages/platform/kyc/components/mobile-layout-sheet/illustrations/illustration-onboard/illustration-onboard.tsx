import { IcoBolt24, IcoUser24 } from '@onefootprint/icons';
import Image from 'next/image';
import styled, { css } from 'styled-components';

const IllustrationOnboard = () => {
  const PHONE_WIDTH = 235;
  const PHONE_HEIGHT = 508;

  return (
    <Container>
      <PhoneContainer width={PHONE_WIDTH} height={PHONE_HEIGHT}>
        <PhoneFrameImage src="/iphone.png" alt="" width={PHONE_WIDTH} height={PHONE_HEIGHT} />
        <Screen src="/kyc/sticky-rail/welcome-back.png" width={222} height={490} alt="" />
      </PhoneContainer>
      <CirclesContainer>
        <Circle $diameter={340}>
          <IconContainer data-type="bolt">
            <IcoBolt24 />
          </IconContainer>
        </Circle>
        <Circle $diameter={280}>
          <IconContainer data-type="user">
            <IcoUser24 />
          </IconContainer>
        </Circle>
      </CirclesContainer>
    </Container>
  );
};

const Screen = styled(Image)`
  position: absolute;
  top: 8px;
  left: 8px;
  transform: 'translate(-50%, -50%)';
  z-index: 0;
  border-radius: '56px';
  overflow: 'hidden';
  width: calc(100% - 16px);
  height: calc(100% - 12px);
`;

const CirclesContainer = styled.div`
  max-width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 0;
  transform: translate(-50%, -50%);
`;

const Container = styled.div`
  max-width: 100%;
  height: 520px;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

const PhoneContainer = styled.div<{ width: number; height: number }>`
  ${({ theme, width, height }) => css`
    width: ${width}px;
    height: ${height}px;
    position: relative;
    z-index: 1;
    border-radius: 56px;
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const PhoneFrameImage = styled(Image)`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
`;

const Circle = styled.div<{ $diameter: number }>`
  ${({ $diameter, theme }) => css`
    width: ${$diameter}px;
    height: ${$diameter}px;
    border-radius: 50%;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: absolute;
    top: calc(50% - ${$diameter}px / 2);
    left: calc(50% - ${$diameter}px / 2);
    z-index: 0;
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    width: ${theme.spacing[8]};
    height: ${theme.spacing[8]};
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
    border-radius: 50%;
    border: 1.5px solid ${theme.borderColor.tertiary};

    &[data-type='bolt'] {
      top: 25%;
      left: 0%;
    }

    &[data-type='user'] {
      top: 50%;
      left: calc(100% - 16px);
    }
  `}
`;

export default IllustrationOnboard;
