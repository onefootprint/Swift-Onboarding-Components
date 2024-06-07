import React from 'react';
import styled from 'styled-components';

type BloomLogoProps = {
  color?: string;
};

const BloomLogo = ({ color }: BloomLogoProps) => (
  <StyledSvg width="361" height="102" viewBox="0 0 361 102" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M28.92 0H73.08C89.0521 0 102 12.9479 102 28.92V73.08C102 89.0521 89.0521 102 73.08 102H28.92C12.9479 102 0 89.0521 0 73.08V28.92C0 12.9479 12.9479 0 28.92 0ZM68.94 29.88L69.9 29.56C65.4059 25.2179 59.9871 21.9496 54.05 20L52.74 20.44C47.7512 22.1002 43.0886 24.6142 38.96 27.87L43.03 28.57C48.5579 29.5269 53.7296 31.9436 58.01 35.57C61.3379 33.1207 65.0249 31.2013 68.94 29.88ZM83 31.1V49.51C83 69.85 64.7 85.19 44.9 81.43C38.56 58.16 54.18 34.64 77.9 31.73L83 31.1ZM19 32.95L28.6 31.65C37.8266 30.4067 47.1832 32.6807 54.81 38.02C49.0267 43.27 44.7074 49.9331 42.2759 57.3558C39.8443 64.7785 39.384 72.7058 40.94 80.36L39.82 79.96C34.836 78.2228 30.3782 75.2415 26.8693 71.2986C23.3605 67.3557 20.9168 62.582 19.77 57.43C19.26 55.17 19 52.86 19 50.55V32.95Z"
      fill={color}
    />
    <path
      d="M128.424 84.332C124.65 84.332 122 82.0859 122 77.6836V24.4512C122 19.959 124.74 17.5781 128.559 17.5781C132.422 17.5781 135.117 19.959 135.117 24.4512V43.5879H135.387C138.037 37.8828 143.428 34.4688 150.256 34.4688C162.43 34.4688 169.842 43.7676 169.842 59.3105C169.842 74.8086 162.475 84.1523 150.301 84.1523C143.248 84.1523 137.902 80.7383 135.207 75.123H134.938V77.6836C134.938 82.041 132.242 84.332 128.424 84.332ZM145.809 73.5957C152.322 73.5957 156.41 68.1152 156.41 59.3105C156.41 50.5508 152.322 44.9805 145.809 44.9805C139.43 44.9805 135.072 50.6855 135.072 59.3105C135.072 68.0254 139.43 73.5957 145.809 73.5957Z"
      fill={color}
    />
    <path
      d="M179.863 84.332C176.045 84.332 173.304 81.9961 173.304 77.5039V24.4512C173.304 19.959 176.045 17.5781 179.863 17.5781C183.726 17.5781 186.422 19.959 186.422 24.4512V77.5039C186.422 81.9961 183.726 84.332 179.863 84.332Z"
      fill={color}
    />
    <path
      d="M213.693 84.4219C199.138 84.4219 189.839 75.0781 189.839 59.2656C189.839 43.6777 199.273 34.1992 213.693 34.1992C228.113 34.1992 237.546 43.6328 237.546 59.2656C237.546 75.123 228.247 84.4219 213.693 84.4219ZM213.693 74.4043C220.117 74.4043 224.204 68.9688 224.204 59.3105C224.204 49.7422 220.072 44.2168 213.693 44.2168C207.314 44.2168 203.136 49.7422 203.136 59.3105C203.136 68.9688 207.224 74.4043 213.693 74.4043Z"
      fill={color}
    />
    <path
      d="M262.751 84.4219C248.196 84.4219 238.897 75.0781 238.897 59.2656C238.897 43.6777 248.331 34.1992 262.751 34.1992C277.171 34.1992 286.605 43.6328 286.605 59.2656C286.605 75.123 277.306 84.4219 262.751 84.4219ZM262.751 74.4043C269.175 74.4043 273.263 68.9688 273.263 59.3105C273.263 49.7422 269.13 44.2168 262.751 44.2168C256.372 44.2168 252.194 49.7422 252.194 59.3105C252.194 68.9688 256.282 74.4043 262.751 74.4043Z"
      fill={color}
    />
    <path
      d="M296.266 84.332C292.358 84.332 289.708 81.9512 289.708 77.5039V40.9375C289.708 36.5352 292.313 34.2441 296.042 34.2441C299.77 34.2441 302.376 36.5352 302.376 40.9375V43.9473H302.645C304.667 38.1523 309.833 34.334 316.391 34.334C323.354 34.334 328.206 37.9277 329.823 44.2168H330.092C332.249 38.1523 337.999 34.334 345.051 34.334C354.485 34.334 360.819 40.8027 360.819 50.5059V77.5039C360.819 81.9512 358.124 84.332 354.216 84.332C350.352 84.332 347.702 81.9512 347.702 77.5039V53.7852C347.702 48.2148 344.917 45.1602 339.841 45.1602C334.854 45.1602 331.575 48.7988 331.575 54.1445V77.5039C331.575 81.9512 329.149 84.332 325.241 84.332C321.378 84.332 318.952 81.9512 318.952 77.5039V53.3809C318.952 48.2148 316.032 45.1602 311.18 45.1602C306.194 45.1602 302.825 48.9336 302.825 54.3242V77.5039C302.825 81.9512 300.13 84.332 296.266 84.332Z"
      fill={color}
    />
  </StyledSvg>
);

const StyledSvg = styled.svg`
  height: 28px;
  width: 94px;
`;

export default BloomLogo;
