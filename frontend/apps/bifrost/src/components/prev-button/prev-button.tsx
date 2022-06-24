import IcoArrowLeftSmall24 from 'icons/ico/ico-arrow-left-small-24';
import React from 'react';
import { IconButton } from 'ui';

type PrevButtonProps = {
  onClick: () => void;
};

const PrevButton = ({ onClick }: PrevButtonProps) => (
  <IconButton
    iconComponent={IcoArrowLeftSmall24}
    aria-label="Previous window"
    onClick={onClick}
  />
);

export default PrevButton;
