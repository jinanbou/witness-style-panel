<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Witness Panel System</title>
  <style>
    body {
      margin: 0;
      background: #222;
      color: white;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100vh;
      user-select: none;
    }
    h1 {
      margin-top: 20px;
    }
    #image-viewer {
      margin-top: 20px;
      width: 70vw;
      height: 40vh;
      background: #333;
      border: 3px solid #888;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #image-viewer img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    #stageButtons {
      display: none;
      gap: 10px;
      margin-top: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }
    #stageButtons button {
      padding: 10px 20px;
      font-size: 1rem;
      background-color: #444;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    #stageButtons button:hover {
      background-color: #666;
    }
    .container {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }
    .panel {
      position: relative;
      width: 25vw;
      aspect-ratio: 4 / 1;
      background-color: #ccc;
      border: 2px solid #888;
    }
    .locked-panel {
      background-color: black !important;
    }
    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      touch-action: none;
    }
    /* 解答エリアのスタイル強化 */
    #answerArea {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 0.6em;
      margin-top: 1em;
      font-size: 1.4em;
    }
    #answerInput {
      padding: 0.4em 0.4em;
      font-size: 1em;
      border-radius: 8px;
      border: 2px solid #ccc;
      width: 300px;
      max-width: 80vw;
    }
    #answerButton {
      padding: 0.4em 0.4em;
      font-size: 1em;
      border: none;
      border-radius: 8px;
      background-color: #3ad;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    #answerButton:hover {
      background-color: #27a;
    }
    #answerResult {
      font-size: 1em;
      font-weight: bold;
      padding: 0.25em 0.25em;
      border-radius: 8px;
      text-align: center;
    }
    #answerResult.correct {
      color: #fff;
      background-color: rgba(0, 128, 0, 0.6);
      border: 2px solid #0f0;
    }
    #answerResult.incorrect {
      color: #fff;
      background-color: rgba(255, 0, 0, 0.6);
      border: 2px solid #f00;
    }
    #answerResult.empty {
      color: #fff;
      background-color: rgba(255, 255, 255, 0.2);
      border: 2px solid #fff;
    }
  </style>
</head>
<body>

  <h1>Witness Panels</h1>

  <div id="image-viewer">
    <img id="panelImage" src="" alt="Panel image" />
  </div>

  <div id="stageButtons">
    <button data-index="0">ステージ1</button>
    <button data-index="1">ステージ2</button>
    <button data-index="2">ステージ3</button>
    <button id="backToPanel3" style="background-color: #666; margin-left: 20px;">ステージセレクトに戻る</button>
  </div>

  <div id="answerArea">
    <input type="text" id="answerInput" placeholder="解答を入力..." />
    <button id="answerButton">解答する</button>
    <p id="answerResult"></p>
  </div>

  <div class="container">
    <div class="panel"><canvas></canvas></div>
    <div class="panel locked-panel"><canvas></canvas></div>
    <div class="panel"><canvas></canvas></div>
  </div>

