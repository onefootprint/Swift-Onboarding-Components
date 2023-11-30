import type { L10n } from './l10n';
import type { IdDocOutcome } from './sandbox-outcomes-type';

export type D2PMeta = {
  sessionId?: string; // bifrost session id
  opener?: string; // the device type that opened/generated the d2p session
  styleParams?: string; // FootprintAppearance style params stringified
  sandboxIdDocOutcome?: IdDocOutcome; // Sandbox outcome for id doc
  redirectUrl?: string; // Redirect url for the d2p session, useful especially for app clip
  l10n?: L10n; // localization from bifrost
};
