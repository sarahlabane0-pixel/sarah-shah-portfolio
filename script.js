(() => {
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  const cursor = document.querySelector('.cursor');
  const progress = document.querySelector('.scroll-progress i');
  const work = document.querySelector('.work');
  const workTrack = document.querySelector('.work-track');
  const numbers = document.querySelector('.numbers');
  const numbersTrack = document.querySelector('.numbers-track');
  const current = document.getElementById('projectCurrent');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;

  const setVH = () => root.style.setProperty('--vh', `${innerHeight * .01}px`);
  setVH();
  addEventListener('resize', setVH, {passive:true});

  addEventListener('load', () => {
    setTimeout(() => loader?.classList.add('leave'), 1650);
    setTimeout(() => loader?.remove(), 3200);
  });

  if (fine && cursor) {
    let tx = innerWidth/2, ty = innerHeight/2, cx = tx, cy = ty;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, {passive:true});
    const loop = () => {
      cx += (tx-cx)*.18; cy += (ty-cy)*.18;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    document.querySelectorAll('a,.world,.project,.tilt,.skill-word,.travel-float,.places-grid article,.contact-card').forEach(el => {
      el.addEventListener('mouseenter',()=>cursor.classList.add('hover'));
      el.addEventListener('mouseleave',()=>cursor.classList.remove('hover'));
    });
  }

  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealIO.unobserve(entry.target);
    });
  }, {threshold:.13});
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

  const numberIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.done) return;
      el.dataset.done='1';
      const target=Number(el.dataset.count||0), start=performance.now(), dur=1150;
      const tick=now=>{
        const p=Math.min(1,(now-start)/dur), eased=1-Math.pow(1-p,3);
        const value=Math.round(target*eased); const suffix = el.dataset.suffix || ""; el.textContent=`${value}${suffix}`;
        if(p<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, {threshold:.45});
  document.querySelectorAll('[data-count]').forEach(el=>numberIO.observe(el));

  document.querySelectorAll('.world').forEach(world => {
    world.addEventListener('mouseenter', () => {
      document.querySelectorAll('.world').forEach(w=>w.classList.remove('active'));
      world.classList.add('active');
      const img=document.querySelector('.world-preview img');
      if(!img) return;
      img.style.opacity='0';
      img.style.transform='scale(1.08)';
      setTimeout(()=>{
        img.src=world.dataset.image;
        img.style.opacity='1';
        img.style.transform='scale(1)';
      },130);
    });
  });

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      if(!fine || reduce) return;
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.12;
      const y=(e.clientY-r.top-r.height/2)*.12;
      el.style.transform=`translate3d(${x}px,${y}px,0)`;
    });
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });

  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('mousemove', e => {
      if(!fine || reduce) return;
      const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(1000px) rotateX(${-y*7}deg) rotateY(${x*8}deg) scale(1.035)`;
    });
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });



  // Skills field — the words react softly to the pointer instead of sitting in a static list.
  const skillsField = document.querySelector('.skills-field');
  if (skillsField && fine && !reduce) {
    const words = [...skillsField.querySelectorAll('.skill-word')];
    skillsField.addEventListener('mousemove', e => {
      const r = skillsField.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      words.forEach((word, i) => {
        const depth = Number(word.dataset.depth || 1);
        const x = nx * 24 * depth;
        const y = ny * 17 * depth;
        const rot = nx * (i % 2 ? -1.1 : 1.1) * depth;
        word.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rot}deg)`;
      });
    });
    skillsField.addEventListener('mouseleave', () => words.forEach(word => word.style.transform = ''));
  }

  // Final contact invitation — tactile tilt while keeping the CTA professional.
  const contactCard = document.querySelector('.tilt-contact');
  if (contactCard && fine && !reduce) {
    contactCard.addEventListener('mousemove', e => {
      const r = contactCard.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      contactCard.style.transform = `perspective(1200px) rotateX(${-y*4}deg) rotateY(${x*5}deg) rotateZ(-1.2deg) translate3d(${x*7}px,${y*5}px,0)`;
    });
    contactCard.addEventListener('mouseleave', () => contactCard.style.transform = 'rotate(-1.2deg)');
  }

  let latestY = scrollY, ticking = false;
  const onScroll = () => {
    latestY=scrollY;
    if(!ticking){ ticking=true; requestAnimationFrame(update); }
  };

  function update(){
    ticking=false;
    const max=document.documentElement.scrollHeight-innerHeight;
    if(progress) progress.style.height=`${max?latestY/max*100:0}%`;

    if(!reduce && innerWidth>900){
      if(numbers && numbersTrack){
        const r=numbers.getBoundingClientRect();
        const total=numbers.offsetHeight-innerHeight;
        const y=Math.min(total,Math.max(0,-r.top));
        const p=total?y/total:0;
        const shift=Math.max(0,numbersTrack.scrollWidth-innerWidth);
        numbersTrack.style.transform=`translate3d(${-shift*p}px,0,0)`;
      }
      if(work && workTrack){
        const r=work.getBoundingClientRect();
        const total=work.offsetHeight-innerHeight;
        const y=Math.min(total,Math.max(0,-r.top));
        const p=total?y/total:0;
        const shift=Math.max(0,workTrack.scrollWidth-innerWidth+innerWidth*.05);
        workTrack.style.transform=`translate3d(${-shift*p}px,0,0)`;
        if(current){
          const idx=Math.min(4,Math.floor(p*5));
          current.textContent=String(idx+1).padStart(2,'0');
        }
      }
    } else {
      if(numbersTrack) numbersTrack.style.transform='';
      if(workTrack) workTrack.style.transform='';
    }

    document.querySelectorAll('[data-parallax]').forEach(el=>{
      if(reduce) return;
      const r=el.getBoundingClientRect();
      if(r.bottom<0 || r.top>innerHeight) return;
      const speed=Number(el.dataset.parallax||0);
      const delta=(r.top+r.height/2-innerHeight/2)*speed;
      el.style.translate=`0 ${-delta}px`;
    });

    document.querySelectorAll('.places-grid article[data-drift]').forEach((el, i)=>{
      if(reduce) return;
      const r=el.getBoundingClientRect();
      if(r.bottom<0 || r.top>innerHeight) return;
      const d=Number(el.dataset.drift||1);
      const p=(r.top+r.height/2-innerHeight/2)/innerHeight;
      el.style.translate=`0 ${p*-18*d}px`;
      el.style.rotate=`${p*(i%2?1.1:-1.1)}deg`;
    });

    document.querySelectorAll('.travel-collage').forEach(section=>{
      if(reduce) return;
      const r=section.getBoundingClientRect();
      if(r.bottom<0 || r.top>innerHeight) return;
      const p=Math.max(-1,Math.min(1,(r.top+r.height/2-innerHeight/2)/innerHeight));
      section.querySelectorAll('.travel-float').forEach((card,i)=>{
        const base=i===0 ? 22 : -16;
        card.style.translate=`0 ${p*base}px`;
      });
    });

    document.querySelectorAll('.destination').forEach(section=>{
      if(reduce) return;
      const img=section.querySelector('.destination-bg');
      if(!img) return;
      const r=section.getBoundingClientRect();
      const p=Math.max(-1,Math.min(1,r.top/innerHeight));
      img.style.transform=`scale(1.05) translate3d(0,${p*5}%,0)`;
    });
  }

  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',()=>{latestY=scrollY;update()},{passive:true});
  update();
})();
