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
        const isWarning =
          typeof arg === 'string' && arg.startsWith('Warning: ');

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

export default throwOnConsoleErrors();
