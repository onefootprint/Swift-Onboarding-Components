import { BasePluginProps } from '../base-plugin';

type IdDocCustomData = {
  shouldCollectIdDoc?: boolean;
  shouldCollectSelfie?: boolean;
  shouldCollectConsent?: boolean;
};

export type IdDocProps = BasePluginProps<IdDocCustomData>;
