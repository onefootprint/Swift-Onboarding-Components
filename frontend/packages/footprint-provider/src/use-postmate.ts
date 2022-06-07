import Postmate from 'postmate';
import { useEffect, useState } from 'react';

const usePostmate = () => {
  const [postmate, setPostmate] = useState<Postmate.ChildAPI>();

  const init = async () => {
    const localPostmate = await new Postmate.Model({});
    setPostmate(localPostmate);
  };

  useEffect(() => {
    init();
  }, []);

  return postmate as Postmate.ChildAPI;
};

export default usePostmate;
