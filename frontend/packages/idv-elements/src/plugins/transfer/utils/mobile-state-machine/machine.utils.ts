import type { MachineContext } from './types';

/*
  If not running on mobile:
    complete
  If only has liveness req:
    complete
  If device does not support webauthn:
    complete
  If running in social media:
    send SMS
  else:
    open new tab
*/
export const shouldSendSms = (context: MachineContext) =>
  !!context.missingRequirements.idDoc && !!context.isSocialMediaBrowser;

export const shouldOpenNewTab = (context: MachineContext) =>
  !context.isSocialMediaBrowser &&
  !!context.missingRequirements.liveness &&
  context.device.hasSupportForWebauthn;
