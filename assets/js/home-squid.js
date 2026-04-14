document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.querySelector(".js-home-canvas");
  var quoteText = document.querySelector(".js-home-quote-text");
  var warningText = document.querySelector(".js-home-warning-text");
  var quotes = [
    "A matemática é a linguagem com a qual Deus escreveu o universo. (Galileo Galilei)",

"A matemática é a rainha das ciências, e a teoria dos números é a rainha da matemática. (Carl Friedrich Gauss)",

"Não existem ramos da matemática, apenas diferentes pontos de vista sobre o mesmo objeto. (Henri Poincaré)",

"A essência da matemática está na sua liberdade. (Georg Cantor)",

"Deus não joga dados com o universo. (Albert Einstein)",

"A matemática pura é, à sua maneira, a poesia das ideias lógicas. (Albert Einstein)",

"A matemática não mente; quem mente são os matemáticos. (Carl Friedrich Gauss)",

"A prova de um matemático é como uma pintura ou um poema — ideias devem se encaixar de maneira harmoniosa. (G. H. Hardy)",

"Se eu vi mais longe, foi por estar sobre os ombros de gigantes. (Isaac Newton)",

"A matemática revela seus segredos apenas àqueles que a abordam com amor. (Archimedes)",

"A beleza é o primeiro teste: não há lugar permanente no mundo para a matemática feia.(G. H. Hardy)",

"A matemática é o alfabeto com o qual Deus escreveu o mundo. (Galileo Galilei)",

"Um matemático é uma máquina que transforma café em teoremas. (Paul Erdős)",

"Não podemos resolver nossos problemas com o mesmo pensamento que usamos quando os criamos. (Albert Einstein)",

"A matemática é a ciência dos padrões. (Keith Devlin)",

"Na matemática, você não entende as coisas. Você simplesmente se acostuma com elas (John von Neumann)",

"A matemática é a arte de dar o mesmo nome a coisas diferentes. (Henri Poincaré)",

"A matemática é o mais poderoso e belo instrumento da mente humana. (Stefan Banach)",

"A matemática começa onde termina o bom senso. (Bertrand Russell)",

"A matemática é a música da razão. (James Joseph Sylvester)",

"A matemática é o lugar onde você pode fazer coisas que não pode fazer no mundo real. (Marcus du Sautoy)",

"Os números governam o mundo. (Pitágoras)",

"A matemática é infinita como o próprio pensamento humano. (David Hilbert)",

"Devemos saber. Saberemos. (David Hilbert)",

"A matemática não é sobre números, equações, cálculos ou algoritmos: é sobre entendimento. (William Paul Thurston)",

"A descoberta matemática é uma viagem, não um destino. (Terence Tao)",

"A matemática é a chave e a porta para as ciências. (Roger Bacon)",

"A matemática é o tribunal final do pensamento. (Charles Sanders Peirce)",

"A matemática é a ciência que tira conclusões necessárias. (Benjamin Peirce)",

"A matemática é a mais segura das ciências, porque suas provas são baseadas na razão pura.(René Descartes)",

"A matemática é a base de todo conhecimento exato. (Leonhard Euler)",

"A matemática é o espelho da mente humana. (Richard Courant)",

"A matemática é a ciência da ordem e da medida. (Aristóteles)"
  ];
  var warningMessage = "Se não estudar, o bicho da DP aparece sem avisar.";

  if (!canvas) {
    return;
  }

  var ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  var PI2 = Math.PI * 2;
  var gravity = 0.1;
  var friction = 0.95;
  var radius = 30;
  var tentacleWidth = 8;
  var numTentacles = 6;
  var numPoints = 10;

  var mouse = { x: 0, y: 0, angle: 0 };
  var squid;
  var tentacles = [];
  var particles = [];
  var width = 0;
  var height = 0;
  var animationId = 0;
  var warningTimer = 0;

  function animateTextEntry(element, text, hiddenClass, visibleClass, delay) {
    if (!element) {
      return;
    }

    element.classList.remove(visibleClass);
    element.classList.add(hiddenClass);
    element.textContent = "";

    window.setTimeout(function () {
      element.textContent = text;
      element.classList.remove(visibleClass);
      element.classList.add(hiddenClass);

      void element.offsetWidth;

      element.classList.remove(hiddenClass);
      element.classList.add(visibleClass);
    }, delay);
  }

  function setRandomQuote() {
    if (!quoteText || !quotes.length) {
      return;
    }

    var selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
    animateTextEntry(quoteText, selectedQuote, "is-quote-hidden", "is-quote-visible", 120);
  }

  function setRandomWarning() {
    if (!warningText) {
      return;
    }

    var isMobile = width <= 640;
    var horizontalPadding = isMobile
      ? Math.max(88, Math.round(width * 0.14))
      : Math.min(220, Math.max(120, Math.round(width * 0.2)));
    var verticalPadding = isMobile
      ? Math.max(120, Math.round(height * 0.22))
      : Math.min(180, Math.max(110, Math.round(height * 0.16)));
    var maxLeft = Math.max(horizontalPadding, width - horizontalPadding);
    var minTop = verticalPadding;
    var maxTop = isMobile
      ? Math.max(minTop + 20, height - Math.max(150, Math.round(height * 0.22)))
      : Math.max(minTop + 20, height - verticalPadding);
    var nextLeft = randomBetween(horizontalPadding, maxLeft);
    var nextTop = randomBetween(minTop, maxTop);

    warningText.style.left = nextLeft + "px";
    warningText.style.top = nextTop + "px";

    animateTextEntry(warningText, warningMessage, "is-warning-hidden", "is-warning-visible", 80);
  }

  function scheduleWarning() {
    window.clearTimeout(warningTimer);
    warningTimer = window.setTimeout(function () {
      warningText.classList.remove("is-warning-visible");
      warningText.classList.add("is-warning-hidden");

      window.setTimeout(function () {
        setRandomWarning();
        scheduleWarning();
      }, 700);
    }, 15000);
  }

  function distanceBetween(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function syncCanvasSize() {
    width = Math.max(320, window.innerWidth);
    height = Math.max(320, window.innerHeight);
    canvas.width = width;
    canvas.height = height;
  }

  function buildScene() {
    syncCanvasSize();

    mouse.x = width / 2;
    mouse.y = height / 2;

    squid = {
      x: mouse.x,
      y: mouse.y,
      radius: radius,
      bodyWidth: radius * 2,
      bodyHeight: 30,
      angle: 0,
      velocity: 0
    };

    tentacles = [];
    particles = [];

    var connectionX = squid.x - squid.radius - tentacleWidth;
    var incX = squid.bodyWidth / (numTentacles - 1);
    var i;

    for (i = 0; i < numTentacles; i += 1) {
      var length = randomBetween(5, 20);
      var tentacle = {
        length: length,
        connections: []
      };
      var connectionY = squid.y + squid.bodyHeight;
      var q;

      for (q = 0; q < numPoints; q += 1) {
        tentacle.connections.push({
          x: connectionX,
          y: connectionY,
          oldX: connectionX,
          oldY: connectionY
        });

        connectionY += length;
      }

      connectionX += incX;
      tentacles.push(tentacle);
    }
  }

  function updatePoints() {
    tentacles.forEach(function (tentacle) {
      tentacle.connections.forEach(function (point) {
        var velX = point.x - point.oldX;
        var velY = point.y - point.oldY;

        point.oldX = point.x;
        point.oldY = point.y;

        point.x += velX * friction;
        point.y += velY * friction;
        point.y += gravity;
      });
    });
  }

  function updateSticks() {
    tentacles.forEach(function (tentacle) {
      var i;

      for (i = 0; i < tentacle.connections.length - 1; i += 1) {
        var from = tentacle.connections[i];
        var to = tentacle.connections[i + 1];
        var dx = to.x - from.x;
        var dy = to.y - from.y;
        var distance = distanceBetween(from, to) || 1;
        var difference = tentacle.length - distance;
        var percent = difference / distance / 2;
        var offsetX = dx * percent;
        var offsetY = dy * percent;

        from.x -= offsetX;
        from.y -= offsetY;
        to.x += offsetX;
        to.y += offsetY;
      }
    });
  }

  function connectTentacles() {
    var x = squid.x - squid.radius + tentacleWidth / 2;
    var y = squid.y + squid.bodyHeight;
    var posInc = (squid.bodyWidth - tentacleWidth) / (tentacles.length - 1);

    tentacles.forEach(function (tentacle) {
      var connector = tentacle.connections[0];
      var angleDiff = angleBetween(squid.x, squid.y, x, y);
      var dx = squid.x - x;
      var dy = squid.y - y;
      var h = Math.sqrt(dx * dx + dy * dy);

      connector.x = squid.x + Math.cos(angleDiff + squid.angle) * h;
      connector.y = squid.y + Math.sin(angleDiff + squid.angle) * h;

      x += posInc;
    });
  }

  function drawTentacles() {
    ctx.strokeStyle = "rgba(24, 24, 24, 0.9)";

    tentacles.forEach(function (tentacle) {
      ctx.beginPath();
      ctx.lineWidth = tentacleWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(tentacle.connections[0].x, tentacle.connections[0].y);

      tentacle.connections.slice(1).forEach(function (connector) {
        ctx.lineTo(connector.x, connector.y);
      });

      ctx.stroke();
      ctx.closePath();
    });
  }

  function updateSquid() {
    var newX = squid.x + (mouse.x - squid.x) / 50;
    var newY = squid.y + (mouse.y - squid.y) / 50;
    var velocity = squid.x - newX;

    squid.angle = -velocity * 0.1;
    squid.velocity = velocity;
    squid.x = newX;
    squid.y = newY;
  }

  function drawSquid() {
    var eyeXInc = Math.cos(mouse.angle) * 5;
    var eyeYInc = Math.sin(mouse.angle) * 5;
    var eyeXInc2 = Math.cos(mouse.angle) * 10;
    var eyeYInc2 = Math.sin(mouse.angle) * 10;

    ctx.save();
    ctx.translate(squid.x, squid.y);
    ctx.rotate(squid.angle);

    ctx.beginPath();
    ctx.fillStyle = "#111111";
    ctx.rect(-squid.radius, 0, squid.bodyWidth, squid.bodyHeight);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "#111111";
    ctx.arc(0, 0, squid.radius, 0, PI2, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(-15 + eyeXInc, eyeYInc, 4, 0, PI2, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(18 + eyeXInc2, eyeYInc2, 6, 0, PI2, false);
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }

  function drawParticles() {
    particles.forEach(function (particle) {
      particle.radius *= 1.025;
      particle.life *= 0.97;
      particle.isDead = particle.life <= 0.1;
      particle.x += Math.cos(particle.angle) * particle.velocity;
      particle.y += Math.sin(particle.angle) * particle.velocity;

      ctx.beginPath();
      ctx.fillStyle = "rgba(255, 255, 255, " + particle.life + ")";
      ctx.arc(particle.x, particle.y, particle.radius, 0, PI2, false);
      ctx.fill();
      ctx.closePath();
    });

    particles = particles.filter(function (particle) {
      return !particle.isDead;
    });
  }

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function loop() {
    clear();
    drawParticles();
    updateSquid();
    updatePoints();
    updateSticks();
    connectTentacles();
    drawTentacles();
    drawSquid();

    if (Math.abs(squid.velocity) > 2 && particles.length < 200) {
      tentacles.forEach(function (tentacle) {
        var pos = tentacle.connections[tentacle.connections.length - 1];
        var angle = angleBetween(pos.x, pos.y, mouse.x, mouse.y);

        particles.push({
          x: pos.x,
          y: pos.y,
          life: 1,
          radius: 1,
          isDead: false,
          velocity: randomBetween(1, 3) * 0.5,
          angle: angle
        });
      });
    }

    animationId = window.requestAnimationFrame(loop);
  }

  function updatePointerPosition(clientX, clientY) {
    mouse.x = clientX;
    mouse.y = clientY;
    mouse.angle = angleBetween(squid.x, squid.y, mouse.x, mouse.y);
  }

  function onPointerMove(event) {
    var target = event.touches && event.touches.length ? event.touches[0] : event;
    updatePointerPosition(target.clientX, target.clientY);
  }

  function centerPointer() {
    mouse.x = width / 2;
    mouse.y = height / 2;
    mouse.angle = angleBetween(squid.x, squid.y, mouse.x, mouse.y);
  }

  window.addEventListener("resize", buildScene);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("mouseleave", centerPointer);
  window.addEventListener("touchend", centerPointer);

  buildScene();
  centerPointer();
  setRandomWarning();
  scheduleWarning();
  setRandomQuote();
  loop();

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      window.clearTimeout(warningTimer);
      window.cancelAnimationFrame(animationId);
      return;
    }

    setRandomWarning();
    scheduleWarning();
    window.cancelAnimationFrame(animationId);
    loop();
  });
});
