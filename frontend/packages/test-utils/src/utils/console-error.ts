const throwOnConsoleErrors = () => {
  const originalConsoleError = console.error;
  let consoleErrorSpy = jest.spyOn(console, 'error');
  let didConsoleError = false;

  const mockConsoleErrorImplementation = () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation((...args) => {
      // except for this error we don't care about (which should not even exist in react in the first
      // place, see here: https://github.com/reactwg/react-18/discussions/82), we want to explode on console.errors
      if (
        !args.some(
          arg =>
            typeof arg === 'string' &&
            arg.includes(
              "Can't perform a React state update on an unmounted component",
            ),
        )
      ) {
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
