const getCoordinatesFromAddress = async (address: string) => {
  const geocoder = new google.maps.Geocoder();
  try {
    const result = await geocoder.geocode({ address });
    return {
      lat: result.results[0].geometry.location.lat(),
      lng: result.results[0].geometry.location.lng(),
    };
  } catch (error) {
    return undefined;
  }
};

export default getCoordinatesFromAddress;
