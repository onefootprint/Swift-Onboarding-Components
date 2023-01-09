import { BasePluginProps } from '../base-plugin';

type IdDocCustomData = {
  requestId?: string;
  shouldCollectIdDoc?: boolean;
  shouldCollectSelfie?: boolean;
};

export type IdDocProps = BasePluginProps<IdDocCustomData>;
