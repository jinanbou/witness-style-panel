let panels = [];

export function setupPanels() {
  panels = Array.from(document.querySelectorAll('.panel')).map((panel, i) => {
    const canvas = panel.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    const marginX = 20;
    const guidePoints = [];

    return {
      panel,
      canvas,
      ctx,
      guidePoints,
      path: [],
      drawn: false,
      index: i
    };
  });

  // 最初は非表示なのでサイズ設定せず、描画もしない
}

// 表示後に呼び出すと、正しいサイズでガイドを描画できる
export function resizeAndRedrawPanels() {
  panels.forEach(panel => {
    const rect = panel.panel.getBoundingClientRect();
    panel.canvas.width = rect.width;
    panel.canvas.height = rect.height;

    const w = panel.canvas.width - 20 * 2;
    const h = panel.canvas.height;
    const amplitude = h / 16;
    const centerY = h / 2;
    const step = w / 50;

    // ガイド点再生成
    panel.guidePoints.length = 0;
    for (let x = 0; x <= w; x += step) {
      const theta = (x / w) * 2 * Math.PI;
      const y = centerY - amplitude * Math.sin(theta);
      panel.guidePoints.push({ x: x + 20, y });
    }

    drawGuide(panel);
  });
}

// ガイド線を描く（lockedでないとき）
function drawGuide(panel) {
  if (panel.panel.classList.contains('locked-panel')) return;

  const ctx = panel.ctx;
  ctx.clearRect(0, 0, panel.canvas.width, panel.canvas.height);
  const pts = panel.guidePoints;

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();

  // スタート点マーク
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(pts[0].x, pts[0].y, 6, 0, 2 * Math.PI);
  ctx.fill();
}
