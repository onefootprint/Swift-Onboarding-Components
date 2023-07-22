const ID_LENGTH = 13;

const getRandomID = () => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const totalCharacters = characters.length;
  let counter = 0;
  while (counter < ID_LENGTH) {
    result += characters.charAt(Math.floor(Math.random() * totalCharacters));
    counter += 1;
  }
  return result;
};

export default getRandomID;
