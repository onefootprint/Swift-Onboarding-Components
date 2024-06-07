import capitalize from 'lodash/capitalize';

const createStringList = (items: string[], connector?: string, finalConnector?: string) => {
  const conn = connector ?? ', ';
  // TODO oxford comma!
  const finalConn = finalConnector ?? ' and ';

  const list: string[] = [];
  items
    .filter(item => item.length > 0)
    .forEach((item: string, i: number) => {
      list.push(item);
      if (items.length === 2) {
        if (i === 0) {
          list.push(finalConn);
        }
      } else if (items.length > 2) {
        if (i < items.length - 2) {
          list.push(conn);
        }
        if (i === items.length - 2) {
          list.push(finalConn);
        }
      }
    });

  return list.join('');
};

export const createCapitalStringList = (items: string[]) => capitalize(createStringList(items));

export default createStringList;
