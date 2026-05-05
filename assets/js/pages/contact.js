const PageContact = {
  render() {
    return `
      <div class="subpage contact-page">

        <section class="subpage__hero">
          <p class="subpage__label">Contact</p>
          <h1 class="subpage__title">좋은 작업은<br>대화에서 시작됩니다.</h1>
        </section>

        <section class="subpage__section contact-info">
          <a href="mailto:brant7100@gmail.com" class="contact-info__email">
            brant7100@gmail.com
          </a>
          <div class="contact-info__links">
            <a href="https://github.com/youngtaek-lee" target="_blank" rel="noopener" class="contact-info__link">GitHub</a>
            <a href="#" target="_blank" rel="noopener" class="contact-info__link">Instagram</a>
            <a href="#" target="_blank" rel="noopener" class="contact-info__link">LinkedIn</a>
          </div>
        </section>

      </div>
    `;
  },

  init() {
    gsap.from('.subpage__title', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' });
    gsap.from('.subpage__label', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' });
    gsap.from('.contact-info__email', { y: 30, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' });
    gsap.from('.contact-info__link',  { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, delay: 0.4, ease: 'power2.out' });
  },
};
