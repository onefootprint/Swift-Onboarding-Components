const getRegion = (city: string | null, region: string | null) =>
  city && region ? `${decodeURIComponent(city)}, ${region}` : city || region;

export default getRegion;
