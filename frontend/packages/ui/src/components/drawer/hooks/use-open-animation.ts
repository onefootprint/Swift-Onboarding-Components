import { useEffect, useState } from 'react';

// TODO: Move to react-transition-group
// https://linear.app/footprint/issue/FP-1516/add-react-transition-group

export enum State {
  open = 'open',
  opening = 'opening',
  closed = 'closed',
  closing = 'closing',
}

const OPEN_CLOSE_DELAY = 200;

const useOpenAnimation = (open = false) => {
  const [visibleState, setVisibleState] = useState<State>(
    open ? State.open : State.closed,
  );

  useEffect(() => {
    if (visibleState === State.open && !open) {
      setVisibleState(State.closing);
      setTimeout(() => {
        setVisibleState(State.closed);
      }, OPEN_CLOSE_DELAY);
    }

    if (visibleState === State.closed && open) {
      setVisibleState(State.opening);
      setTimeout(() => {
        setVisibleState(State.open);
      }, OPEN_CLOSE_DELAY);
    }
  }, [visibleState, open]);

  return visibleState;
};

export default useOpenAnimation;
