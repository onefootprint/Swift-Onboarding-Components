import type { Props } from '../../types/components';

interface RegisterEvent {
  (event: 'renderSecondary', callback: (args: Props) => void): void;
  (event: 'destroy', callback: () => void): void;
}

export type Iframe = {
  props: Props;
  isRendered: boolean;
  render: () => Promise<void>;
  destroy: () => Promise<void>;
  registerEvent: RegisterEvent; // Used to register a callback from the iframe manager
};
