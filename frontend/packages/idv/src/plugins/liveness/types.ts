import type { BasePluginProps } from '../base-plugin';

type LivenessContext = {
  isTransfer?: boolean;
};

export type LivenessProps = BasePluginProps<LivenessContext>;
