import FileSaver from 'file-saver';

const createFileSaverSpy = () => {
  // @ts-ignore
  global.Blob = function (content: any, options: any) {
    return { content, options };
  };
  const fileSaverSpy = jest.spyOn(FileSaver, 'saveAs');

  return () => {
    return fileSaverSpy.mockImplementation(() => ({}));
  };
};

export default createFileSaverSpy;
