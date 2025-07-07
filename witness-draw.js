// witness-draw.js

const panels = Array.from(document.querySelectorAll('.panel')).map((panel, i) => {
  const canvas = panel.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const rect = panel.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const marginX = 20;
  const w = canvas.width - marginX * 2;
  const h = canvas.height;
  const amplitude = h / 16;
  const centerY = h / 2;

  const guidePoints = [];
  const step = w / 50;
  for (let x = 0; x <= w; x += step) {
    const theta = (x / w) * 2 * Math.PI;
    const y = centerY - amplitude * Math.sin(theta);
    guidePoints.push({ x: x + marginX, y });
  }

  return { panel, canvas, ctx, guidePoints, path: [], drawn: false, index: i };
});

let activePanel = null;
let isDrawing = false;

const panelImages = [
  "panel1.png",
  "panel2.png",
  "panel3.png"
];

const stageImages = [
  "stage1.png",
  "stage2.png",
  "stage3.png"
];

const imageElement = document.getElementById("panelImage");
const stageButtons = document.getElementById("stageButtons");

function drawGuide(panel) {
  const ctx = panel.ctx;
  ctx.clearRect(0, 0, panel.canvas.width, panel.canvas.height);
  if (panel.panel.classList.contains('locked-panel')) return;

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const pts = panel.guidePoints;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();

  const start = panel.guidePoints[0];
  const last = panel.path[panel.path.length - 1];
  const reachedEnd = isAtEnd(last || {}, panel.guidePoints);
  ctx.fillStyle = (reachedEnd || (isDrawing && activePanel === panel)) ? '#3ad' : '#fff';
  ctx.beginPath();
  ctx.arc(start.x, start.y, 6, 0, 2 * Math.PI);
  ctx.fill();
}

function drawLine(panel) {
  const ctx = panel.ctx;
  ctx.clearRect(0, 0, panel.canvas.width, panel.canvas.height);
  drawGuide(panel);
  if (panel.path.length < 2) return;
  ctx.strokeStyle = '#3ad';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(panel.path[0].x, panel.path[0].y);
  for (let i = 1; i < panel.path.length; i++) {
    ctx.lineTo(panel.path[i].x, panel.path[i].y);
  }
  ctx.stroke();
}

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function snapToGuide(x, y, guidePoints) {
  let minDist = Infinity;
  let closest = guidePoints[0];
  for (const pt of guidePoints) {
    const d = dist2(pt, { x, y });
    if (d < minDist) {
      minDist = d;
      closest = pt;
    }
  }
  return closest;
}

function isAtEnd(point, guidePoints) {
  const end = guidePoints[guidePoints.length - 1];
  return point.x === end.x && point.y === end.y;
}

function drawAllGuides() {
  panels.forEach(drawGuide);
}

drawAllGuides();

function showStageButtons() {
  stageButtons.style.display = 'flex';
}

function hideStageButtons() {
  stageButtons.style.display = 'none';
}

function showStageImage(index) {
  imageElement.src = stageImages[index];
}

panels.forEach(panel => {
  panel.canvas.addEventListener('pointerdown', e => {
    if (panel.panel.classList.contains('locked-panel')) return;
    activePanel = panel;
    isDrawing = true;

    panels.forEach(p => {
      if (p !== panel) {
        drawGuide(p);
      }
    });

    const rect = panel.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const startPoint = panel.guidePoints[0];
    panel.path = [startPoint];
    drawLine(panel);
  });

  panel.canvas.addEventListener('pointermove', e => {
    if (!isDrawing || activePanel !== panel) return;
    const rect = panel.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const snap = snapToGuide(mx, my, panel.guidePoints);
    const last = panel.path[panel.path.length - 1];
    if (snap !== last) {
      panel.path.push(snap);
      drawLine(panel);
    }
  });

  panel.canvas.addEventListener('pointerup', () => {
    if (!isDrawing || activePanel !== panel) return;
    isDrawing = false;
    const last = panel.path[panel.path.length - 1];
    if (isAtEnd(last, panel.guidePoints)) {
      panel.drawn = true;
      drawLine(panel);
      imageElement.src = panelImages[panel.index];

      if (panel.index === 2) {
        console.log("panel3 drawn event fired");
        window.dispatchEvent(new Event("panel3-drawn"));
      } else {
        hideStageButtons();
      }
    } else {
      panel.path = [];
      panel.drawn = false;
      drawGuide(panel);
      imageElement.src = "";
      hideStageButtons();
    }
  });
});

// ステージボタンのクリックイベント
stageButtons.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const idx = parseInt(e.target.dataset.index);
    if (!isNaN(idx)) {
      showStageImage(idx);
    }
  }
});

// パネル3完了時のイベントリスナー
window.addEventListener("panel3-drawn", () => {
  console.log("panel3-drawn event caught");
  showStageButtons();
});
