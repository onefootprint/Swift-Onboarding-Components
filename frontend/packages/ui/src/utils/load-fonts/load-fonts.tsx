import React from 'react';

type LoadFontsProps = {
  src: string;
};

const LoadFonts = ({ src }: LoadFontsProps) => (
  <>
    {isGoogleFont(src) ? (
      <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
      </>
    ) : null}
    <link href={src} rel="stylesheet" />
  </>
);

const isGoogleFont = (src: string) => src?.startsWith('https://fonts.googleapis');

export default LoadFonts;
