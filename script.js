let S = {
  // World State
  speed: { x: 0, y: 0, z: 0 },
  pos: { x: 0, y: 2000, z: 0 },
  angle: { x: 0, y: 0 },
  gravity: -10,
  fps: 60,
  crashEnergyLoss: 0.3,
  keyPressForce: 600,
  friction: 10,
  tileSize: 500
};

function showTiles(ground) {
  const nTiles = document.querySelector(".tiles");
  nTiles.innerHTML = "";
  nTiles.style.width = `${S.tileSize * ground.w}px`;
  nTiles.style.height = `${S.tileSize * ground.h}px`;
  nTiles.style.setProperty("--size", `${S.tileSize}px`);
  ground.tiles.forEach(([x, y]) => {
    var n = document.createElement("div");
    n.className = "tile";
    n.style.left = `${x * S.tileSize}px`;
    n.style.top = `${y * S.tileSize}px`;
    nTiles.appendChild(n);
  });
}

function generateTiles(cnt) {
  const rt = { "0x0": [0, 0] };
  let l = rt["0x0"];
  for (var i = cnt; i > 1; i--) {
    let n = null;
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        n = [l[0] + 1, l[1]];
        break;
      case 1:
        n = [l[0], l[1] + 1];
        break;
      case 2:
        n = [l[0] - 1, l[1]];
        break;
      case 3:
      default:
        n = [l[0], l[1] - 1];
        break;
    }
    const k = n.join("x");
    if (rt[k]) {
      i++;
      l = n;
      continue;
    }
    rt[k] = l = n;
  }
  const L = Object.values(rt);
  let minX = L.reduce((p, t) => (p !== null && p < t[0] ? p : t[0]), null);
  let maxX = L.reduce((p, t) => (p !== null && p > t[0] ? p : t[0]), null);
  let minY = L.reduce((p, t) => (p !== null && p < t[1] ? p : t[1]), null);
  let maxY = L.reduce((p, t) => (p !== null && p > t[1] ? p : t[1]), null);

  return {
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    tiles: L.map((t) => [t[0] - minX, t[1] - minY])
  };
}

showTiles(generateTiles(100));

function enterFrame() {
  S.speed.y += S.gravity / S.fps;
  S.speed.x *= 1 - Math.min(1, S.friction / S.fps);
  S.speed.z *= 1 - Math.min(1, S.friction / S.fps);
  for (var d in S.pos) {
    S.pos[d] += S.speed[d];
  }
  if (S.pos.y < 100) {
    S.speed.y = -S.crashEnergyLoss * S.speed.y;
    S.pos.y = 100;
  }

  scene.style.setProperty("--vy", S.pos.y + "px");
  scene.style.setProperty("--vx", S.pos.x + "px");
  scene.style.setProperty("--vz", S.pos.z + "px");
  scene.style.setProperty("--rx", S.angle.x + "deg");
  scene.style.setProperty("--ry", S.angle.y + "deg");
  setTimeout(enterFrame, 1000 / S.fps);
}

function moveOnAngle({ dx = 0, dz = 0 }) {
  const A = {};
  for (var a in S.angle) {
    A[a] = -(Math.PI * S.angle[a]) / 180;
  }

  S.speed.z += Math.cos(A.y) * dz;
  S.speed.x += Math.sin(A.y) * dz;

  S.speed.z += Math.cos(A.y + Math.PI / 2) * dx;
  S.speed.x += Math.sin(A.y + Math.PI / 2) * dx;
}

const S0 = JSON.parse(JSON.stringify(S));
const scene = document.querySelector(".scene");
const KEYS = {};
const distance = () => S.keyPressForce / S.fps;

const keyHandlers = {
  ArrowRight: () => moveOnAngle({ dx: -distance() }),
  ArrowLeft: () => moveOnAngle({ dx: distance() }),
  ArrowUp: () => moveOnAngle({ dz: distance() }),
  ArrowDown: () => moveOnAngle({ dz: -distance() }),
  r: () => (S = JSON.parse(JSON.stringify(S0))),
  " ": () => (S.speed.y += (0.6 * S.keyPressForce) / S.fps)
};

const onMouseMove = (e) => {
  if (KEYS.mouseDown) {
    const dX = (KEYS.mouseX || e.clientX) - e.clientX;
    const dY = (KEYS.mouseY || e.clientY) - e.clientY;
    KEYS.mouseX = e.clientX;
    KEYS.mouseY = e.clientY;
    KEYS.allowClick = KEYS.allowClick && Math.abs(dX) + Math.abs(dY) < 2;
    S.angle.x += dY / 4;
    S.angle.y += dX / 4;
  }
};

const onMouseDown = (e) => {
  KEYS.allowClick = true;
  KEYS.mouseDown = true;
};
const onMouseUp = (e) => {
  delete KEYS.mouseDown;
  delete KEYS.mouseX;
  delete KEYS.mouseY;
};

window.addEventListener("keydown", ({ key }) => (KEYS[key] = true));
window.addEventListener("keyup", ({ key }) => delete KEYS[key]);
window.addEventListener("touchstart", onMouseDown);
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mouseup", onMouseUp);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("load", enterFrame);

window.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const tc = e.changedTouches[0];
    if (e.targetTouches.length === 1) {
      const dX = (KEYS.tmX || tc.screenX) - tc.screenX;
      const dY = (KEYS.tmY || tc.screenY) - tc.screenY;
      KEYS.tmX = tc.screenX;
      KEYS.tmY = tc.screenY;
      if (dX > 5) keyHandlers.ArrowRight();
      if (dX < -5) keyHandlers.ArrowLeft();
      if (dY > 5) keyHandlers.ArrowUp();
      if (dY < -5) keyHandlers.ArrowDown();
    } else {
      const ev = { clientX: 0, clientY: 0, cnt: 0 };
      for (var t = 0; t < e.targetTouches.length; t++) {
        ev.clientX += e.targetTouches[t].screenX;
        ev.clientY += e.targetTouches[t].screenY;
        ev.cnt++;
      }
      onMouseMove({
        clientX: ev.clientX / ev.cnt,
        clientY: ev.clientY / ev.cnt
      });
    }
  },
  { passive: false }
);

window.addEventListener("touchend", (e) => {
  e.preventDefault();
  onMouseUp(e);
  ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].map(
    (k) => delete KEYS[k]
  );
});

window.addEventListener("click", (e) => {
  if (KEYS.allowClick) keyHandlers[" "]();
});

setInterval((e) => {
  for (var k in KEYS) {
    var h = keyHandlers[k] || ((e) => null);
    h();
  }
}, 100);
