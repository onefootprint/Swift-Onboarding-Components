import * as identifyMachine from '../../components/identify-machine-provider';

// This needs to be mocked here and in the test itself as it is a esModule
jest.mock('../../components/identify-machine-provider', () => ({
  __esModule: true,
  ...jest.requireActual('../../components/identify-machine-provider'),
}));

const mockUseIdentifierSuffix = (identifierSuffix: string) =>
  // We don't care here, otherwise we need to mock the whole identifyMachine
  // @ts-ignore
  jest.spyOn(identifyMachine, 'useIdentifyMachine').mockImplementation(() => [
    {
      context: {
        identify: {
          sandboxSuffix: identifierSuffix,
        },
      },
    },
  ]);

export default mockUseIdentifierSuffix;
