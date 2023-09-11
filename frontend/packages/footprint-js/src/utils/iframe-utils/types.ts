import type { Props } from '../../types/components';

export type Iframe = {
  props: Props;
  isRendered: boolean;
  render: () => Promise<void>;
  destroy: () => Promise<void>;
  registerEvent: (
    event: 'renderSecondary' | 'destroy',
    callback: (args?: any) => void,
  ) => void; // Used to register a callback from the iframe manager
};
