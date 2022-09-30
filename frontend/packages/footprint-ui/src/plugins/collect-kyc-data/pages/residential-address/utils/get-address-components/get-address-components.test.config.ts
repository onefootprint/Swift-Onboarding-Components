export const withGoogleMaps = (type: string, data?: any) => {
  global.google = {
    maps: {
      places: {
        // @ts-ignore
        PlacesService: class {
          getDetails = (_: any, cb: (dataArg: any, status: string) => void) => {
            cb(
              type === 'success' ? data : null,
              type === 'success' ? 'OK' : 'ERROR',
            );
          };
        },
      },
    },
  };
};

export const withGoogleMapsError = () => {
  withGoogleMaps('error');
};
