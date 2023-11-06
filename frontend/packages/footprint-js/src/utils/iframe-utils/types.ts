import type { Props } from '../../types/components';

export type OnDestroy = () => void;
export type OnRenderSecondary = (secondaryProps: Props) => void;

export type Iframe = {
  props: Props;
  isRendered: boolean;
  render: () => Promise<void>;
  destroy: () => Promise<void>;
  registerOnDestroy: (callback: OnDestroy) => void;
  registerOnRenderSecondary: (callback: OnRenderSecondary) => void;
};
