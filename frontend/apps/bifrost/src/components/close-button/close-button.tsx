import { useFootprintJs } from 'footprint-provider';
import IcoClose16 from 'icons/ico/ico-close-16';
import React from 'react';
import { IconButton } from 'ui';

const CloseButton = () => {
  const footprint = useFootprintJs();

  const handleCloseClick = () => {
    footprint.close();
  };

  return (
    <IconButton
      iconComponent={IcoClose16}
      ariaLabel="Close window"
      onClick={handleCloseClick}
    />
  );
};

export default CloseButton;
