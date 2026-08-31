
(() => {
  'use strict';

  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => [...root.querySelectorAll(s)];

  // Small, safe preloader for every page.
  // Hides on DOMContentLoaded (doesn't wait for slow/offline CDN assets),
  // with a hard fallback timeout so it can never stay stuck on screen.
  (() => {
    const hidePreloader = () => {
      const preloader = qs('#preloader');
      if (!preloader || preloader.dataset.hidden === '1') return;
      preloader.dataset.hidden = '1';
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      preloader.style.pointerEvents = 'none';
      preloader.setAttribute('aria-hidden', 'true');
    };

    // Primary: hide shortly after the DOM itself is ready.
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(hidePreloader, 350);
    });

    // Hard fallback: never let the preloader block the page for more than 3s,
    // even if DOMContentLoaded is delayed or a script above throws first.
    setTimeout(hidePreloader, 3000);
  })();

  document.addEventListener('DOMContentLoaded', () => {
    const navbar = qs('#mainNavbar');
    const progress = qs('#scrollProgress');
    const backTop = qs('#backTop');
    const glow = qs('#cursorGlow');

    const onScroll = () => {
      const y = window.scrollY || 0;
      if (navbar) navbar.classList.toggle('navbar-scrolled', y > 35);
      if (backTop) backTop.classList.toggle('show', y > 500);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${max > 0 ? (y/max)*100 : 0}%`;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});

    if (backTop) backTop.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({top:0,behavior:'smooth'});
    });

    // Close mobile navbar after navigation.
    qsa('#navbarNav .nav-link, #navbarNav .btn').forEach(link => {
      link.addEventListener('click', () => {
        const nav = qs('#navbarNav');
        if (nav && nav.classList.contains('show') && window.bootstrap) {
          const instance = bootstrap.Collapse.getInstance(nav) || new bootstrap.Collapse(nav,{toggle:false});
          instance.hide();
        }
      });
    });

    // Cursor spotlight on desktop.
    if (glow && window.matchMedia('(pointer:fine)').matches) {
      window.addEventListener('pointermove', e => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
        glow.style.opacity = '1';
      }, {passive:true});
      document.addEventListener('mouseleave', () => glow.style.opacity='0');
    }

    // Native fallback reveal.
    const revealItems = qsa('.reveal-text, [data-reveal]');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('muncul','is-visible');
          observer.unobserve(entry.target);
        });
      }, {threshold:.12, rootMargin:'0px 0px -50px'});
      revealItems.forEach(el => observer.observe(el));
    } else {
      revealItems.forEach(el => el.classList.add('muncul','is-visible'));
    }

    // GSAP enhancement when CDN is available.
    if (window.gsap) {
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        qsa('[data-reveal]').forEach((el, i) => {
          gsap.fromTo(el,
            {y:34, opacity:0},
            {y:0, opacity:1, duration:.75, delay:(i%4)*.07, ease:'power3.out',
             scrollTrigger:{trigger:el,start:'top 88%',once:true}}
          );
        });

        const hero = qs('.hero-bg');
        if (hero) {
          const title = qs('.hero-title', hero);
          const sub = qs('.hero-subtitle', hero);
          const actions = qs('.hero-actions', hero);
          const eyebrow = qs('.hero-eyebrow', hero);
          const tl = gsap.timeline({defaults:{ease:'power3.out'}});
          if (eyebrow) tl.from(eyebrow,{y:18,opacity:0,duration:.65},.15);
          if (title) tl.from(title,{y:35,opacity:0,duration:.9},.28);
          if (sub) tl.from(sub,{y:22,opacity:0,duration:.7},.48);
          if (actions) tl.from(actions,{y:18,opacity:0,duration:.6},.62);
          gsap.to(hero,{backgroundPosition:'50% 56%',ease:'none',
            scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
        }

        qsa('.section-title').forEach(el => {
          gsap.fromTo(el,{y:18,opacity:0},{y:0,opacity:1,duration:.7,
            scrollTrigger:{trigger:el,start:'top 88%',once:true}});
        });

        qsa('[data-count]').forEach(el => {
          const end = Number(el.dataset.count || 0);
          if (!Number.isFinite(end)) return;
          const obj = {v:0};
          gsap.to(obj,{v:end,duration:1.6,ease:'power2.out',
            scrollTrigger:{trigger:el,start:'top 90%',once:true},
            onUpdate:()=>{el.textContent=Math.round(obj.v).toLocaleString('id-ID')}
          });
        });
      }

      // Gentle 3D tilt; disabled for touch.
      if (window.matchMedia('(pointer:fine)').matches) {
        qsa('.tilt-card').forEach(card => {
          card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX-r.left)/r.width-.5;
            const y = (e.clientY-r.top)/r.height-.5;
            card.style.transform = `perspective(900px) rotateX(${(-y*3).toFixed(2)}deg) rotateY(${(x*3).toFixed(2)}deg) translateY(-6px)`;
          });
          card.addEventListener('pointerleave', () => {
            card.style.transform='';
          });
        });
      }
    }

    // Swiper, if the page contains it.
    const swiperContainer = qs('.prestasiSwiper');
    if (swiperContainer && window.Swiper) {
      new Swiper(swiperContainer, {
        slidesPerView:1,
        spaceBetween:18,
        loop:true,
        speed:750,
        grabCursor:true,
        autoplay:{delay:3500,disableOnInteraction:false,pauseOnMouseEnter:true},
        pagination:{el:'.swiper-pagination',clickable:true},
        navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'},
        breakpoints:{576:{slidesPerView:2},992:{slidesPerView:3}}
      });
    }

    // Bootstrap accordion color state.
    qsa('.custom-collapse').forEach(el => {
      el.addEventListener('show.bs.collapse', () => el.parentElement.classList.add('expanded'));
      el.addEventListener('hide.bs.collapse', () => el.parentElement.classList.remove('expanded'));
    });
  });

  // Existing tab API, kept compatible with the user's inline onclick.
  window.openTab = function(evt, tabName) {
    const contents = document.getElementsByClassName('tab-content');
    for (let i=0;i<contents.length;i++) contents[i].style.display='none';
    const buttons = document.getElementsByClassName('tab-btn');
    for (let i=0;i<buttons.length;i++) buttons[i].classList.remove('active');
    const selected = document.getElementById(tabName);
    if (selected) selected.style.display='block';
    if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');
  };
})();
