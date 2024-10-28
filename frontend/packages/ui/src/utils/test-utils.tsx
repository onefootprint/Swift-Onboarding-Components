import themes from '@onefootprint/design-tokens';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import DesignSystemProvider from '../../src/utils/design-system-provider/design-system-provider';

const queryCache = new QueryCache();
const queryClient = new QueryClient({ queryCache, defaultOptions: { queries: { retry: false } } });
export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <DesignSystemProvider theme={themes.light}>{children}</DesignSystemProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

const throwOnConsoleErrors = () => {
  // this is a function that will trigger an error if there's any console.error shown during the tests
  // this is to make our tests very strict and catch potential problems that people would just ignore
  const originalConsoleError = console.error;
  let consoleErrorSpy = jest.spyOn(console, 'error');
  let didConsoleError = false;

  const mockConsoleErrorImplementation = () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation((...args) => {
      // Every time a request fails (status code 4xx or 5xx), it shows a console error
      // In this case, if the request came from the mock server, this was intended and therefore
      // we should just remove to make the console cleaner and prevent the to break the test
      const hasIgnored = args.some(arg => {
        const isMockRequest = arg.response?.headers?.xPoweredBy === 'msw';
        const isWarning = typeof arg === 'string' && arg.startsWith('Warning: ');

        if ((typeof arg === 'object' && isMockRequest) || isWarning) {
          return true;
        }
        return false;
      });

      if (!hasIgnored) {
        originalConsoleError(...args);
        didConsoleError = true;
      }
    });
  };

  mockConsoleErrorImplementation();

  beforeEach(() => {
    mockConsoleErrorImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    if (didConsoleError) {
      didConsoleError = false;
      throw new Error(
        'Console error was called - this indicates an issue with the test or the code which needs to be fixed.',
      );
    }
  });

  return mockConsoleErrorImplementation;
};

export const customRender = (Component?: React.ReactNode): ReturnType<typeof render> => {
  throwOnConsoleErrors();
  return render(<Wrapper>{Component}</Wrapper>);
};

const openMenu = async (trigger: HTMLElement) => {
  act(() => {
    fireEvent.click(trigger);
  });
  const testID = trigger.getAttribute('data-testid');
  const select = await screen.findByTestId(`select-${testID}`);
  if (!select) {
    throw new Error('Select not found');
  }
  return select as HTMLElement;
};

const search = async (trigger: HTMLElement, search: string) => {
  const select = await openMenu(trigger);
  const searchInput = within(select).getByDisplayValue('');
  await userEvent.type(searchInput, search);
};

const select = async (trigger: HTMLElement, optionLabel: string) => {
  const select = await openMenu(trigger);
  act(() => {
    const option = within(select).getByRole('option', { name: optionLabel });
    fireEvent.click(option);
  });
};

export const selectEvents = {
  openMenu,
  search,
  select,
};

export const createClipboardSpy = () => {
  const writeTestMockFn = jest.fn().mockImplementation(() => Promise.resolve());
  Object.assign(window.navigator, { clipboard: { writeText: writeTestMockFn } });

  return { writeTestMockFn };
};

export const getPlacePredictions = jest.fn();
export const defaultGoogleMapsData = [
  {
    description: '14 Linda Street, Westborough, MA, USA',
    matched_substrings: [{ length: 15, offset: 0 }],
    place_id:
      'EiUxNCBMaW5kYSBTdHJlZXQsIFdlc3Rib3JvdWdoLCBNQSwgVVNBIjASLgoUChIJgxth39EL5IkRZl4CI3HDMhkQDioUChIJ4Zbf8NEL5IkR-LgPMKdH4Ro',
    reference:
      'EiUxNCBMaW5kYSBTdHJlZXQsIFdlc3Rib3JvdWdoLCBNQSwgVVNBIjASLgoUChIJgxth39EL5IkRZl4CI3HDMhkQDioUChIJ4Zbf8NEL5IkR-LgPMKdH4Ro',
    structured_formatting: {
      main_text: '14 Linda Street',
      main_text_matched_substrings: [{ length: 15, offset: 0 }],
      secondary_text: 'Westborough, MA, USA',
    },
    terms: [
      { offset: 0, value: '14 Linda Street' },
      { offset: 17, value: 'Westborough' },
      { offset: 30, value: 'MA' },
      { offset: 34, value: 'USA' },
    ],
    types: ['street_address', 'geocode'],
  },
];
export const createGoogleMapsSpy = (type = 'success', data = defaultGoogleMapsData) => {
  global.google = {
    maps: {
      places: {
        // @ts-ignore
        AutocompleteService: class {
          getPlacePredictions =
            type === 'opts'
              ? getPlacePredictions
              : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                (_: any, cb: (dataArg: any, status: string) => void) => {
                  setTimeout(() => {
                    cb(type === 'success' ? data : null, type === 'success' ? 'OK' : 'ERROR');
                  }, 500);
                };
        },
      },
    },
  };
};
