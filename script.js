let S = {
  speed: { x: 0, y: 0, z: 0 },
  pos: { x: 0, y: 2000, z: 0 },
  gravity: -8,
  fps: 60,
  crashEnergyLoss: 0.5,
  keyPressForce: 600,
  friction: 10
};

function enterFrame() {
  S.speed.y += S.gravity / S.fps;
  S.speed.x *= 1 - Math.min(1, S.friction / S.fps);
  S.speed.z *= 1 - Math.min(1, S.friction / S.fps);
  for (var d in S.pos) {
    S.pos[d] += S.speed[d];
  }
  if (S.pos.y < 0) {
    S.speed.y = -S.crashEnergyLoss * S.speed.y;
    S.pos.y = 0;
  }

  scene.style.setProperty("--vy", S.pos.y + "px");
  scene.style.setProperty("--vx", S.pos.x + "px");
  scene.style.setProperty("--vz", S.pos.z + "px");
  setTimeout(enterFrame, 1000 / S.fps);
}

const S0 = JSON.parse(JSON.stringify(S));
const scene = document.querySelector(".scene");
const KEYS = {};

const keyHandlers = {
  ArrowRight: () => (S.speed.x -= S.keyPressForce / S.fps),
  ArrowLeft: () => (S.speed.x += S.keyPressForce / S.fps),
  ArrowUp: () => (S.speed.z += S.keyPressForce / S.fps),
  ArrowDown: () => (S.speed.z -= S.keyPressForce / S.fps),
  r: () => (S = JSON.parse(JSON.stringify(S0))),
  " ": () => (S.speed.y += (0.6 * S.keyPressForce) / S.fps)
};

window.addEventListener("keydown", ({ key }) => (KEYS[key] = true));
window.addEventListener("keyup", ({ key }) => delete KEYS[key]);
window.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const tc = e.changedTouches[0];
    const dX = (KEYS["tmX"] || tc.screenX) - tc.screenX;
    const dY = (KEYS["tmY"] || tc.screenY) - tc.screenY;
    KEYS["tmX"] = tc.screenX;
    KEYS["tmY"] = tc.screenY;
    if (dX > 5) keyHandlers.ArrowRight();
    if (dX < -5) keyHandlers.ArrowLeft();
    if (dY > 5) keyHandlers.ArrowUp();
    if (dY < -5) keyHandlers.ArrowDown();
  },
  { passive: false }
);
window.addEventListener("touchend", (e) => {
  e.preventDefault();
  ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].map(
    (k) => delete KEYS[k]
  );
});
window.addEventListener("load", enterFrame);
window.addEventListener("click", (e) => keyHandlers[" "]());

document;

setInterval((e) => {
  for (var k in KEYS) {
    var h = keyHandlers[k] || ((e) => null);
    h();
  }
}, 100);
