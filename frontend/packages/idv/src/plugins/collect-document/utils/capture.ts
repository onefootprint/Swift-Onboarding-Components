type ForwardVideoRef =
  | ((instance: HTMLVideoElement | null) => void)
  | React.RefObject<HTMLVideoElement>
  | null
  | undefined;

/* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video */
export const VideoEvents = [
  'canplay', // The canplay event is fired when the user agent can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content.
  'canplaythrough', // The canplaythrough event is fired when the user agent can play the media, and estimates that enough data has been loaded to play the media up to its end without having to stop for further buffering of content.
  'emptied', // The emptied event is fired when the media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it.
  'ended', // The ended event is fired when playback or streaming has stopped because the end of the media was reached or because no further data is available.
  'error', // The error event is fired when the resource could not be loaded due to an error (for example, a network connectivity problem).
  'pause', // The pause event is sent when a request to pause an activity is handled and the activity has entered its paused state, most commonly after the media has been paused through a call to the element's pause() method.
  'playing', // The playing event is fired after playback is first started, and whenever it is restarted. For example it is fired when playback resumes after having been paused or delayed due to lack of data.
  'stalled', // The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
  'suspend', // The suspend event is fired when media data loading has been suspended.
];
const nonPlayingVideoEventTypes = new Set(['ended', 'error', 'pause', 'stalled', 'suspend']);

const isHtmlVideoElement = (x?: unknown): x is HTMLVideoElement => Boolean(x) && x instanceof HTMLVideoElement;

export const isNotAllowedError = (x?: unknown) => x === 'NotAllowedError';
export const isDesktop = (x: unknown): x is 'desktop' => x === 'desktop';
export const isDocument = (x: unknown): x is 'document' => x !== 'face';
export const isFace = (x: unknown): x is 'face' => x === 'face';
export const isMobile = (x: unknown): x is 'mobile' => x === 'mobile';
export const isString = (x: unknown): x is string => typeof x === 'string';
export const isBlob = (x: unknown): x is Blob => x instanceof Blob;
export const isFile = (x: unknown): x is File => x instanceof File;
export const isFileOrBlob = (x: unknown): x is File | Blob => isFile(x) || isBlob(x);

export const isFunction = (x?: unknown): x is Function => typeof x === 'function';

export const isNonPlayingVideoEvent = (e: Event): boolean => nonPlayingVideoEventTypes.has(e.type);

export const hasFileReaderSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'FileReader' in window && 'readAsDataURL' in new FileReader();
};

export const getHtmlVideoElement = (x: ForwardVideoRef): HTMLVideoElement | undefined => {
  if (!x) return undefined;

  if (isFunction(x)) {
    const res = x(null);
    return isHtmlVideoElement(res) ? res : undefined;
  }

  return Object.prototype.hasOwnProperty.call(x, 'current') && isHtmlVideoElement(x.current) ? x.current : undefined;
};

export const clearCanvas = (
  logger: (s: string) => void,
  ref: React.MutableRefObject<HTMLCanvasElement | undefined>,
) => {
  if (!ref.current) {
    logger('Canvas could not be cleared. Ref undefined');
    return;
  }

  const context = ref.current.getContext('2d');
  if (!context) {
    logger('Canvas could not be cleared. Context undefined');
    return;
  }

  context.clearRect(0, 0, ref.current.width, ref.current.height);
};

export const bytesToMegabytes = (b: number) => (b / (1024 * 1024)).toFixed(2);
