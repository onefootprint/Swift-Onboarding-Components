import { useQuery } from '@tanstack/react-query';
import GoogleMapsLoader from 'src/components/entities/utils/google-maps-loader';

const useStreetViewPanorama = (
  coordinates: { latitude: number; longitude: number } | undefined,
  streetViewRef: React.RefObject<HTMLDivElement>,
  isEnabled: boolean,
) => {
  return useQuery({
    queryKey: ['streetView', coordinates?.latitude, coordinates?.longitude],
    queryFn: async () => {
      await GoogleMapsLoader.importLibrary('core');
      const { data } = await new google.maps.StreetViewService().getPanorama({
        location: { lat: coordinates?.latitude!, lng: coordinates?.longitude! },
        radius: 50,
      });
      return new google.maps.StreetViewPanorama(streetViewRef.current as HTMLElement, {
        pano: data?.location?.pano,
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
        disableDefaultUI: true,
      });
    },
    enabled: isEnabled && !!coordinates,
  });
};

export default useStreetViewPanorama;
