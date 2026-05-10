/* ---------------- ROOM 1 ---------------- */

const messages = {
  1: "I love you so much, amma, more than what words can express",
  2: "You mean the world to me, amma",
  3: "I'm so grateful to have you in my life, amma",
  4: "I hope this day is filled with happiness for you, amma",
  5: "You're the best mother in the world, amma!"
};

const colors = {
  1: "#F7C8D0",
  2: "#DCC7FF",
  3: "#CFF5E7",
  4: "#FFF4C2",
  5: "#D7ECFF"
};

let collected = {1:false,2:false,3:false,4:false,5:false};
let collectedCount = 0;

document.querySelectorAll(".spot").forEach(spot => {
  spot.addEventListener("click", () => {
    const id = spot.dataset.id;

    const flower = createBigFlower(id, spot.style.top, spot.style.left);
    document.getElementById("garden").appendChild(flower);

    spot.style.display = "none";

    document.getElementById("modal-text").innerText = messages[id];
    document.getElementById("modal").style.display = "flex";

    if (!collected[id]) {
      collected[id] = true;
      collectedCount++;

      const slot = document.getElementById("slot" + id);
      slot.style.background = colors[id];

      if (collectedCount === 5) {
        document.getElementById("next-room").style.display = "block";
      }
    }
  });
});

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

function createBigFlower(id, top, left) {
  const flower = document.createElement("div");
  flower.classList.add("flower");
  flower.style.top = top;
  flower.style.left = left;

  flower.style.setProperty("--petal-color", colors[id]);
  flower.style.setProperty("--center-color", "#A87F7F");

  for (let i = 0; i < 5; i++) {
    const petal = document.createElement("div");
    petal.classList.add("petal");
    petal.style.transform =
      `translate(-50%, -50%) rotate(${i * 72}deg) translate(0, -18px)`;
    flower.appendChild(petal);
  }

  const center = document.createElement("div");
  center.classList.add("center");
  flower.appendChild(center);

  return flower;
}

/* ---------------- ENTER ROOM 2 ---------------- */

document.getElementById("next-room").addEventListener("click", () => {
  document.getElementById("room1").style.display = "none";
  document.getElementById("room2").style.display = "block";
  document.getElementById("next-room").style.display = "none";
  setupRoom2();
});

/* ---------------- ROOM 2 PLACEMENT ---------------- */

const placementPositions = {
  1: { top: "18%", left: "18%" },
  2: { top: "18%", left: "82%" },
  3: { top: "82%", left: "18%" },
  4: { top: "82%", left: "82%" },
  5: { top: "50%", left: "72%" }
};

function setupRoom2() {
  const placementArea = document.getElementById("placement-area");
  let placedCount = 0;

  document.querySelectorAll(".slot").forEach(slot => {
    slot.style.opacity = "1";
    slot.style.visibility = "visible";
    slot.style.pointerEvents = "auto";
  });

  Object.keys(collected).forEach(id => {
    const invFlower = document.getElementById("slot" + id);
    invFlower.style.cursor = "pointer";

    invFlower.addEventListener("click", function handleClick() {
      invFlower.removeEventListener("click", handleClick);

      const pos = placementPositions[id];
      const placed = createBigFlower(id, pos.top, pos.left);
      placementArea.appendChild(placed);

      invFlower.style.opacity = "0";

      placedCount++;

      if (placedCount === 5) {
        startMosaicSequence();
      }
    });
  });
}

/* ---------------- NON-GRID CHAOTIC MOSAIC ENGINE ---------------- */

function startMosaicSequence() {
  // Hide inventory bar
  const inv = document.getElementById("inventory");
  if (inv) inv.style.display = "none";

  const placementArea = document.getElementById("placement-area");
  const bigFlowers = placementArea.querySelectorAll(".flower");

  bigFlowers.forEach(f => {
    f.style.transition = "opacity 1s ease";
    f.style.opacity = "1";
  });

  setTimeout(() => {
    runFlowerSwarm(bigFlowers);
  }, 800);
}

function runFlowerSwarm(bigFlowers) {
  const canvas = document.getElementById("mosaic-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const img = new Image();
  img.src = "assets/final-image.jpg";

  img.onload = () => {
    // make sure canvas is visible
    canvas.style.opacity = "1";

    const MAX_SIZE = 200;
    const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);

    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);

    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    const tctx = temp.getContext("2d");
    tctx.drawImage(img, 0, 0, w, h);

    const data = tctx.getImageData(0, 0, w, h).data;

    const FLOWERS = 8000;
    let particles = [];

    for (let i = 0; i < FLOWERS; i++) {
      const x = Math.floor(Math.random() * w);
      const y = Math.floor(Math.random() * h);

      const p = (y * w + x) * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const a = data[p + 3];

      if (a < 20) continue;

      const finalX = (x / w) * canvas.width;
      const finalY = (y / h) * canvas.height;

      particles.push({
        startX: Math.random() * canvas.width,
        startY: Math.random() * canvas.height,
        finalX,
        finalY,
        sizeStart: Math.random() * 10 + 5,
        sizeEnd: 6,
        r, g, b,
        t: 0
      });
    }

    if (particles.length === 0) {
      // fallback: do nothing instead of freezing
      return;
    }

    let zoom = 3.0;
    let zoomT = 0;
    let bigFaded = false;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      zoomT += 0.004;
      zoom = lerp(3.0, 1.0, easeOut(zoomT));

      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate(
        -(canvas.width * (zoom - 1)) / (2 * zoom),
        -(canvas.height * (zoom - 1)) / (2 * zoom)
      );

      let done = 0;

      particles.forEach(p => {
        p.t += 0.01;
        if (p.t >= 1) {
          p.t = 1;
          done++;
        }

        const tt = easeOut(p.t);

        const x = lerp(p.startX, p.finalX, tt);
        const y = lerp(p.startY, p.finalY, tt);
        const size = lerp(p.sizeStart, p.sizeEnd, tt);

        const color = `rgb(${p.r},${p.g},${p.b})`;

        drawFlower(ctx, x, y, size, color);
      });

      ctx.restore();

      const ratio = done / particles.length;

      if (!bigFaded && ratio > 0.7) {
        bigFaded = true;
        bigFlowers.forEach(f => {
          f.style.transition = "opacity 1.5s ease";
          f.style.opacity = "0";
        });
      }

      if (done < particles.length || zoomT < 1) {
        requestAnimationFrame(animate);
      }
    }

    animate();
  };
}

function drawFlower(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;

  for (let i = 0; i < 5; i++) {
    ctx.rotate((Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.4, size * 0.25, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}
