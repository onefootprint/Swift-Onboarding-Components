import { BasePluginProps } from '../base-plugin';

export type TransferRequirements = {
  liveness?: boolean;
  idDoc?: boolean;
};

export type TransferCustomData = {
  missingRequirements: TransferRequirements;
};

export type TransferProps = BasePluginProps<TransferCustomData>;
