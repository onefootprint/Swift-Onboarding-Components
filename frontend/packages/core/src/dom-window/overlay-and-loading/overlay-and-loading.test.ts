import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import {
  appendLoadingElements,
  appendOverlayContainer,
  removeOverlayAndLoading,
} from './overlay-and-loading';

describe('appendLoadingElements', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should append loading indicator and overlay to the container', () => {
    const uId = 'test';
    appendLoadingElements(uId, container);
    const loadingIndicator = container.querySelector(
      '.footprint-loading-indicator',
    );
    const overlay = container.querySelector('.footprint-overlay');
    expect(loadingIndicator).toBeTruthy();
    expect(overlay).toBeTruthy();
  });

  it('should not append loading indicator or overlay if container is null', () => {
    const uId = 'test'; // @ts-expect-error: null is not a valid HTMLElement
    appendLoadingElements(uId, null);
    const loadingIndicator = container.querySelector(
      '.footprint-loading-indicator',
    );
    const overlay = container.querySelector('.footprint-overlay');
    expect(loadingIndicator).toBeFalsy();
    expect(overlay).toBeFalsy();
  });
});

describe('appendOverlayContainer', () => {
  afterEach(() => {
    // Clean up any created elements after each test
    const overlayContainer = document.getElementById(
      'footprint-overlay-container-test',
    );
    if (overlayContainer) {
      document.body.removeChild(overlayContainer);
    }
  });

  it('should create a new overlay container element', () => {
    const uId = 'test';
    const overlayContainer = appendOverlayContainer(uId);
    expect(overlayContainer).toBeDefined();
    expect(overlayContainer.id).toBe('footprint-overlay-container-test');
    expect(document.body.contains(overlayContainer)).toBe(true);
  });

  it('should reuse an existing overlay container element and clear its innerHTML', () => {
    const uId = 'test';
    const existingOverlayContainer = document.createElement('div');
    existingOverlayContainer.setAttribute(
      'id',
      'footprint-overlay-container-test',
    );
    document.body.appendChild(existingOverlayContainer);
    existingOverlayContainer.innerHTML = '<p>Existing content</p>';

    const overlayContainer = appendOverlayContainer(uId);
    expect(overlayContainer).toBe(existingOverlayContainer);
    expect(overlayContainer.innerHTML).toBe('');
  });
});

describe('removeOverlayAndLoading', () => {
  it('should remove loading indicator for a valid uId', () => {
    const uId = 'test';
    removeOverlayAndLoading(uId);
    // Add your expectations here
  });

  it('should remove overlay container for a valid uId', () => {
    const uId = 'test';
    removeOverlayAndLoading(uId);
    // Add your expectations here
  });

  it('should not throw an error when removing loading indicator for an invalid uId', () => {
    const uId = 'invalidTestId';
    expect(() => removeOverlayAndLoading(uId)).not.toThrow();
  });

  it('should not throw an error when removing overlay container for an invalid uId', () => {
    const uId = 'invalidTestId';
    expect(() => removeOverlayAndLoading(uId)).not.toThrow();
  });
});
