import { Box, createFontStyles } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

const Screen = () => {
  return (
    <CaptureContainer>
      <Frame fill="none" height="300" viewBox="0 0 300 300" width="300" xmlns="http://www.w3.org/2000/svg">
        <g fill="#fff">
          <path d="m75.0001 3c0-1.65685-1.3432-3-3-3h-48.3307c-13.0722 0-23.6694 10.5972-23.6694 23.6694v48.3306c0 1.6568 1.34315 3 3 3s3-1.3432 3-3v-48.3306c0-9.7585 7.9109-17.6694 17.6694-17.6694h48.3307c1.6568 0 3-1.34315 3-3z" />
          <path d="m297 75c-1.657 0-3-1.3432-3-3v-48.3306c0-9.7585-7.911-17.6694-17.669-17.6694h-48.331c-1.657 0-3-1.34315-3-3s1.343-3 3-3h48.331c13.072 0 23.669 10.5972 23.669 23.6694v48.3306c0 1.6568-1.343 3-3 3z" />
          <path d="m225 297c0-1.657 1.343-3 3-3h48.331c9.758 0 17.669-7.911 17.669-17.669v-48.331c0-1.657 1.343-3 3-3s3 1.343 3 3v48.331c0 13.072-10.597 23.669-23.669 23.669h-48.331c-1.657 0-3-1.343-3-3z" />
          <path d="m3 225c1.65685 0 3 1.343 3 3v48.331c0 9.758 7.9109 17.669 17.6694 17.669h48.3307c1.6568 0 3 1.343 3 3s-1.3432 3-3 3h-48.3307c-13.0722 0-23.6694-10.597-23.6694-23.669v-48.331c0-1.657 1.34315-3 3-3z" />
        </g>
      </Frame>
      <PromptContainer>Hold still... </PromptContainer>
    </CaptureContainer>
  );
};

const CaptureContainer = styled(motion(Box))`
  background: url('/doc-scan/selfie.webp') no-repeat center center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: relative;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
`;

const Frame = styled.svg`
  width: 80%;
  height: 80%;
  position: absolute;
`;

const PromptContainer = styled(Box)`
  ${({ theme }) => css`
  ${createFontStyles('label-4')}
    position: absolute;
    bottom: ${theme.spacing[3]};
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.5);
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.sm};
    white-space: nowrap;
    color: ${theme.color.quinary};
    box-shadow: ${theme.elevation[2]};
  `}
`;

export default Screen;
