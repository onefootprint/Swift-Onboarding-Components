import type { Icon } from '@onefootprint/icons';
import { IcoIdBack40, IcoIdFront40, IcoSelfie40 } from '@onefootprint/icons';
import { IdDocImageTypes } from '@onefootprint/types';

export type ImageIconsType = { [key in IdDocImageTypes]: Icon };
export const ImageIcons: ImageIconsType = {
  [IdDocImageTypes.front]: IcoIdFront40,
  [IdDocImageTypes.back]: IcoIdBack40,
  [IdDocImageTypes.selfie]: IcoSelfie40,
};

export const ID_OUTLINE_HEIGHT_RATIO = 0.56;
export const ID_OUTLINE_WIDTH_RATIO = 0.9;

export const DESKTOP_INTERACTION_BOX_HEIGHT = 280;

export const SLOW_CONNECTION_MESSAGE_TIMEOUT = 15000;

export const TRANSITION_DELAY_LONG = 3000;
export const TRANSITION_DELAY_DEFAULT = 1500;

export const AUTOCAPTURE_START_DELAY = 3000;
export const AUTOCAPTURE_TIMER_INTERVAL = 850; // in milliseconds
export const AUTOCAPTURE_RESTART_DELAY = 1000; // in milliseconds
export const AUTOCAPTURE_TIMER_START_VAL = 3;

export const FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP = 50;
export const FEEFBACK_POSITION_FROM_BOTTOM_MOBILE = 150;

export const CAMERA_LOADING_FEEDBACK_DELAY = 4000;
export const FORCED_UPLOAD_DELAY = 7000;
export const PLAY_CHECK_INTERVAL = 1500;

/** We send a new capture from video every 200 milliseconds for selfie capture */
export const SELFIE_CHECK_INTERVAL = 200; //

/** We will check if 2 tries were successful before considering it a complete success */
export const REQUIRED_SUCCESSES = 2;

/** We wait 150 ms before we change the status from ok to not-ok */
export const STATUS_CHANGE_DELAY = 150;

/**
 * We pass through the graphics params set in batches of this size.
 * This is to make sure that the autocapture algorithm doesn't block the event queue for too long while passing through all params in one go
 */
export const DOC_DETECTION_PARAMS_BATCH_SIZE = 1;

export const CAPTURE_BTN_DEFAULT_OUTER_RADIUS = 72;
export const CAPTURE_BTN_DEFAULT_INNER_RADIUS = 56;
export const COUNTDOWN_TIMER_SIZE = 76;
