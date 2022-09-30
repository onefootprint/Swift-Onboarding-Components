import { BasePluginProps } from '../base-plugin';

type IdScanCustomData = {
  documentRequestId: string;
};

export type IdScanProps = BasePluginProps<IdScanCustomData>;
