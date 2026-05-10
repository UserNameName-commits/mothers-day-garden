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

/* ---------------- NEW MOSAIC ENGINE ---------------- */

function startMosaicSequence() {
  const placementArea = document.getElementById("placement-area");
  const bigFlowers = placementArea.querySelectorAll(".flower");

  bigFlowers.forEach(f => {
    f.style.transition = "opacity 1s ease";
    f.style.opacity = "1"; // keep visible initially
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
    const temp = document.createElement("canvas");
    temp.width = img.width;
    temp.height = img.height;
    const tctx = temp.getContext("2d");
    tctx.drawImage(img, 0, 0);
    const data = tctx.getImageData(0, 0, img.width, img.height).data;

    const FLOWER_COUNT = 8000;
    let flowers = [];

    for (let i = 0; i < FLOWER_COUNT; i++) {
      const x = Math.floor(Math.random() * img.width);
      const y = Math.floor(Math.random() * img.height);

      const p = (y * img.width + x) * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const a = data[p + 3];

      if (a < 20) continue;

      const finalX = (x / img.width) * canvas.width;
      const finalY = (y / img.height) * canvas.height;

      flowers.push({
        startX: Math.random() * canvas.width,
        startY: Math.random() * canvas.height,
        finalX,
        finalY,
        startSize: Math.random() * 8 + 4,
        finalSize: 6,
        r, g, b,
        progress: 0
      });
    }

    let cameraZoom = 3.0;
    let zoomProgress = 0;
    let bigFlowersFaded = false;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      zoomProgress += 0.004;
      cameraZoom = lerp(3.0, 1.0, easeOut(zoomProgress));

      ctx.save();
      ctx.scale(cameraZoom, cameraZoom);
      ctx.translate(
        -(canvas.width * (cameraZoom - 1)) / (2 * cameraZoom),
        -(canvas.height * (cameraZoom - 1)) / (2 * cameraZoom)
      );

      let completed = 0;

      flowers.forEach(f => {
        f.progress += 0.01;
        if (f.progress >= 1) {
          f.progress = 1;
          completed++;
        }

        const t = easeOut(f.progress);

        const cx = lerp(f.startX, f.finalX, t);
        const cy = lerp(f.startY, f.finalY, t);
        const size = lerp(f.startSize, f.finalSize, t);

        const color = `rgb(${f.r},${f.g},${f.b})`;

        drawFlower(ctx, cx, cy, size, color);
      });

      ctx.restore();

      const ratio = completed / flowers.length;

      if (!bigFlowersFaded && ratio > 0.7) {
        bigFlowersFaded = true;
        bigFlowers.forEach(f => {
          f.style.transition = "opacity 1.5s ease";
          f.style.opacity = "0";
        });
      }

      if (completed < flowers.length || zoomProgress < 1) {
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
