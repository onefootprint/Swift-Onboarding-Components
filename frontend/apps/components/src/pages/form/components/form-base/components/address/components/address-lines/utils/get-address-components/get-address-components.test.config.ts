export const withGoogleMaps = (type: string, data?: unknown) => {
  global.google = {
    maps: {
      places: {
        // @ts-ignore
        PlacesService: class {
          getDetails = (_: unknown, cb: (dataArg: unknown, status: string) => void) => {
            cb(type === 'success' ? data : null, type === 'success' ? 'OK' : 'ERROR');
          };
        },
      },
    },
  };
};

export const withGoogleMapsError = () => {
  withGoogleMaps('error');
};
