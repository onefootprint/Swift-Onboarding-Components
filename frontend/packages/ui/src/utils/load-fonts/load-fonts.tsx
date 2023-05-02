import React from 'react';

const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Source+Code+Pro&display=swap';

const LoadFonts = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link href={GOOGLE_FONTS_HREF} rel="stylesheet" />
  </>
);

export default LoadFonts;
