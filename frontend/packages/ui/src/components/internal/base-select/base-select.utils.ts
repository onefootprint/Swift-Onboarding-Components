/* eslint-disable no-param-reassign */
import type { Modifier } from 'react-popper';

const modifiers: Modifier<string, Record<string, unknown>>[] = [
  {
    name: 'sameWidth',
    enabled: true,
    phase: 'beforeWrite',
    requires: ['computeStyles'],
    fn({ state }) {
      state.styles.popper.width = `${state.rects.reference.width}px`;
    },
    effect({ state }) {
      // @ts-ignore
      state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
    },
  },
];

export default modifiers;