<script>
document.addEventListener("DOMContentLoaded", () => {
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
  let lastDrawnPanelIndex = -1;

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
  const answerArea = document.getElementById("answerArea");
  const answerInput = document.getElementById("answerInput");
  const answerButton = document.getElementById("answerButton");
  const answerResult = document.getElementById("answerResult");

  const correctAnswers = {
    "panel1.png": "visits",
    "panel2.png": "comment",
    "panel3.png": "helps",
    "stage1.png": "burglary",
    "stage2.png": "alley",
    "stage3.png": "fetching"
  };

  // パネル2のDOM要素を取得しておく（ロック解除に使う）
  const panel2Element = panels[1].panel;

  function clearCanvas(panel) {
    panel.ctx.clearRect(0, 0, panel.canvas.width, panel.canvas.height);
  }

  function drawGuide(panel) {
    const ctx = panel.ctx;
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
    ctx.fillStyle = (panel.index === lastDrawnPanelIndex) ? '#3ad' : '#fff';
    ctx.beginPath();
    ctx.arc(start.x, start.y, 6, 0, 2 * Math.PI);
    ctx.fill();
  }

  function drawLine(panel) {
    if (panel.path.length < 2) return;

    const ctx = panel.ctx;
    clearCanvas(panel);
    drawGuide(panel);

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

  function pointsEqual(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }

  function isAtEnd(point, guidePoints) {
    const end = guidePoints[guidePoints.length - 1];
    return point.x === end.x && point.y === end.y;
  }

  function drawAllGuides() {
    panels.forEach(panel => {
      clearCanvas(panel);
      drawGuide(panel);
      if (panel.drawn && panel.path.length > 1) {
        drawLine(panel);
      }
    });
  }

  function showStageButtons() {
    stageButtons.style.display = 'flex';
  }

  function hideStageButtons() {
    stageButtons.style.display = 'none';
  }

  function showStageImage(index) {
    imageElement.src = stageImages[index];
    updateAnswerArea(imageElement.src);
  }

  function updateAnswerArea(imageSrc) {
    const filename = imageSrc.split("/").pop();
    if (correctAnswers[filename]) {
      answerArea.style.display = "flex";
      answerInput.value = "";
      answerResult.textContent = "";
      answerResult.className = "";
    } else {
      answerArea.style.display = "none";
      answerInput.value = "";
      answerResult.textContent = "";
      answerResult.className = "";
    }
  }

  answerButton.addEventListener("click", () => {
    const filename = imageElement.src.split("/").pop();
    const correct = correctAnswers[filename];
    const userAnswer = answerInput.value.trim().toLowerCase();
    if (!userAnswer) {
      answerResult.textContent = "解答を入力してください。";
      answerResult.style.color = "white";
      answerResult.className = "empty";
    } else if (userAnswer === correct.toLowerCase()) {
      answerResult.textContent = "正解です！🎉";
      answerResult.style.color = "white";
      answerResult.className = "correct";

      // panel1正解時にpanel2を解放
      if (filename === "panel1.png") {
        panel2Element.classList.remove("locked-panel");
      }

    } else {
      answerResult.textContent = "不正解です。";
      answerResult.style.color = "white";
      answerResult.className = "incorrect";
    }
  });

  drawAllGuides();

  panels.forEach(panel => {
    panel.canvas.addEventListener('pointerdown', e => {
      if (panel.panel.classList.contains('locked-panel')) return;

      const rect = panel.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const startPoint = panel.guidePoints[0];

      const distanceSquared = dist2({ x: sx, y: sy }, startPoint);
      const threshold = 100;

      if (distanceSquared > threshold) return;

      panels.forEach(p => {
        if (p !== panel) {
          p.drawn = false;
          p.path = [];
          clearCanvas(p);
          drawGuide(p);
        }
      });

      activePanel = panel;
      isDrawing = true;
      lastDrawnPanelIndex = panel.index;
      drawAllGuides();

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
      if (!pointsEqual(snap, last)) {
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
        lastDrawnPanelIndex = panel.index;

        drawLine(panel);

        panels.forEach(p => {
          if (p !== panel) {
            clearCanvas(p);
            drawGuide(p);
          }
        });

        imageElement.src = panelImages[panel.index];
        updateAnswerArea(imageElement.src);

        if (panel.index === 2) {
          window.dispatchEvent(new Event("panel3-drawn"));
        } else {
          hideStageButtons();
        }
      } else {
        panel.path = [];
        panel.drawn = false;
        lastDrawnPanelIndex = -1;
        drawAllGuides();
        imageElement.src = "";
        updateAnswerArea("");
        hideStageButtons();
      }
    });
  });

  stageButtons.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') {
      const idx = parseInt(e.target.dataset.index);
      if (!isNaN(idx)) {
        showStageImage(idx);
      }
    }
  });

  window.addEventListener("panel3-drawn", () => {
    showStageButtons();
  });

  window.drawAllGuides = drawAllGuides;
});
</script>

</body>
</html>
