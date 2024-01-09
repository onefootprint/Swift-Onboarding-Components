// We are optimizing the algorithm by tweaking four parameters
// kSize refers to the kernel size for median blur
// fThresh is the first threshold parameter passed in canny edge detection
// sThresh is the second threshold parameter passed in canny edge detection
// aperSize is the aperture size parameter passed in canny edge detection
export type ParamsType = {
  kSize: number;
  fThresh: number;
  sThresh: number;
  aperSize: number;
};

// This set of values performed best with our test images
export const params: ParamsType[] = [
  { kSize: 1, fThresh: 200, sThresh: 200, aperSize: 3 },
  { kSize: 1, fThresh: 150, sThresh: 150, aperSize: 3 },
  { kSize: 9, fThresh: 50, sThresh: 100, aperSize: 3 },
  { kSize: 17, fThresh: 300, sThresh: 300, aperSize: 5 },
  { kSize: 9, fThresh: 250, sThresh: 250, aperSize: 3 },
  { kSize: 9, fThresh: 450, sThresh: 450, aperSize: 5 },
  { kSize: 9, fThresh: 500, sThresh: 500, aperSize: 5 },
  { kSize: 1, fThresh: 250, sThresh: 250, aperSize: 3 },
  { kSize: 17, fThresh: 100, sThresh: 100, aperSize: 3 },
  { kSize: 17, fThresh: 200, sThresh: 200, aperSize: 3 },
  { kSize: 17, fThresh: 250, sThresh: 250, aperSize: 5 },
  { kSize: 35, fThresh: 50, sThresh: 100, aperSize: 3 },
  { kSize: 35, fThresh: 150, sThresh: 150, aperSize: 3 },
  { kSize: 9, fThresh: 150, sThresh: 150, aperSize: 3 },
  { kSize: 1, fThresh: 300, sThresh: 300, aperSize: 3 },
  { kSize: 17, fThresh: 50, sThresh: 100, aperSize: 3 },
  { kSize: 35, fThresh: 100, sThresh: 100, aperSize: 3 },
  { kSize: 35, fThresh: 400, sThresh: 400, aperSize: 5 },
  { kSize: 35, fThresh: 150, sThresh: 150, aperSize: 5 },
  { kSize: 35, fThresh: 450, sThresh: 450, aperSize: 5 },
  { kSize: 35, fThresh: 500, sThresh: 500, aperSize: 5 },
  { kSize: 9, fThresh: 100, sThresh: 100, aperSize: 3 },
  { kSize: 9, fThresh: 200, sThresh: 200, aperSize: 3 },
  { kSize: 9, fThresh: 400, sThresh: 400, aperSize: 5 },
  { kSize: 17, fThresh: 150, sThresh: 150, aperSize: 3 },
];
