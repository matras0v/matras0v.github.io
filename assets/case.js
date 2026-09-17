/* ============================================================================
   Shared behaviour for the three case studies. Everything here is optional:
   the pages read correctly with the script blocked, because nothing is
   hidden except behind the `js` class this file's inline partner sets.
   ========================================================================== */
(function(){
  var y = document.getElementById('yr');
  if(y) y.textContent = new Date().getFullYear();

  function fine(){
    return !matchMedia('(prefers-reduced-motion: reduce)').matches &&
           !matchMedia('(hover: none)').matches;
  }

  /* -- reveal ------------------------------------------------------------ */
  var rv = new IntersectionObserver(function(en){
    en.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.classList.add('in');
      rv.unobserve(e.target);
    });
  }, {rootMargin:'0px 0px -8% 0px', threshold:.06});
  document.querySelectorAll('.rv, .rv-depth').forEach(function(el){ rv.observe(el); });

  /* -- the light inside a control follows the pointer -------------------- */
  if(fine()){
    document.querySelectorAll('.btn').forEach(function(b){
      var raf = 0;
      b.addEventListener('pointermove', function(e){
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left, y2 = e.clientY - r.top;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function(){
          b.style.setProperty('--mx', x + 'px');
          b.style.setProperty('--my', y2 + 'px');
        });
      });
    });
  }
})();
