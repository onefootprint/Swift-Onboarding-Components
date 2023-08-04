import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

const useURL = () => {
  const [linkingUrl, setLinkingUrl] = useState<string | null>(null);

  const onChangeUrl = (event: { url: string }) => {
    setLinkingUrl(event.url);
  };

  useEffect(() => {
    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      setLinkingUrl(url);
    };

    getInitialUrl();
    const subscriber = Linking.addEventListener('url', onChangeUrl);

    return () => subscriber.remove();
  }, []);

  return linkingUrl;
};

export default useURL;
