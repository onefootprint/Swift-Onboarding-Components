import { SecureFormProps } from './secure-form';
import { SecureRenderProps } from './secure-render';

export enum FootprintComponentKind {
  SecureForm = 'secure-form',
  SecureRender = 'secure-render',
}

export type FootprintComponentRenderProps = {
  kind: FootprintComponentKind;
  props: FootprintComponentProps;
  containerId: string;
};

export type FootprintComponent = {
  render: (props: FootprintComponentRenderProps) => Promise<void>;
  destroy: () => Promise<void>;
};

// TODO: how to handle events?
export type FootprintComponentProps = SecureFormProps | SecureRenderProps;
