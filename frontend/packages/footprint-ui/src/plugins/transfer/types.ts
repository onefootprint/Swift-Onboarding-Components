import { BasePluginProps } from '../base-plugin';

export type TransferRequirements = {
  liveness?: boolean;
  idScan?: boolean;
};

export type TransferCustomData = {
  missingRequirements: TransferRequirements;
};

export type TransferProps = BasePluginProps<TransferCustomData>;
