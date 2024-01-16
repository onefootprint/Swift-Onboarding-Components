// Generate a unique ID for DOM elements to avoid collisions between different footprint components
const getUniqueId = (): string => Math.random().toString(36).substring(2);

export default getUniqueId;
