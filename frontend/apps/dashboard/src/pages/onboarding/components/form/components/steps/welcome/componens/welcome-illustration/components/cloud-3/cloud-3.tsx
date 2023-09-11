import React from 'react';

const Cloud3 = ({ fill = '#fff' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={125} height={21} fill="none">
    <path
      fill={fill}
      d="M55.767 19.796c.17 0 .1.07.4.07.21 0 .45.1.71.1.22 0 .46-.08.72-.08.22 0 .46-.32.71-.32.23 0 .47.37.71.37.23 0 .47.29.71.29.23 0 .47-.39.71-.39.23 0 .47.09.71.09s.47.16.71.16.47-.49.71-.49.47.56.71.56.47-.51.71-.51.47.44.71.44.47-.15.71-.15.47.12.71.12.47-.39.71-.39.47-.14.71-.14.48.56.72.56.47-.45.71-.45.47-.04.71-.04.48.13.72.13.48.03.72.03.48-.08.72-.08.47.07.71.07.47.23.71.22c.24-.01.47-.38.71-.38s.47.02.71.02.48.03.71.02c.23-.01.48.07.71.07.23 0 .48-.13.71-.13.23 0 .48.52.72.52s.48-.17.72-.17.48-.15.71-.15c.23 0 .48.04.72.04s.48.32.72.32h.72c.24 0 .48-.09.72-.09s.48.09.72.09.48-.54.72-.55c.24-.01.48.38.72.37.24-.01.48-.17.72-.18.24-.01.48-.17.72-.17s.48-.08.72-.08.48.53.72.53.48-.24.72-.24.48.01.72.01.48-.13.72-.14c.24-.01.48-.16.72-.17.24-.01.49.42.72.42.23 0 .48.04.72.04s.48.02.72.02.48-.06.72-.06.48-.15.72-.15.48-.12.72-.13c.24-.01.48.06.72.05.24-.01.48.26.72.25.24-.01.47-.46.71-.46s.48.19.72.19.48.36.72.35c.24-.01.48-.57.71-.58.23-.01.49.52.73.52s.48-.13.72-.14c.24-.01.47-.44.71-.44s.49.46.72.46c.23 0 .48-.11.71-.12.23-.01.47-.38.7-.39.23-.01.49.48.72.47.25 0 .48-.32.72-.33.24-.01.47-.21.71-.23.24-.02.52.26.76.23s.49-.1.72-.14c.23-.04.44-.28.67-.34.23-.06.59.3.82.24.23-.06.46-.23.68-.31.23-.09.5-.12.72-.22.23-.1.43-.29.64-.41.22-.12.31-.46.5-.59.21-.14.41-.27.59-.43.19-.17.14-.52.29-.7.16-.19.37-.29.49-.49s.26-.38.34-.6c.08-.22.1-.44.13-.68.03-.24.24-.46.22-.71-.02-.23-.14-.46-.21-.7-.06-.23-.39-.33-.5-.56-.09-.21.39-.74.26-.96-.12-.2-.4-.18-.55-.38.22 0 .3-.28.55-.29.22 0 .47.19.71.17.23-.01.45-.22.69-.24.23-.02.48.17.72.14s.45-.2.68-.23c.23-.03.46-.09.69-.12.23-.03.51.22.74.18.23-.04.49.04.72 0 .23-.04.45-.18.68-.24.23-.06.51.08.74.02.23-.06.42-.28.65-.35.23-.07.33-.51.55-.59.22-.08.54.1.76.01.22-.09.38-.31.59-.41.21-.1.6.1.8-.01.2-.11.1-.74.29-.87.19-.13.66.09.83-.06.17-.15.24-.44.4-.62.16-.18.15-.46.28-.65.13-.19.11-.43.21-.64.1-.21.61-.26.67-.49.06-.25.15-.49.18-.72.04-.26.13-.52.13-.75 0-.26 0-.55-.05-.78-.05-.25-.18-.52-.28-.73-.11-.22-.59-.2-.75-.38-.16-.18-.22-.43-.42-.57-.2-.14-.38-.28-.6-.39-.21-.1-.49-.03-.72-.11-.22-.08-.46-.04-.7-.1-.24-.06-.46-.03-.7-.07-.24-.04-.42-.35-.67-.37-.25-.02-.47-.13-.71-.15-.24-.02-.49.23-.73.22-.24-.01-.47-.14-.72-.14s-.48.12-.72.13c-.24.01-.5-.45-.74-.44-.24.01-.48.24-.72.25-.24.01-.5-.11-.73-.1-.23.01-.48.23-.71.24-.25.01-.51-.34-.74-.33-.25.01-.48.13-.71.14-.25.01-.49-.02-.71-.02-.24 0-.47.2-.72.21-.25.01-.48-.15-.72-.15s-.48.12-.72.12-.48-.05-.72-.05-.48.37-.72.38c-.24.01-.48.07-.72.07s-.48-.14-.72-.14-.48-.04-.72-.03c-.24.01-.48-.39-.72-.38-.24.01-.48.17-.72.17s-.48.42-.72.42-.48-.11-.72-.11-.48.11-.72.12c-.24.01-.48-.12-.72-.11-.24.01-.48.05-.72.05s-.48-.13-.72-.13-.48-.25-.72-.25-.48-.09-.72-.09-.48.08-.72.08-.48.21-.72.21-.48.15-.72.15-.48-.53-.72-.53-.48.01-.72.01-.48.22-.72.22-.48.21-.72.21-.48-.21-.72-.21-.48-.06-.72-.06-.48.42-.72.42-.48-.5-.72-.5-.48.39-.72.39-.48-.3-.72-.3h-.72c-.24 0-.48.27-.72.27s-.48-.3-.73-.3-.48.19-.73.19-.48.32-.73.32-.49-.44-.73-.44-.48.22-.73.23c-.25.01-.49-.1-.73-.1s-.49-.12-.73-.12-.49.01-.73.01-.49.37-.73.37-.49-.29-.73-.29-.49.19-.73.19-.49.16-.73.16-.49-.28-.73-.28-.49-.06-.73-.06-.49.07-.73.07-.49-.29-.73-.29-.49.57-.73.57-.49-.11-.73-.11-.49-.05-.73-.05-.49-.49-.73-.49-.48.43-.72.43-.48-.06-.72-.06-.49.07-.73.07-.49-.44-.73-.44-.49.14-.73.14-.49.42-.73.42-.49.08-.73.08-.49-.03-.73-.03-.49-.04-.73-.04-.49-.05-.73-.05-.49.08-.73.08-.49-.28-.72-.28c-.23 0-.49-.03-.72-.03-.23 0-.49.32-.72.32-.23 0-.49.06-.72.06-.23 0-.48-.38-.72-.38s-.48.13-.72.13c-.25 0-.49.09-.72.09-.25 0-.49-.03-.72-.03-.25 0-.49.09-.72.09-.25 0-.49-.49-.72-.49-.25 0-.49.08-.72.08h-.72c-.28 0-.52.18-.72.18-.46 0-.52-.31-.64.02s-.33.33-.33.68c0 .35.02.35.02.71s.35.35.35.71.18.35.18.71-.2.35-.2.71-.24.35-.24.71-.07.35-.07.71.24.35.24.7.15.35.15.7-.06.35-.06.71-.31.35-.31.71.08.36.08.71-.01.35-.01.71-.1.35-.1.71.23.35.23.71-.29.36-.29.71.08.35.08.71.22.35.22.71-.29.36-.29.71.24.36.24.71-.28.36-.28.71.12.35.12.71.56.36.56.71-.55.36-.55.71.06.38.14.73c.08.35.3.28.38.63l.06.01Z"
    />
    <path
      fill={fill}
      d="M69.29 1.286c-.17 0-.1-.07-.4-.07-.21 0-.45-.1-.71-.1-.22 0-.46.08-.72.08-.22 0-.46.32-.71.32-.23 0-.47-.37-.71-.37-.23 0-.47-.29-.71-.29-.23 0-.47.39-.71.39-.23 0-.47-.09-.71-.09s-.47-.16-.71-.16-.47.49-.71.49-.47-.56-.71-.56-.47.51-.71.51-.47-.44-.71-.44-.47.15-.71.15-.47-.12-.71-.12-.47.39-.71.39-.47.14-.71.14-.48-.56-.72-.56-.47.45-.71.45-.47.04-.71.04-.48-.13-.72-.13-.48-.03-.72-.03-.48.08-.72.08-.47-.07-.71-.07-.47-.23-.71-.22c-.24.01-.47.38-.71.38s-.47-.02-.71-.02-.48-.03-.71-.02c-.23.01-.48-.07-.71-.07-.23 0-.48.13-.71.13-.23 0-.48-.52-.72-.52s-.48.17-.72.17-.48.15-.71.15c-.23 0-.48-.04-.72-.04s-.48-.32-.72-.32h-.72c-.24 0-.48.09-.72.09s-.48-.09-.72-.09-.48.54-.72.55c-.24.01-.48-.38-.72-.37-.24.01-.48.17-.72.18-.24.01-.48.17-.72.17s-.48.08-.72.08-.48-.53-.72-.53-.48.24-.72.24-.48-.01-.72-.01-.48.13-.72.14c-.24.01-.48.16-.72.17-.24.01-.49-.42-.72-.42-.23 0-.48-.04-.72-.04s-.48-.02-.72-.02-.48.06-.72.06-.48.15-.72.15-.48.12-.72.13c-.24.01-.48-.06-.72-.05-.24.01-.48-.26-.72-.25-.24.01-.47.46-.71.46s-.48-.19-.72-.19-.48-.36-.72-.35c-.24.01-.48.57-.71.58-.23.01-.49-.52-.73-.52s-.48.13-.72.14c-.24.01-.47.44-.71.44s-.49-.46-.72-.46c-.23 0-.48.11-.71.12-.23.01-.47.38-.7.39-.23.01-.49-.48-.72-.47-.25 0-.48.32-.72.33-.24.01-.47.21-.71.23-.24.02-.52-.26-.76-.23s-.49.1-.72.14c-.23.04-.44.28-.67.34-.23.06-.59-.3-.82-.24-.23.06-.46.23-.68.31-.23.09-.5.12-.72.22-.23.1-.43.29-.64.41-.22.12-.31.46-.5.59-.21.14-.41.27-.59.43-.19.17-.14.52-.29.7-.16.19-.37.29-.49.49s-.26.38-.34.6c-.08.22-.1.44-.13.68-.03.24-.24.46-.22.71.02.23.14.46.21.7.06.23.39.33.5.56.09.21-.39.74-.26.96.12.2.4.18.55.38-.22 0-.3.28-.55.29-.22 0-.47-.19-.71-.17-.23.01-.45.22-.69.24-.23.02-.48-.17-.72-.14s-.45.2-.68.23c-.23.03-.46.09-.69.12-.23.03-.51-.22-.74-.18-.23.04-.49-.04-.72 0-.23.04-.45.18-.68.24-.23.06-.51-.08-.74-.02-.23.06-.42.28-.65.35-.23.07-.33.51-.55.59-.22.08-.54-.1-.76-.01-.22.09-.38.31-.59.41-.21.1-.6-.1-.8.01-.2.11-.1.74-.29.87-.19.13-.66-.09-.83.06-.17.15-.24.44-.4.62-.16.18-.15.46-.28.65-.13.19-.11.43-.21.64-.1.21-.61.26-.67.49-.06.25-.15.49-.18.72-.04.26-.13.52-.13.75 0 .26 0 .55.05.78.05.25.18.52.28.73.11.22.59.2.75.38.16.18.22.43.42.57.2.14.38.28.6.39.21.1.49.03.72.11.22.08.46.04.7.1.24.06.46.03.7.07.24.04.42.35.67.37.25.02.47.13.71.15.24.02.49-.23.73-.22.24.01.47.14.72.14s.48-.12.72-.13c.24-.01.5.45.74.44.24-.01.48-.24.72-.25.24-.01.5.11.73.1.23-.01.48-.23.71-.24.25-.01.51.34.74.33.25-.01.48-.13.71-.14.25-.01.49.02.71.02.24 0 .47-.2.72-.21.25-.01.48.15.72.15s.48-.12.72-.12.48.05.72.05.48-.37.72-.38c.24-.01.48-.07.72-.07s.48.14.72.14.48.04.72.03c.24-.01.48.39.72.38.24-.01.48-.17.72-.17s.48-.42.72-.42.48.11.72.11.48-.11.72-.12c.24-.01.48.12.72.11.24-.01.48-.05.72-.05s.48.13.72.13.48.25.72.25.48.09.72.09.48-.08.72-.08.48-.21.72-.21.48-.15.72-.15.48.53.72.53.48-.01.72-.01.48-.22.72-.22.48-.21.72-.21.48.21.72.21.48.06.72.06.48-.42.72-.42.48.5.72.5.48-.39.72-.39.48.3.72.3h.72c.24 0 .48-.27.72-.27s.48.3.73.3.48-.19.73-.19.48-.32.73-.32.49.44.73.44.48-.22.73-.23c.25-.01.49.1.73.1s.49.12.73.12.49-.01.73-.01.49-.37.73-.37.49.29.73.29.49-.19.73-.19.49-.16.73-.16.49.28.73.28.49.06.73.06.49-.07.73-.07.49.29.73.29.49-.57.73-.57.49.11.73.11.49.05.73.05.49.49.73.49.48-.43.72-.43.48.06.72.06.49-.07.73-.07.49.44.73.44.49-.14.73-.14.49-.42.73-.42.49-.08.73-.08.49.03.73.03.49.04.73.04.49.05.73.05.49-.08.73-.08.49.28.72.28c.23 0 .49.03.72.03.23 0 .49-.32.72-.32.23 0 .49-.06.72-.06.23 0 .48.38.72.38s.48-.13.72-.13c.25 0 .49-.09.72-.09.25 0 .49.03.72.03.25 0 .49-.09.72-.09.25 0 .49.49.72.49.25 0 .49-.08.72-.08h.72c.28 0 .52-.18.72-.18.46 0 .52.31.64-.02s.33-.33.33-.68c0-.35-.02-.35-.02-.71s-.35-.35-.35-.71-.18-.35-.18-.71.2-.35.2-.71.24-.35.24-.71.07-.35.07-.71-.24-.35-.24-.7-.15-.35-.15-.7.06-.35.06-.71.31-.35.31-.71-.08-.36-.08-.71.01-.35.01-.71.1-.35.1-.71-.23-.35-.23-.71.29-.36.29-.71-.08-.35-.08-.71-.22-.35-.22-.71.29-.36.29-.71-.24-.36-.24-.71.28-.36.28-.71-.12-.35-.12-.71-.56-.36-.56-.71.55-.36.55-.71-.06-.38-.14-.73c-.08-.35-.3-.28-.38-.63l-.06-.01Z"
    />
  </svg>
);
export default Cloud3;
