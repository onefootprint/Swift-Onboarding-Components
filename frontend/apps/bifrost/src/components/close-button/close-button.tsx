import { useFootprintJs } from 'footprint-provider';
import IcoClose24 from 'icons/ico/ico-close-24';
import React from 'react';
import { IconButton } from 'ui';

const CloseButton = () => {
  const footprint = useFootprintJs();

  const handleCloseClick = () => {
    footprint.close();
  };

  return (
    <IconButton
      iconComponent={IcoClose24}
      ariaLabel="Close window"
      onClick={handleCloseClick}
    />
  );
};

export default CloseButton;
