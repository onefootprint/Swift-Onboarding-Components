import capitalize from 'lodash/capitalize';

const createStringList = (
  items: string[],
  connector?: string,
  finalConnector?: string,
) => {
  const conn = connector ?? ', ';
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

  return capitalize(list.join(''));
};

export default createStringList;
