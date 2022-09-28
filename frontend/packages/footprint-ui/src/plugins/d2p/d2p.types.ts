import { BasePluginProps } from '../base-plugin';

export type HandoffRequirements = {
  webAuthn?: boolean;
  idScan?: boolean;
};

export type D2PCustomData = {
  missingRequirements: HandoffRequirements;
};

export type D2PPluginProps = BasePluginProps<D2PCustomData>;
