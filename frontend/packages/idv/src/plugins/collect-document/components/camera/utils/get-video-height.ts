import { IDV_BODY_CONTENT_CONTAINER_ID } from '@/idv/components/layout/components/content';

const getVideoHeight = () => {
  const idvBodyElementsContainer = document.getElementById(IDV_BODY_CONTENT_CONTAINER_ID);
  if (!idvBodyElementsContainer) return 0;

  return idvBodyElementsContainer.offsetHeight;
};

export default getVideoHeight;
