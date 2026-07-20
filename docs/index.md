---
title: Alessandro Sanvito | Software and AI Engineer
layout: page
---

<div class="home-hero" id="home-hero">
  <canvas id="hero-canvas" aria-hidden="true"></canvas>
  <p class="home-hero-caption">gradient descent with momentum on a random loss surface — reload for a new one</p>
</div>

<script>
(function () {
  var hero = document.getElementById('home-hero');
  var canvas = document.getElementById('hero-canvas');
  if (!hero || !canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var contourLayer = document.createElement('canvas');
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Random loss surface: a sum of Gaussian bumps and dips over [0,1]².
  var blobs = [];
  for (var i = 0; i < 7; i++) {
    blobs.push({
      x: 0.08 + 0.84 * Math.random(),
      y: 0.12 + 0.76 * Math.random(),
      s: 0.09 + 0.13 * Math.random(),
      a: (i % 2 === 0 ? -1 : 1) * (0.6 + 0.8 * Math.random())
    });
  }
  function loss(x, y) {
    var v = 0;
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i], dx = x - b.x, dy = y - b.y;
      v += b.a * Math.exp(-(dx * dx + dy * dy) / (2 * b.s * b.s));
    }
    return v;
  }
  function grad(x, y) {
    var gx = 0, gy = 0;
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i], dx = x - b.x, dy = y - b.y;
      var e = b.a * Math.exp(-(dx * dx + dy * dy) / (2 * b.s * b.s)) / (b.s * b.s);
      gx -= e * dx;
      gy -= e * dy;
    }
    return [gx, gy];
  }

  function tokens() {
    var s = getComputedStyle(hero);
    return {
      contour: s.getPropertyValue('--viz-contour').trim(),
      particle: s.getPropertyValue('--viz-particle').trim(),
      trail: s.getPropertyValue('--viz-trail').trim()
    };
  }

  // Contour lines via marching squares, rendered once per resize/theme.
  function drawContours() {
    var c = contourLayer.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    var t = tokens();
    c.strokeStyle = t.contour;
    c.lineWidth = 1;
    var nx = 96, ny = 40;
    var grid = [];
    for (var j = 0; j <= ny; j++) {
      grid[j] = [];
      for (var i = 0; i <= nx; i++) grid[j][i] = loss(i / nx, j / ny);
    }
    var levels = [-1.1, -0.85, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.85, 1.1];
    function lerp(a, b, l) { return (l - a) / (b - a || 1e-9); }
    c.beginPath();
    for (var li = 0; li < levels.length; li++) {
      var L = levels[li];
      for (var j = 0; j < ny; j++) {
        for (var i = 0; i < nx; i++) {
          var x0 = i / nx * W, x1 = (i + 1) / nx * W;
          var y0 = j / ny * H, y1 = (j + 1) / ny * H;
          var tl = grid[j][i], tr = grid[j][i + 1], br = grid[j + 1][i + 1], bl = grid[j + 1][i];
          var idx = (tl > L ? 8 : 0) | (tr > L ? 4 : 0) | (br > L ? 2 : 0) | (bl > L ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          var top = [x0 + lerp(tl, tr, L) * (x1 - x0), y0];
          var right = [x1, y0 + lerp(tr, br, L) * (y1 - y0)];
          var bottom = [x0 + lerp(bl, br, L) * (x1 - x0), y1];
          var left = [x0, y0 + lerp(tl, bl, L) * (y1 - y0)];
          var segs = {
            1: [left, bottom], 2: [bottom, right], 3: [left, right], 4: [top, right],
            5: [top, left, bottom, right], 6: [top, bottom], 7: [top, left],
            8: [top, left], 9: [top, bottom], 10: [top, right, bottom, left],
            11: [top, right], 12: [left, right], 13: [bottom, right], 14: [left, bottom]
          }[idx];
          for (var s = 0; s < segs.length; s += 2) {
            c.moveTo(segs[s][0], segs[s][1]);
            c.lineTo(segs[s + 1][0], segs[s + 1][1]);
          }
        }
      }
    }
    c.stroke();
  }

  var N = 14;
  var particles = [];
  function spawn(p) {
    p = p || {};
    p.x = Math.random();
    p.y = Math.random();
    p.vx = 0;
    p.vy = 0;
    p.age = 0;
    p.trail = [];
    return p;
  }
  for (var i = 0; i < N; i++) particles.push(spawn());

  function step(p) {
    var g = grad(p.x, p.y);
    p.vx = 0.90 * p.vx - 0.0006 * g[0];
    p.vy = 0.90 * p.vy - 0.0006 * g[1];
    p.x += p.vx;
    p.y += p.vy;
    p.age++;
    p.trail.push([p.x, p.y]);
    if (p.trail.length > 34) p.trail.shift();
    var stuck = Math.abs(p.vx) + Math.abs(p.vy) < 0.00004 && p.age > 90;
    var out = p.x < -0.05 || p.x > 1.05 || p.y < -0.05 || p.y > 1.05;
    if (stuck || out || p.age > 900) spawn(p);
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(contourLayer, 0, 0, W, H);
    var t = tokens();
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (p.trail.length > 1) {
        ctx.strokeStyle = t.trail;
        ctx.lineWidth = 1;
        for (var k = 1; k < p.trail.length; k++) {
          ctx.globalAlpha = k / p.trail.length * 0.8;
          ctx.beginPath();
          ctx.moveTo(p.trail[k - 1][0] * W, p.trail[k - 1][1] * H);
          ctx.lineTo(p.trail[k][0] * W, p.trail[k][1] * H);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = t.particle;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame() {
    for (var i = 0; i < particles.length; i++) step(particles[i]);
    draw();
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  function resize() {
    var r = hero.getBoundingClientRect();
    W = r.width;
    H = r.height;
    canvas.width = contourLayer.width = Math.round(W * dpr);
    canvas.height = contourLayer.height = Math.round(H * dpr);
    drawContours();
    draw();
  }
  window.addEventListener('resize', resize);
  resize();

  // Recolor when the site theme toggles (same MutationObserver pattern
  // as the study notes).
  new MutationObserver(function () {
    drawContours();
    draw();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (reduceMotion) {
    for (var s = 0; s < 220; s++) {
      for (var i = 0; i < particles.length; i++) step(particles[i]);
    }
    draw();
  } else {
    requestAnimationFrame(frame);
  }
})();
</script>

<div class="about-container">
  <div class="about-content">
    I'm <strong>Alessandro Sanvito</strong>, a Software Engineer at <strong>Optiver</strong> in Amsterdam. I work in the Data Driven Algorithmic Position Taking team, building data pipelines and trading strategies that directly influence our trading operations.

    Before Optiver, I was an AI Research Intern at <strong>Mercedes-Benz</strong> in Stuttgart, where I worked on 3D human avatar modeling from monocular video using NeRFs and Diffusion Models. That work led to papers at <a href="/publications/">ICCV and IEEE IV</a>.

    I hold dual master's degrees from <strong>KTH Royal Institute of Technology</strong> (ICT Innovation, Data Science) and <strong>Politecnico di Milano</strong> (Computer Science and Engineering, 110/110 cum laude).
  </div>
  <div class="profile-picture">
    <img src="/images/alessandro.jpeg" alt="Alessandro Sanvito" />
  </div>
</div>

## What I work with

At Optiver I build data processing systems in Python, Spark, Polars, and DuckDB, storing data in PostgreSQL and Delta tables. I work closely with quant researchers and traders to implement and tune systematic strategies.

My ML background spans deep learning (PyTorch, TensorFlow) with a focus on computer vision and generative models, plus classical ML with scikit-learn, CatBoost, and XGBoost.

## Get in touch

Find me on [LinkedIn](https://linkedin.com/in/alessandro-sanvito-07706114b) and [GitHub](https://github.com/Alexdruso), or download my [CV](/public/Alessandro_Sanvito_CV.pdf).
