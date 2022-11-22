import { Box } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

type IconApplicationProps = {
  label: string;
};

const IconApplication = ({ label }: IconApplicationProps) => (
  <Container>
    <Box sx={{ width: '50px', height: '50px' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width="100"
        height="100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          transform: 'translate3d(0px, 0px, 0px)',
        }}
      >
        <defs>
          <clipPath id="__lottie_element_26">
            <rect width="100" height="100" x="0" y="0" />
          </clipPath>
        </defs>
        <g clipPath="url(#__lottie_element_26)">
          <g
            transform="matrix(1,0,0,1,25,24.25)"
            opacity="1"
            style={{ display: 'block' }}
          >
            <g
              opacity="1"
              transform="matrix(1,0,0,1,23.542999267578125,27.457000732421875)"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                fillOpacity="0"
                stroke="rgb(11,144,255)"
                strokeOpacity="1"
                strokeWidth="3"
                d=" M-3.7899999618530273,-20.54400062561035 C-3.7899999618530273,-20.54400062561035 -15.97700023651123,-20.54400062561035 -15.97700023651123,-20.54400062561035 C-18.499000549316406,-20.54400062561035 -20.54400062561035,-18.5 -20.54400062561035,-15.979000091552734 C-20.54400062561035,-15.979000091552734 -20.54400062561035,15.97700023651123 -20.54400062561035,15.97700023651123 C-20.54400062561035,18.499000549316406 -18.499000549316406,20.54400062561035 -15.97700023651123,20.54400062561035 C-15.97700023651123,20.54400062561035 15.979000091552734,20.54400062561035 15.979000091552734,20.54400062561035 C18.5,20.54400062561035 20.54400062561035,18.499000549316406 20.54400062561035,15.97700023651123 C20.54400062561035,15.97700023651123 20.54400062561035,10.164999961853027 20.54400062561035,6.567999839782715"
              />
            </g>
            <g
              opacity="1"
              transform="matrix(1,0,0,1,32.347999572753906,18.652000427246094)"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                fillOpacity="0"
                stroke="rgb(11,144,255)"
                strokeOpacity="1"
                strokeWidth="3"
                d=" M-15.652000427246094,7.908999919891357 C-15.652000427246094,10.347999572753906 -15.652000427246094,15.652000427246094 -15.652000427246094,15.652000427246094 C-15.652000427246094,15.652000427246094 -6.708000183105469,15.652000427246094 -6.708000183105469,15.652000427246094 C-6.708000183105469,15.652000427246094 15.652000427246094,-6.708000183105469 15.652000427246094,-6.708000183105469 C15.652000427246094,-6.708000183105469 6.708000183105469,-15.652000427246094 6.708000183105469,-15.652000427246094 C6.708000183105469,-15.652000427246094 6.708000183105469,-15.652000427246094 6.708000183105469,-15.652000427246094 C6.708000183105469,-15.652000427246094 -10.779999732971191,1.8359999656677246 -14.824000358581543,5.880000114440918"
              />
            </g>
          </g>
          <g
            transform="matrix(1,0,0,1,475.75,773)"
            opacity="1"
            style={{ display: 'block' }}
          >
            <g opacity="1" transform="matrix(1,0,0,1,0,0)">
              <path
                strokeLinecap="butt"
                strokeLinejoin="miter"
                fillOpacity="0"
                strokeMiterlimit="4"
                stroke="rgb(100,113,251)"
                strokeOpacity="1"
                strokeWidth="3"
                d="M0 0"
              />
            </g>
          </g>
        </g>
      </svg>
    </Box>
    <Label>{label}</Label>
  </Container>
);

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Label = styled.div`
  color: #0b90ff;
  margin-top: 8px;
`;

export default IconApplication;
