import React from 'react';

type FindigsProps = {
  color: string;
};

const FindigsLogo = ({ color }: FindigsProps) => (
  <svg
    width="72"
    height="23"
    viewBox="0 0 72 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.05032 17.9785V10.9733H10.3706V8.2547H3.05032V3.38042H11.2096V0.612375H0V17.9785H3.05032ZM15.547 17.9785V6.05015H12.6237V17.9791L15.547 17.9785ZM12.1661 1.86127C12.1657 2.10264 12.2147 2.3417 12.3104 2.56476C12.4061 2.78782 12.5465 2.99049 12.7236 3.16116C12.9007 3.33183 13.111 3.46714 13.3425 3.55933C13.574 3.65152 13.8221 3.69878 14.0725 3.6984C15.14 3.6984 16.004 2.88995 16.004 1.86127C16.004 0.8326 15.14 0 14.0725 0C13.0301 0 12.1661 0.8326 12.1661 1.86127ZM20.5199 11.0958C20.5199 9.52833 21.4095 8.27885 23.0875 8.27885C24.9432 8.27885 25.6294 9.45473 25.6294 10.9244V17.9785H28.5777V10.4345C28.5777 7.81367 27.1289 5.70687 24.1042 5.70687C22.7318 5.70687 21.2574 6.27037 20.4441 7.64175V6.04957H17.5716V17.9785H20.5199V11.0958ZM32.8793 11.9778C32.8793 9.69967 34.303 8.2547 36.2345 8.2547C38.166 8.2547 39.4883 9.67553 39.4883 11.9531C39.4883 14.2307 38.141 15.774 36.2094 15.774C34.2016 15.774 32.8793 14.256 32.8793 11.9778ZM42.3345 0.24495H39.462V7.44625C39.0808 6.68725 37.9876 5.7316 35.827 5.7316C32.3446 5.7316 29.9298 8.54852 29.9298 11.9778C29.9298 15.5785 32.319 18.2729 35.8777 18.2729C37.6314 18.2729 38.928 17.4403 39.5128 16.4358C39.5205 16.9523 39.5629 17.4679 39.6399 17.9791H42.4611C42.4354 17.783 42.334 16.8768 42.334 15.7993L42.3345 0.24495ZM47.0765 17.9785V6.05015H44.1533V17.9791L47.0765 17.9785ZM43.6962 1.86127C43.6958 2.10264 43.7449 2.3417 43.8405 2.56476C43.9362 2.78782 44.0766 2.99049 44.2537 3.16116C44.4308 3.33183 44.6412 3.46714 44.8726 3.55933C45.1041 3.65152 45.3522 3.69878 45.6027 3.6984C46.6702 3.6984 47.5342 2.88995 47.5342 1.86127C47.5342 0.8326 46.6702 0 45.6027 0C44.5608 0 43.6962 0.8326 43.6962 1.86127ZM48.7198 18.6398C49.0504 21.0404 51.3381 23 54.617 23C59.2682 23 60.9718 20.0365 60.9718 16.8521V6.05015H58.125V7.56873C57.5909 6.58893 56.3963 5.82993 54.4648 5.82993C51.0589 5.82993 48.7455 8.45078 48.7455 11.6351C48.7455 14.9908 51.1603 17.4403 54.4648 17.4403C56.2698 17.4403 57.5152 16.6319 58.0486 15.7009V16.9504C58.0486 19.3752 56.8791 20.5264 54.5406 20.5264C52.8376 20.5264 51.643 19.4241 51.4396 17.9544L48.7198 18.6398ZM54.9476 15.0144C53.016 15.0144 51.7194 13.716 51.7194 11.634C51.7194 9.60078 53.0668 8.27827 54.9476 8.27827C56.7776 8.27827 58.125 9.60078 58.125 11.634C58.125 13.6913 56.8289 15.0144 54.9476 15.0144ZM62.2136 14.7453C62.3663 16.0925 63.7387 18.3459 67.3231 18.3459C70.4748 18.3459 72 16.3375 72 14.5251C72 12.7616 70.7798 11.3896 68.4413 10.8997L66.5605 10.5323C65.7979 10.3851 65.3152 9.9199 65.3152 9.2828C65.3152 8.54795 66.0521 7.91085 67.0939 7.91085C68.7462 7.91085 69.2803 9.01312 69.3817 9.6991L71.8729 9.01312C71.6694 7.83725 70.5512 5.68215 67.0939 5.68215C64.527 5.68215 62.5441 7.44568 62.5441 9.52775C62.5441 11.1688 63.688 12.5407 65.8743 13.0059L67.7044 13.3981C68.6955 13.5942 69.1532 14.084 69.1532 14.7206C69.1532 15.4554 68.5177 16.0925 67.2974 16.0925C65.7215 16.0925 64.8826 15.1375 64.7812 14.0593L62.2136 14.7453Z"
      fill={color}
    />
  </svg>
);

export default FindigsLogo;
