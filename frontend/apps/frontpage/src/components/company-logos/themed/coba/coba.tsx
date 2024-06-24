import React from 'react';

import { Logo } from '../logo.type';

const CobaLogo = ({ color }: Logo) => (
  <svg fill="none" height="22" viewBox="0 0 82 22" width="82" xmlns="http://www.w3.org/2000/svg">
    <g fill={color}>
      <path d="m20.918 11.7367c0-.4008-.3141-.7366-.715-.7691l-5.1565-.3792c-.2816 0-.4116-.3358-.2166-.5308l3.109-4.02993c.26-.33582.2275-.81248-.065-1.1158-.3249-.33583-.8666-.34666-1.2024-.02167l-12.41467 12.0789c-.33582.325-.34665.8666-.02166 1.2025.29249.3033.76914.3466 1.1158.0974l4.21404-3.0874c.195-.195.53079-.0541.53079.2275l.3684 5.2432c.0325.4442.4008.78.8341.78.4442 0 .8016-.3358.8341-.78l.3684-5.1024c0-.2816.3358-.4116.5308-.2166l3.9107 3.2824c.3142.2817.7908.26 1.0941-.0325.3034-.2925.325-.7691.0542-1.0941l-3.4341-3.9324c-.195-.195-.0541-.5309.2275-.5309l5.3299-.4983c.4008-.0541.7041-.39.7041-.7908z" />
      <path d="m9.41469.5896c-.38999 0-.71498.28166-.75831.67165l-.61748 4.77739c0 .28166-.33583.41165-.53082.21666l-3.70489-3.08743c-.33583-.27083-.82331-.23833-1.10497.07583l-.02167.02167c-.29249.31416-.29249.79081-.01083 1.10497 1.00747 1.14831 3.2174 3.67242 3.2174 3.67242.195.19499.05417.53082-.22749.53082l-4.40904.36832c-.433318.0325-.758309.40082-.758309.83415 0 .44415.346657.81245.790809.83415 2.15577.1083 7.9731.39 7.9731.39.67165 0 1.20251-.5417 1.20251-1.20249l-.26-8.43896c-.0217-.444158-.35752-.76915-.78001-.76915z" />
      <path d="m42.2383 16.0704c-.1516-.0975-.3033-.1516-.4549-.1625-.0325 0-.065.0109-.0867.0434-.6175.8666-1.3541 1.5058-2.2099 1.9283-.8667.4333-1.8308.6499-2.8816.6499-.8342 0-1.6466-.1733-2.4483-.5091-.8016-.3358-1.5166-.8342-2.1558-1.495-.6391-.65-1.1483-1.4624-1.5166-2.4266-.3791-.9641-.5633-2.0691-.5633-3.3257 0-1.48416.26-2.76247.78-3.83494.52-1.08331 1.2024-1.90662 2.0691-2.48077.8558-.57416 1.7983-.86665 2.8166-.86665.9316 0 1.7549.20583 2.4591.60665.7041.41166 1.3433.98581 1.9174 1.73329.5525.71499 1.0725 1.5383 1.5925 2.51328.0325.065.1083.0975.1841.07583.0759-.02167.1084-.0325.2492-.0975.2058-.0975.195-.24916.195-.36832l-.2275-3.58575c0-.31416-.1517-.53082-.4333-.75832-.39-.30332-.845-.47665-1.3-.64998-.4875-.18416-.975-.34666-1.4841-.47666-.0217 0-.0434-.01083-.065-.01083-.8125-.18416-1.625-.28166-2.4591-.28166-1.2241 0-2.3833.2275-3.4774.67165-1.0941.45499-2.0691 1.09414-2.9033 1.92829-.8449.83415-1.5058 1.81996-1.9716 2.9466-.4766 1.12663-.715 2.38329-.715 3.75909 0 1.3649.2384 2.5783.715 3.6616.4767 1.0833 1.1158 2.0041 1.9175 2.7624.8016.7691 1.7008 1.3541 2.6974 1.755 1.0075.4116 2.0258.6066 3.0549.6066 1.5166 0 2.8816-.3358 4.1057-1.0075 1.2133-.6608 2.1666-1.5924 2.8708-2.7949.0108-.0217.0108-.0325.0108-.0542-.0433-.195-.1192-.3575-.2817-.455z" />
      <path d="m43.9404 14.1204c0-.8666.1409-1.6791.4117-2.4374.2708-.7584.6608-1.4192 1.1591-2.00416.4983-.57415 1.0942-1.02914 1.7766-1.35413.6825-.32499 1.43-.48749 2.2425-.48749.8124 0 1.5708.1625 2.2532.48749.6933.32499 1.2783.76915 1.7875 1.35413.4983.57416.8883 1.24576 1.1591 2.00416.2708.7583.4117 1.5708.4117 2.4374s-.1409 1.6791-.4117 2.4374c-.2708.7584-.6608 1.4192-1.1591 2.0042-.4983.5741-1.0942 1.0291-1.7875 1.3541s-1.4408.4875-2.2532.4875c-.8125 0-1.56-.1625-2.2425-.4875-.6824-.325-1.2674-.7691-1.7766-1.3541-.4983-.5742-.8883-1.2458-1.1591-2.0042-.2708-.7583-.4117-1.5708-.4117-2.4374zm2.6108 0c0 1.04.0975 1.9391.3033 2.7191.2058.7692.5308 1.365.9642 1.7875.4441.4225 1.0074.6283 1.7116.6283.7149 0 1.2891-.2058 1.7224-.6283.4333-.4117.7475-1.0075.9533-1.7875.2059-.7691.3033-1.6791.3033-2.7191 0-1.0508-.0974-1.9716-.3033-2.7408-.2058-.7691-.52-1.3649-.9533-1.78742-.4333-.41166-1.0075-.62832-1.7224-.62832-.6933 0-1.2675.20583-1.7116.62832-.4442.41162-.7692 1.00752-.9642 1.78742-.2058.7692-.3033 1.6792-.3033 2.7408z" />
      <path d="m59.0953 20.09h-1.9933v-18.64371h2.0691v8.78561c.5525-1.21329 1.9066-2.40493 3.9757-2.40493 3.0441 0 5.254 2.48073 5.254 6.28323 0 3.7807-2.1991 6.2615-5.254 6.2615-1.9716 0-3.4557-1.17-4.0515-2.3833zm.1191-5.7957c0 2.6 1.1917 4.3766 3.2716 4.3766 2.1016 0 3.8024-1.8633 3.8024-4.5282 0-2.6866-1.69-4.52827-3.8024-4.52827-2.0799 0-3.2716 1.75497-3.2716 4.35487z" />
      <path d="m76.4617 11.5422c0-.9534-.1842-1.625-.5634-2.01499-.3683-.38999-.9208-.58499-1.6574-.58499-.5742 0-1.0183.0975-1.3108.30333-.2925.20582-.4442.42249-.4442.66082 0 .14083.0542.24913.1734.33583.1191.0867.2383.1842.3466.3033.1084.1192.1625.3033.1625.5633 0 .3684-.13.6825-.3791.9208-.2492.2384-.5742.3575-.9642.3575s-.7258-.1408-1.0183-.4116-.4333-.6392-.4333-1.0942c0-.5741.2275-1.10493.6717-1.58159.4441-.47665 1.0399-.85581 1.7874-1.1483.7366-.2925 1.5491-.43333 2.4266-.43333 1.2783 0 2.1883.31416 2.7516.94248s.845 1.41914.845 2.37244c0 .6825-.0109 1.56-.0434 2.3616-.0216.8017-.0541 1.5708-.0758 2.3075-.0217.7366-.0433 1.3541-.0433 1.8416 0 .3033.0758.5525.2275.7475.1516.195.3683.2925.6391.2925.2925 0 .5308-.0759.7367-.2275.2058-.1517.4116-.39.6391-.715.0325-.0325.0867-.0542.1517-.0542.0541 0 .1191.0108.2166.0217.0975.0216.1517.0866.1625.2058-.1191.78-.455 1.4083-1.0183 1.8741-.5633.4659-1.1916.7042-1.8849.7042-.5959 0-1.0833-.195-1.4625-.585-.3791-.39-.585-.9208-.6283-1.6033-.2167.4117-.4983.78-.8233 1.105-.3358.3358-.7258.5958-1.17.7908-.455.195-.9533.2925-1.5166.2925-.8016 0-1.4841-.2492-2.0474-.7583-.5742-.5092-.8559-1.1592-.8559-1.9392 0-.8991.2925-1.6466.8884-2.2424.5958-.5958 1.3757-1.0725 2.3399-1.43.9641-.3575 2.0149-.6066 3.1524-.7366v-1.7441zm-4.0733 5.5898c-.0216.39.1625.9533.5092 1.3.3142.3142.7691.4333 1.2783.4333.4766 0 .9208-.1191 1.3325-.3575.4116-.2383.7366-.5416.9533-.9208v-3.3582c-.7692.0866-1.4517.2383-2.08.4658-.6175.2275-1.1049.5416-1.4624.9425-.3467.4008-.4875.8991-.5309 1.4949z" />
    </g>
  </svg>
);

export default CobaLogo;
