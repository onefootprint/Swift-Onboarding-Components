import { useBifrostMachine } from '@src/components/machine-provider';
import React from 'react';
import PrevButton from 'src/components/prev-button';
import { Events } from 'src/hooks/use-bifrost-machine';
import { Portal } from 'ui';

const PrevHeader = () => {
  const [, send] = useBifrostMachine();

  const handleClick = () => {
    send(Events.navigatedToPrevPage);
  };

  return (
    <Portal selector="#main-header" removeContent>
      <PrevButton onClick={handleClick} />
    </Portal>
  );
};

export default PrevHeader;
