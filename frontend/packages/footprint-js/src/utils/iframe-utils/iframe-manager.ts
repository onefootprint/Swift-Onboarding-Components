import type { Props } from '../../types/components';
import { sanitizeAndValidateProps } from '../prop-utils';
import type { Iframe } from './types';

type Iframes = Record<string, IframeEntry>;
type IframeEntry = {
  iframe: Iframe;
  secondaryIframes: Record<string, Iframe>; // keyed by a unique id
};

type IframeManager = {
  getOrCreate: (iframe: Iframe) => Iframe;
  getOrCreateSecondary: (primary: Iframe, secondary: Iframe) => Iframe;
  remove: (iframe: Iframe) => void;
  removeSecondary: (primary: Iframe, secondary: Iframe) => void;
};

export const getIframeKey = (props: Props): string => {
  const sanitizedProps = sanitizeAndValidateProps(props);
  return JSON.stringify(sanitizedProps);
};

/**
 * Needed to support iframes launching other iframes (e.g. clicking a
 * notification banner launches a modal). Keeps track of primary and
 * secondaryIframes iframes to destroy all secondaryIframes when the primary is destroyed
 */
const initIframeManager = (): IframeManager => {
  const iframes: Iframes = Object.create(null);

  const getOrCreate = (iframe: Iframe): Iframe => {
    const key = getIframeKey(iframe.props);
    // Don't re-add if already exists with same props
    const existingEntry = Object.values(iframes).find(iframeEntry => getIframeKey(iframeEntry.iframe.props) === key);
    if (existingEntry) {
      return existingEntry.iframe;
    }
    iframes[key] = {
      iframe,
      secondaryIframes: {},
    };

    return iframe;
  };

  const getOrCreateSecondary = (primary: Iframe, secondary: Iframe) => {
    const primaryKey = getIframeKey(primary.props);
    const secondaryKey = getIframeKey(secondary.props);
    if (!iframes[primaryKey]) {
      throw new Error('iframe manager: primary iframe does not exist while adding secondary');
    }

    const { secondaryIframes } = iframes[primaryKey];
    const existingEntry = Object.values(secondaryIframes).find(
      iframeEntry => getIframeKey(iframeEntry.props) === secondaryKey,
    );
    if (existingEntry) {
      return existingEntry;
    }
    secondaryIframes[secondaryKey] = secondary;
    return secondary;
  };

  const remove = (iframe: Iframe) => {
    const key = getIframeKey(iframe.props);
    const iframeEntry = iframes[key];
    if (!iframeEntry) {
      return;
    }

    // Delete and destroy all secondaryIframes
    Object.keys(iframeEntry.secondaryIframes).forEach(secondaryKey => {
      const secondary = iframeEntry.secondaryIframes[secondaryKey];
      secondary.destroy();
    });

    delete iframes[key];
  };

  const removeSecondary = (primary: Iframe, secondary: Iframe) => {
    const primaryKey = getIframeKey(primary.props);
    const secondaryKey = getIframeKey(secondary.props);
    if (!iframes[primaryKey]) {
      throw new Error('iframe manager: primary iframe does not exist while removing secondary');
    }

    const { secondaryIframes } = iframes[primaryKey];
    const entry = secondaryIframes[secondaryKey];
    if (entry) {
      entry.destroy();
      delete secondaryIframes[secondaryKey];
    }
  };

  return {
    getOrCreate,
    getOrCreateSecondary,
    remove,
    removeSecondary,
  };
};

export default initIframeManager;
