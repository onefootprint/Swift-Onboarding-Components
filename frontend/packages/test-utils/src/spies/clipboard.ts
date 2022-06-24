const createClipboardSpy = () => {
  const writeTestMockFn = jest.fn().mockImplementation(() => Promise.resolve());

  Object.assign(window.navigator, {
    clipboard: {
      writeText: writeTestMockFn,
    },
  });

  return { writeTestMockFn };
};

export default createClipboardSpy;
