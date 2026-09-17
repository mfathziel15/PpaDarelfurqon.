
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Loader
  const loader = document.querySelector(".preloader");
  const loaderLine = document.querySelector(".loader-line span");
  const intro = gsap.timeline();
  if(loader){
    intro.to(loaderLine,{width:"100%",duration:1.15,ease:"power2.inOut"})
      .to(loader,{autoAlpha:0,duration:.65,ease:"power3.inOut"})
      .set(loader,{display:"none"});
  }

  // Navigation
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll,{passive:true}); onScroll();
  toggle?.addEventListener("click",()=>links?.classList.toggle("open"));
  links?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")));

  if(reduce){
    document.querySelectorAll(".reveal,.reveal-left,.clip-reveal>*").forEach(el=>{
      el.style.opacity=1; el.style.transform="none";
    });
  } else {
    // Hero intro
    gsap.timeline({defaults:{ease:"power3.out"},delay:.15})
      .from(".hero-kicker",{y:25,opacity:0,duration:.65})
      .from(".hero h1",{y:80,opacity:0,duration:1.1},"-=.4")
      .from(".hero-sub",{y:35,opacity:0,duration:.8},"-=.6")
      .from(".hero-actions .btn",{y:25,opacity:0,stagger:.1,duration:.6},"-=.45")
      .from(".hero-meta",{opacity:0,y:20,duration:.6},"-=.35");

    gsap.utils.toArray(".reveal").forEach(el=>{
      gsap.to(el,{
        opacity:1,y:0,duration:.9,ease:"power3.out",
        scrollTrigger:{trigger:el,start:"top 84%",once:true}
      });
    });
    gsap.utils.toArray(".reveal-left").forEach(el=>{
      gsap.to(el,{
        opacity:1,x:0,duration:1,ease:"power3.out",
        scrollTrigger:{trigger:el,start:"top 84%",once:true}
      });
    });
    gsap.utils.toArray(".clip-reveal").forEach(el=>{
      gsap.to(el.children,{y:0,duration:1,ease:"power4.out",scrollTrigger:{trigger:el,start:"top 86%",once:true}});
    });

    // Parallax
    gsap.utils.toArray("[data-parallax]").forEach(el=>{
      const speed = parseFloat(el.dataset.parallax || .2);
      gsap.to(el,{y:()=>speed*100, ease:"none",scrollTrigger:{trigger:el,start:"top bottom",end:"bottom top",scrub:1}});
    });

    // Card stagger
    gsap.utils.toArray(".feature-grid,.news-grid,.gallery-grid").forEach(grid=>{
      gsap.from(grid.children,{
        y:45,opacity:0,stagger:.08,duration:.8,ease:"power3.out",
        scrollTrigger:{trigger:grid,start:"top 82%",once:true}
      });
    });

    // Statement scale
    const statement = document.querySelector(".statement h2");
    if(statement) gsap.fromTo(statement,{scale:.82,opacity:.25},{
      scale:1,opacity:1,ease:"none",
      scrollTrigger:{trigger:statement,start:"top 90%",end:"bottom 45%",scrub:1}
    });
  }

  // Custom cursor
  const dot=document.querySelector(".cursor"), follower=document.querySelector(".cursor-follower");
  if(dot && follower && !reduce && matchMedia("(pointer:fine)").matches){
    let mx=innerWidth/2,my=innerHeight/2,fx=mx,fy=my;
    window.addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;gsap.to(dot,{x:mx,y:my,duration:.05});});
    gsap.ticker.add(()=>{fx+=(mx-fx)*.13;fy+=(my-fy)*.13;gsap.set(follower,{x:fx,y:fy});});
    document.querySelectorAll("a,button,.feature-card,.gallery-item,.news-card").forEach(el=>{
      el.addEventListener("mouseenter",()=>follower.classList.add("active"));
      el.addEventListener("mouseleave",()=>follower.classList.remove("active"));
    });
    gsap.set([dot,follower],{opacity:1});
  }

  // Magnetic buttons
  if(!reduce && matchMedia("(pointer:fine)").matches){
    document.querySelectorAll(".magnetic").forEach(btn=>{
      btn.addEventListener("mousemove",e=>{
        const r=btn.getBoundingClientRect();
        gsap.to(btn,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.18,duration:.35,ease:"power3.out"});
      });
      btn.addEventListener("mouseleave",()=>gsap.to(btn,{x:0,y:0,duration:.6,ease:"elastic.out(1,.4)"}));
    });
  }

  // 3D-ish card hover
  if(!reduce && matchMedia("(pointer:fine)").matches){
    document.querySelectorAll("[data-tilt]").forEach(card=>{
      card.addEventListener("mousemove",e=>{
        const r=card.getBoundingClientRect();
        const rx=((e.clientY-r.top)/r.height-.5)*-5;
        const ry=((e.clientX-r.left)/r.width-.5)*5;
        gsap.to(card,{rotationX:rx,rotationY:ry,transformPerspective:900,duration:.35,ease:"power2.out"});
      });
      card.addEventListener("mouseleave",()=>gsap.to(card,{rotationX:0,rotationY:0,duration:.7,ease:"power3.out"}));
    });
  }

  // FAQ
  document.querySelectorAll(".faq-q").forEach(q=>{
    q.addEventListener("click",()=>{
      const item=q.closest(".faq-item");
      const answer=item.querySelector(".faq-a");
      const open=item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(other=>{
        if(other!==item){other.classList.remove("open");other.querySelector(".faq-a").style.height="0px";}
      });
      if(open){item.classList.remove("open");answer.style.height="0px";}
      else{item.classList.add("open");answer.style.height=answer.scrollHeight+"px";}
    });
  });

  // Gallery modal (dependency-free)
  const modal=document.querySelector(".lightbox");
  if(modal){
    const modalImg=modal.querySelector("img"), close=modal.querySelector(".lightbox-close");
    document.querySelectorAll("[data-gallery]").forEach(item=>{
      item.addEventListener("click",()=>{
        modalImg.src=item.dataset.gallery;
        modal.classList.add("open");
        document.body.style.overflow="hidden";
      });
    });
    const hide=()=>{modal.classList.remove("open");document.body.style.overflow="";};
    close?.addEventListener("click",hide);
    modal.addEventListener("click",e=>{if(e.target===modal)hide()});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")hide()});
  }

  // Swiper
  const slider=document.querySelector(".news-swiper");
  if(slider){
    new Swiper(slider,{
      slidesPerView:1.12,spaceBetween:14,grabCursor:true,
      speed:900,loop:true,
      autoplay:{delay:3200,disableOnInteraction:false},
      breakpoints:{700:{slidesPerView:2.1},1000:{slidesPerView:3.05}}
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());

  // Smooth anchor with GSAP
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener("click",e=>{
      const id=a.getAttribute("href");
      if(!id || id==="#") return;
      const target=document.querySelector(id);
      if(target){
        e.preventDefault();
        gsap.to(window,{duration:1.1,scrollTo:{y:target,offsetY:70},ease:"power3.inOut"});
      }
    });
  });
});
