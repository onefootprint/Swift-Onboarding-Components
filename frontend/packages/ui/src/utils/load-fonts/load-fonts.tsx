import React from 'react';

type LoadFontsProps = {
  href?: string;
};

const DEFAULT_FONT =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Source+Code+Pro&display=swap';

const LoadFonts = ({ href }: LoadFontsProps) => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link href={href || DEFAULT_FONT} rel="stylesheet" />
  </>
);

export default LoadFonts;
