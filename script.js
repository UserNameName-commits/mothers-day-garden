/* ---------------- ROOM 1 ---------------- */

const messages = {
  1: "I love you so much, amma, more than what words can express",
  2: "You mean the world to me, amma",
  3: "You mean the world to me, amma",
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

      // ⭐ Show flower briefly, then fade out and remove
      setTimeout(() => {
        placed.style.opacity = "0";
        setTimeout(() => placed.remove(), 300);
      }, 500);

      invFlower.style.opacity = "0";

      placedCount++;

      if (placedCount === 5) {
        startOverlay();
      }
    });
  });
}

/* ---------------- FINAL IMAGE OVERLAY ---------------- */

function startOverlay() {
  // Hide inventory
  const inv = document.getElementById("inventory");
  if (inv) inv.style.display = "none";

  // ⭐ Instantly hide instructions (opacity + display)
  const instructions = document.getElementById("instructions");
  if (instructions) {
    instructions.style.opacity = "0";
    instructions.style.display = "none";
  }

  // Remove any leftover flowers
  const placementArea = document.getElementById("placement-area");
  placementArea.querySelectorAll(".flower").forEach(f => f.remove());

  // Show final image
  const finalImg = document.getElementById("final-image");
  finalImg.style.opacity = "1";
  finalImg.style.transform = "none";
}
