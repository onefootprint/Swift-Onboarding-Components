import { BasePluginProps } from '../base-plugin';

type IdDocCustomData = {
  requestId?: string;
  shouldCollectIdDoc?: boolean;
  shouldCollectSelfie?: boolean;
  shouldCollectConsent?: boolean;
};

export type IdDocProps = BasePluginProps<IdDocCustomData>;
