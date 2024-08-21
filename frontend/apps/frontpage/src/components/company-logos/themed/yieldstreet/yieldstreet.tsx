import styled from 'styled-components';
import type { Logo } from '../logo.type';

const YieldStreet = ({ color }: Logo) => (
  <StyledSvg enableBackground="new 0 0 500.9 75" viewBox="0 0 500.9 75" xmlns="http://www.w3.org/2000/svg">
    <g fill={color}>
      <path d="m211.8 65.5 1.2 8.5h-9.5l-1.2-7.6h-.2c-3.4 5.3-10.3 8.7-18.1 8.7-15.3 0-25.8-12.2-25.8-27.5s10.5-27.5 25.8-27.5c8 0 14.8 3.6 18.1 8.7h.2v-28.8h9.5zm-9-17.9c0-10.6-6.8-18.7-17.3-18.7-10.6 0-17.4 8-17.4 18.7s6.9 18.7 17.4 18.7c10.6-.1 17.3-8.2 17.3-18.7z" />
      <path d="m290.5 7.5h-8.8v13.9h-13.7v8.8h13.7v16.7c0 14.9 12.1 27 27 27h1v-8c-10.6 0-19.2-8.6-19.2-19.2v-16.5h13.9v-8.8h-13.9z" />
      <path d="m481.8 7.5h-8.8v13.9h-13.7v8.8h13.7v16.7c0 14.9 12.1 27 26.9 27h1v-8c-10.6 0-19.2-8.6-19.2-19.2v-16.5h13.9v-8.8h-13.9z" />
      <path d="m323.8 29.4h-.2v-7.6h-9.5v29.6.4 22.1h9.5v-7l.1-18.1c1.1-10.6 10.1-18.9 21-18.9v-8.8c-8.1-0-15.5 3.2-20.9 8.3z" />
      <path d="m217.7 53.6h9.5c.2 8.7 6.3 13.3 15.1 13.3 9.1 0 14.4-3 14.4-8.3 0-13.1-36.8 1.5-36.8-22.4 0-11.1 11.1-16 22.2-16 13.1 0 23 7.2 23.1 20.1h-9.4c0-8.1-6-12-13.7-12-6 0-12.9 1.7-12.9 7.6 0 13.7 36.8-.8 36.8 22.4 0 11.9-12 16.7-24 16.7-13.2-.1-23.8-6.9-24.3-21.4z" />
      <path d="m75.8 21.1h-9.5v52.9h9.5z" />
      <path d="m37.9 33h-.2l-24.7-33h-13l32.3 41.9v32h10.3v-32l32.4-41.9h-12.3z" />
      <path d="m152.7 0h-9.5v74h9.5z" />
      <path d="m111 66.3c-9.8 0-16.7-7-17.7-16.4h43.3c0-18.5-9.5-29.8-26.4-29.8-15.7 0-26.9 11.7-26.9 27.4s11.7 27.4 27.4 27.4c8.6 0 15.1-3 19.4-7.3l-6.3-6.3c-2.7 3.2-7.2 5-12.8 5zm-.6-37.8c9 0 14.9 5 15.8 13.4h-32.4c1.9-7.8 7.9-13.4 16.6-13.4z" />
      <path d="m372.2 66.3c-9.8 0-16.7-7-17.7-16.4h43.3c0-18.5-9.5-29.8-26.4-29.8-15.7 0-26.9 11.7-26.9 27.4s11.7 27.4 27.4 27.4c8.6 0 15.1-3 19.4-7.3l-6.3-6.3c-2.6 3.2-7.1 5-12.8 5zm-.6-37.8c9 0 14.9 5 15.8 13.4h-32.4c2-7.8 8-13.4 16.6-13.4z" />
      <path d="m431.5 66.3c-9.8 0-16.7-7-17.7-16.4h43.3c0-18.5-9.5-29.8-26.4-29.8-15.7 0-26.9 11.7-26.9 27.4s11.7 27.4 27.4 27.4c8.6 0 15.1-3 19.4-7.3l-6.3-6.3c-2.7 3.2-7.2 5-12.8 5zm-.6-37.8c9 0 14.9 5 15.8 13.4h-32.4c1.9-7.8 7.9-13.4 16.6-13.4z" />
    </g>
  </StyledSvg>
);

const StyledSvg = styled.svg`
  height: auto;
  width: 110px;
`;

export default YieldStreet;
