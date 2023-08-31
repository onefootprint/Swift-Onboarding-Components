const scrollSpy = () => {
  const navList = document.getElementById('article-sections-list');
  const navItems = Array.from(document.querySelectorAll('[data-scroll-id]'));

  const sections = navItems
    .map(li => {
      const id = li.getAttribute('data-scroll-id') as string;
      return document.getElementById(id) as HTMLElement;
    })
    .filter(elem => !!elem);

  const makeNavItemActive = (id: string) => {
    navItems.forEach(navItem => {
      navItem.classList.remove('active');
    });
    const navItem = navItems.find(
      item => item.getAttribute('data-scroll-id') === id,
    );
    if (navItem && navList) {
      const index = navItems.indexOf(navItem);
      navItem.classList.add('active');
      navList.setAttribute('style', `--index-from-selected: ${index}`);
    }
  };

  const intersectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          makeNavItemActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-54px 0px -86%',
    },
  );

  sections.forEach(section => {
    intersectionObserver.observe(section);
  });
};

export default scrollSpy;
