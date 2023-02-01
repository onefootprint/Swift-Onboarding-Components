import { Img } from '@react-email/img';
import React from 'react';

const FootprintLogo = () => {
  return (
    <Img
      src="/static/logo-fp-default.svg"
      width="100"
      height="21"
      alt="Footprint"
      style={logo}
    />
  );
};

const logo = {
  margin: '0 auto',
};

export default FootprintLogo;
