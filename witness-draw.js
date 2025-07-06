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

  // ガイド点作成
  const guidePoints = [];
  const step = w / 50;
  for(let x=0; x<=w; x+=step){
    const theta = (x / w) * 2 * Math.PI;
    const y = centerY - amplitude * Math.sin(theta);
    guidePoints.push({x: x + marginX, y});
  }

  return { panel, canvas, ctx, guidePoints, path: [], drawn: false, index: i };
});

const screenImage = document.getElementById('screenImage');

function drawGuide(panel) {
  const ctx = panel.ctx;
  ctx.clearRect(0, 0, panel.canvas.width, panel.canvas.height);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const pts = panel.guidePoints;
  ctx.moveTo(pts[0].x, pts[0].y);
  for(let i=1; i<pts.length; i++){
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();

  // 左端に丸を描く（スタート地点）
  const start = panel.guidePoints[0];
  ctx.fillStyle = (activePanel === panel && isDrawing) ? '#3ad' : '#fff';
  ctx.beginPath();
  ctx.arc(start.x, start.y, 6, 0, 2 * Math.PI);
  ctx.fill();
}

function dist2(a,b){
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx*dx + dy*dy;
}

function snapToGuide(x, y, guidePoints){
  let minDist = Infinity;
  let closest = guidePoints[0];
  for(const pt of guidePoints){
    const d = dist2(pt, {x,y});
    if(d < minDist){
      minDist = d;
      closest = pt;
    }
  }
  return closest;
}

function drawLine(panel){
  const ctx = panel.ctx;
  ctx.clearRect(0, 0, panel.canvas.width, panel.canvas.height);
  drawGuide(panel);
  if(panel.path.length < 2) return;
  ctx.strokeStyle = '#3ad';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';   // 端を丸く
  ctx.lineJoin = 'round';  // 角も丸く
  ctx.beginPath();
  ctx.moveTo(panel.path[0].x, panel.path[0].y);
  for(let i=1; i<panel.path.length; i++){
    ctx.lineTo(panel.path[i].x, panel.path[i].y);
  }
  ctx.stroke();
}

function drawAllGuides(){
  panels.forEach(drawGuide);
}

let activePanel = null;
let isDrawing = false;

function isAtEnd(point, guidePoints){
  const end = guidePoints[guidePoints.length - 1];
  // 完全一致判定
  return (point.x === end.x && point.y === end.y);
}

panels.forEach(panel => {
  drawGuide(panel);

  panel.canvas.addEventListener('pointerdown', e => {
    activePanel = panel;
    isDrawing = true;

    // 他パネルの線は消す
    panels.forEach(p => {
      if(p !== panel){
        p.path = [];
        p.drawn = false;
        drawGuide(p);
      }
    });

    screenImage.src = '';

    const rect = panel.canvas.getBoundingClientRect();
    // スタートは必ず左端の丸（guidePointsの0番目）からスタート
    const startPoint = panel.guidePoints[0];
    panel.path = [startPoint];

    drawLine(panel);
  });

  panel.canvas.addEventListener('pointermove', e => {
    if(!isDrawing || activePanel !== panel) return;

    const rect = panel.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const snap = snapToGuide(mx, my, panel.guidePoints);
    const last = panel.path[panel.path.length - 1];
    if(snap !== last){
      panel.path.push(snap);
      drawLine(panel);
    }
  });

  panel.canvas.addEventListener('pointerup', e => {
    if(!isDrawing || activePanel !== panel) return;
    isDrawing = false;

    const last = panel.path[panel.path.length - 1];
    if(isAtEnd(last, panel.guidePoints)){
      panel.drawn = true;
      drawLine(panel); // 線を確定
      if(panel.index === 0) screenImage.src = 'panel1.png';
      else if(panel.index === 1) screenImage.src = 'panel2.png';
      else if(panel.index === 2) screenImage.src = 'panel3.png';
    } else {
      panel.path = [];
      panel.drawn = false;
      drawGuide(panel);
      screenImage.src = '';
    }
  });
});
