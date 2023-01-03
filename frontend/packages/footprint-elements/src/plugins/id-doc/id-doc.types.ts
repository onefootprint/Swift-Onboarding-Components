import { BasePluginProps } from '../base-plugin';

type IdDocCustomData = {
  requestId?: string;
};

export type IdDocProps = BasePluginProps<IdDocCustomData>;
