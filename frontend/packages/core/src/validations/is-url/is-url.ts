const patternWithProtocol =
  /^(https?:\/\/)(?!-)(?:[A-Za-z0-9-]{1,63}\.)+(?!-)[A-Za-z0-9]{2,}(?::\d{2,5})?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$/i;
const pattern =
  /^(?:(https?:\/\/)?(?!-)(?:[A-Za-z0-9-]{1,63}\.)+(?!-)[A-Za-z0-9]{2,}(?::\d{2,5})?)?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$/i;
const isURL = (value: string): boolean => pattern.test(value);
export const isURLWithProtocol = (value: string): boolean => patternWithProtocol.test(value);
export default isURL;
