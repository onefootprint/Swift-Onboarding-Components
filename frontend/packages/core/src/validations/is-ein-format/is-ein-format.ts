/** The EIN follows this format: XX-XXXXXXX (nine digits total) */
const isEinFormat = (ein: string): boolean => {
  if (!ein) return false;

  const cleanedEIN = ein.replace(/-/g, '');
  return /^[0-9]{9}$/.test(cleanedEIN); // 9 digits only numbers
};

export default isEinFormat;
