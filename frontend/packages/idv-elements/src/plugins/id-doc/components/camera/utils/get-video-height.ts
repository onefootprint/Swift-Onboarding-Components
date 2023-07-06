import { IDV_BODY_CONTENT_CONTAINER_ID } from '../../../../../components/layout/components/content/components/body';

const getVideoHeight = () => {
  const idvBodyElementsContainer = document.getElementById(
    IDV_BODY_CONTENT_CONTAINER_ID,
  );
  if (!idvBodyElementsContainer) return 0;

  return idvBodyElementsContainer.offsetHeight;
};

export default getVideoHeight;
