import styled, { css } from '@onefootprint/styled';
import { motion } from 'framer-motion';
import React from 'react';

import { CheckIconVariants } from '../transitions';

const CustomCheckIcon = () => (
  <CheckContainer
    variants={CheckIconVariants}
    initial="initial"
    animate="animate"
  >
    <svg
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.92907 0.000221893C8.79648 0.00417279 8.67063 0.059589 8.57819 0.15473L3.3249 5.40802L1.64425 3.72736C1.59722 3.67838 1.54089 3.63928 1.47856 3.61234C1.41623 3.5854 1.34915 3.57116 1.28125 3.57047C1.21334 3.56978 1.14599 3.58265 1.08312 3.60831C1.02025 3.63398 0.963141 3.67193 0.915126 3.71995C0.86711 3.76796 0.829158 3.82508 0.803491 3.88794C0.777825 3.95081 0.764961 4.01817 0.765651 4.08607C0.766342 4.15397 0.780574 4.22105 0.807515 4.28338C0.834455 4.34571 0.873561 4.40204 0.922544 4.44907L2.96405 6.49057C3.05977 6.58625 3.18956 6.64 3.3249 6.64C3.46024 6.64 3.59004 6.58625 3.68575 6.49057L9.29989 0.876434C9.37364 0.804746 9.42402 0.712449 9.44441 0.611639C9.4648 0.51083 9.45427 0.406211 9.41418 0.311492C9.3741 0.216774 9.30633 0.136374 9.21977 0.0808307C9.1332 0.025287 9.03188 -0.00280993 8.92907 0.000221893Z"
        fill="white"
      />
    </svg>
  </CheckContainer>
);

const CheckContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translate(50%, -50%);
    top: ${theme.spacing[2]};
    right: ${theme.spacing[2]};
    background-color: ${theme.color.success};
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[2]} solid ${theme.backgroundColor.primary};
    width: 20px;
    height: 20px;
  `}
`;

export default CustomCheckIcon;
