const getRandomID = () => {
  const hyphenatedID = crypto.randomUUID();
  const randomUUID = hyphenatedID.split('-').join('');
  return randomUUID.substring(0, 18); // Use the first half of the string because too long string takes up too much space in the UI
};

export default getRandomID;
