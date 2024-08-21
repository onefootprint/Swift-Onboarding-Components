import { IcoChevronLeft16 } from '@onefootprint/icons';
import type React from 'react';
import styled, { css } from 'styled-components';

type ContainerWithToggleProps = {
  isHidden: boolean;
  onChangeHidden: (hidden: boolean) => void;
  children: React.ReactNode;
};

const ContainerWithToggle = ({ isHidden, onChangeHidden, children }: ContainerWithToggleProps) => (
  <DetailsContainer data-hidden={isHidden}>
    <DetailsWithToggle>
      {children}
      <DetailsToggle data-hidden={isHidden} onClick={() => onChangeHidden(!isHidden)}>
        <IcoChevronLeft16 />
      </DetailsToggle>
    </DetailsWithToggle>
  </DetailsContainer>
);

const DetailsContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 428px;
    height: 100%;
    z-index: ${theme.zIndex.sticky};
    border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.sm} 0 0 ${theme.borderRadius.default};
    transition: transform 0.3s ease-in-out;
    box-shadow: ${theme.elevation[1]};

    @media (max-width: 960px) {
      width: 100%;
      border-radius: ${theme.borderRadius.default};
      border-right: none;
    }

    &[data-hidden='true'] {
      transform: translateX(-100%);
      box-shadow: none;
      border-right: none;
    }
  `}
`;

const DetailsWithToggle = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[4]} ${theme.spacing[4]} 0 ${theme.spacing[4]};
    overflow: hidden;
    margin-right: -35px;
    display: flex;
    flex-direction: column;
    border-radius: ${theme.borderRadius.sm} 0 0 ${theme.borderRadius.sm};

    @media (max-width: 960px) {
      border-radius: ${theme.borderRadius.sm};
    }
  `}
`;

const DetailsToggle = styled.div`
  ${({ theme }) => css`
    display: flex;
    width: 26px;
    height: 32px;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 16px;
    right: -26px;
    border-radius: 0 ${theme.borderRadius.default} ${theme.borderRadius.default}
      0;
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[2]} ${theme.spacing[1]} ${theme.spacing[2]}
      ${theme.spacing[1]};
    box-shadow: 0px 1px 4px 0px #0000001f;
    cursor: pointer;

    @media (max-width: 960px) {
      display: none;
    }

    &[data-hidden='true'] {
      svg {
        transform: scaleX(-1);
      }
    }
  `}
`;

export default ContainerWithToggle;
