import * as Linking from 'expo-linking';

const mockUrl = (url: string) => {
  jest.spyOn(Linking, 'useURL').mockImplementationOnce(() => url);
};

export default mockUrl;
