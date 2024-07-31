import React from 'react';
import styled, { css } from 'styled-components';

import Line from '../components/line';
import Background from './components/background';

type KycIllustrationProps = {
  isHovered?: boolean;
};

const KycIllustration = ({ isHovered = false }: KycIllustrationProps) => (
  <Container>
    <StyledBackground isHovered={isHovered} />
    <CardBack $isHovered={isHovered}>
      <Dots>
        <Line darkColor="#303030" lightColor="#CDCDCD" top="10px" left="0%" width={10} height={10} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="10px" left="50%" width={10} height={10} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="10px" left="100%" width={10} height={10} />
      </Dots>
      <Line lightColor="#ECECF1" darkColor="#282828" top="10px" left="50%" width={100} />
      <Screen>
        <Line darkColor="#303030" lightColor="#CDCDCD" top="40px" left="50%" width={100} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="60px" left="50%" width={80} />
        <Line darkColor="#212121" lightColor="#CDCDCD" top="90px" left="50%" width={100} />
      </Screen>
    </CardBack>
    <FaceId $isHovered={isHovered}>
      <svg width="33" height="34" viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.671502 10.8109C1.09076 10.8109 1.31786 10.5663 1.31786 10.1471V5.44788C1.31786 3.1769 2.50575 1.989 4.77673 1.989H9.49338C9.91264 1.989 10.1572 1.7619 10.1572 1.34264C10.1572 0.923387 9.91264 0.696289 9.49338 0.696289H4.7418C1.64977 0.696289 0.0251465 2.30344 0.0251465 5.378V10.1471C0.0251465 10.5663 0.252244 10.8109 0.671502 10.8109ZM31.7839 10.8109C32.2032 10.8109 32.4303 10.5663 32.4303 10.1471V5.378C32.4303 2.33838 30.8231 0.696289 27.7311 0.696289H22.962C22.5428 0.696289 22.2982 0.923387 22.2982 1.34264C22.2982 1.7619 22.5428 1.989 22.962 1.989H27.6787C29.8798 1.989 31.1376 3.1769 31.1376 5.44788V10.1471C31.1376 10.5663 31.3647 10.8109 31.7839 10.8109ZM14.804 19.2484H14.9612C16.3762 19.2484 17.0924 18.5497 17.0924 17.1172V11.7542C17.0924 11.3524 16.9003 11.1603 16.4985 11.1603C16.1142 11.1603 15.9045 11.3524 15.9045 11.7542V17.2744C15.9045 17.7461 15.5202 18.0431 15.1359 18.0431H14.5419C14.21 18.0431 13.9655 18.2876 13.9655 18.6196C13.9655 19.0388 14.2275 19.2484 14.804 19.2484ZM9.94758 15.2306C10.4717 15.2306 10.8036 14.8986 10.8036 14.3746V12.0512C10.8036 11.5096 10.4717 11.1777 9.94758 11.1777C9.44098 11.1777 9.10907 11.5271 9.10907 12.0512V14.3746C9.10907 14.8986 9.44098 15.2306 9.94758 15.2306ZM22.3506 15.2306C22.8572 15.2306 23.1891 14.8986 23.1891 14.3746V12.0512C23.1891 11.5271 22.8572 11.1777 22.3506 11.1777C21.8265 11.1777 21.4772 11.5096 21.4772 12.0512V14.3746C21.4772 14.8986 21.8265 15.2306 22.3506 15.2306ZM16.0792 24.594C18.0008 24.594 19.9224 23.7904 21.3374 22.3754C21.4422 22.2881 21.547 22.1308 21.547 21.9037C21.547 21.5544 21.285 21.3273 20.9706 21.3273C20.7784 21.3273 20.6212 21.3797 20.3941 21.6242C19.3459 22.6724 17.7213 23.4236 16.0792 23.4236C14.4371 23.4236 12.83 22.6724 11.7644 21.6242C11.5547 21.3971 11.3975 21.3273 11.1879 21.3273C10.8734 21.3273 10.6114 21.5544 10.6114 21.9037C10.6114 22.1134 10.7162 22.2706 10.821 22.3754C12.2011 23.8079 14.1576 24.594 16.0792 24.594ZM4.7418 33.1014H9.49338C9.91264 33.1014 10.1572 32.8743 10.1572 32.4551C10.1572 32.0358 9.91264 31.8087 9.49338 31.8087H4.77673C2.50575 31.8087 1.31786 30.6208 1.31786 28.3324V23.6507C1.31786 23.2314 1.09076 22.9694 0.671502 22.9694C0.252244 22.9694 0.0251465 23.2314 0.0251465 23.6507V28.4022C0.0251465 31.4943 1.64977 33.1014 4.7418 33.1014ZM22.962 33.1014H27.7311C30.8231 33.1014 32.4303 31.4419 32.4303 28.4022V23.6507C32.4303 23.2314 32.2032 22.9694 31.7839 22.9694C31.3647 22.9694 31.1376 23.2314 31.1376 23.6507V28.3324C31.1376 30.6208 29.8798 31.8087 27.6787 31.8087H22.962C22.5428 31.8087 22.2982 32.0358 22.2982 32.4551C22.2982 32.8743 22.5428 33.1014 22.962 33.1014Z"
          fill="#8B8B8B"
        />
      </svg>
    </FaceId>
  </Container>
);

const StyledBackground = styled(Background)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const Dots = styled.div`
  position: absolute;
  top: 0;
  left: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 2px;
  width: 32px;
  height: 30px;
`;

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: relative;
    padding: ${theme.spacing[7]} ${theme.spacing[8]} 0 ${theme.spacing[8]};
    background: linear-gradient(
      180deg,
      ${theme.backgroundColor.primary} 0%,
      ${theme.backgroundColor.secondary} 100%
    );
  `}
`;

const CardBack = styled.div<{ $isHovered: boolean }>`
  ${({ theme, $isHovered }) => css`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 7px;
    background: radial-gradient(
      100% 100% at 50% 80%,
      ${theme.backgroundColor.secondary} 0%,
      ${theme.backgroundColor.primary} 100%
    );
    padding: ${theme.spacing[8]} ${theme.spacing[6]} 0 ${theme.spacing[6]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    transition: all 0.2s ease-in-out;

    ${
      $isHovered &&
      css`
      box-shadow: ${theme.elevation[3]};
      transform: translateY(-2px);
    `
    }
  `}
`;

const Screen = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 8px;
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const FaceId = styled.div<{ $isHovered: boolean }>`
  ${({ theme, $isHovered }) => css`
    position: absolute;
    bottom: calc(-1 * ${theme.spacing[4]});
    left: ${theme.spacing[6]};
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[5]};
    border-radius: 12px;
    box-shadow: ${theme.elevation[3]};
    transition: all 0.2s ease-in-out;

    ${
      $isHovered &&
      css`
      box-shadow: ${theme.elevation[3]};
      transform: rotate(-4deg) translateX(-5px) translateY(-5px);
    `
    }

    svg {
      width: 48px;
      height: 48px;

      path {
        fill: ${theme.color.tertiary};
      }
    }
  `}
`;

export default KycIllustration;
