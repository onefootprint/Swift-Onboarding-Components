type GetOutlineDimensionsProps = {
  videoSize?: {
    width: number;
    height: number;
  };
  outlineWidthRatio: number;
  outlineHeightRatio: number;
  deviceKind: 'mobile' | 'desktop';
};

const getOutlineDimensions = ({
  videoSize,
  outlineWidthRatio,
  outlineHeightRatio,
  deviceKind,
}: GetOutlineDimensionsProps) => {
  if (deviceKind === 'mobile') {
    return {
      outlineWidth: videoSize ? videoSize.width * outlineWidthRatio : 0,
      outlineHeight: videoSize ? videoSize.width * outlineHeightRatio : 0,
    };
  }

  return {
    outlineWidth: videoSize ? videoSize.height * outlineWidthRatio : 0,
    outlineHeight: videoSize ? videoSize.height * outlineHeightRatio : 0,
  };
};

export default getOutlineDimensions;
