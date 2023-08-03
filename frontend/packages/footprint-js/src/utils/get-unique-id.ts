const getUniqueId = () => {
  // Generate a unique ID for DOM elements to avoid collisions between different footprint components
  const randomSeed = Math.floor(Math.random() * 1000);
  return `${randomSeed}`;
};

export default getUniqueId;
