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

  const panelImages = ["panel1.png", "panel2.png", "panel3.png"];
  const stageImages = ["stage1.png", "stage2.png", "stage3.png"];

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

  let stageUnlocked = [true, false, false];

  function updateStageButtonStates() {
    const buttons = stageButtons.querySelectorAll('button[data-index]');
    buttons.forEach(btn => {
      const idx = parseInt(btn.dataset.index);
      btn.disabled = !stageUnlocked[idx];
    });
  }

  function clearCanvas(panel) {
    panel.ctx.clearRect(0, 0, panel.canvas.width, panel.canvas.height);
  }

  function forceDrawGuide(panel) {
    const ctx = panel.ctx;
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

    const start = pts[0];
    ctx.fillStyle = (panel.index === lastDrawnPanelIndex) ? '#3ad' : '#fff';
    ctx.beginPath();
    ctx.arc(start.x, start.y, 6, 0, 2 * Math.PI);
    ctx.fill();
  }

  function drawGuide(panel) {
    if (panel.panel.classList.contains('locked-panel')) return;
    forceDrawGuide(panel);
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
    updateStageButtonStates();
  }

  function hideStageButtons() {
    stageButtons.style.display = 'none';
  }

  function updateImage(src) {
    imageElement.src = src || "";
    if (!src) {
      imageElement.style.display = "none";
    } else {
      imageElement.style.display = "block";
    }
  }

  function updateAnswerArea(imageSrc) {
    updateImage(imageSrc);
    const filename = imageSrc.split("/").pop();
    if (correctAnswers[filename]) {
      answerArea.style.display = "flex";
      answerInput.value = "";
      answerResult.textContent = "";
    } else {
      answerArea.style.display = "none";
    }
  }

  function showStageImage(index) {
    updateAnswerArea(stageImages[index]);
  }

  answerButton.addEventListener("click", () => {
    const filename = imageElement.src.split("/").pop();
    const correct = correctAnswers[filename];
    const userAnswer = answerInput.value.trim().toLowerCase();

    if (!userAnswer) {
      answerResult.textContent = "解答を入力してください。";
      answerResult.style.color = "white";
    } else if (userAnswer === correct.toLowerCase()) {
      answerResult.textContent = "正解です！🎉";
      answerResult.style.color = "green";

      if (filename === "panel3.png") {
        // ✅ パネル3が正解されたら .container を表示
        document.querySelector(".container").style.display = "flex";
      }

      if (filename === "panel1.png") {
        panels[1].panel.classList.remove("locked-panel");
        stageUnlocked[0] = true;
        clearCanvas(panels[1]);
        forceDrawGuide(panels[1]);
      } else if (filename === "panel2.png") {
        panels[2].panel.classList.remove("locked-panel");
        stageUnlocked[1] = true;
        clearCanvas(panels[2]);
        forceDrawGuide(panels[2]);
      } else if (filename === "stage1.png") {
        stageUnlocked[1] = true;
      } else if (filename === "stage2.png") {
        stageUnlocked[2] = true;
      }

      updateStageButtonStates();
    } else {
      answerResult.textContent = "不正解です。";
      answerResult.style.color = "red";
    }
  });

  panels.forEach(panel => {
    panel.canvas.addEventListener('pointerdown', e => {
      if (panel.panel.classList.contains('locked-panel')) return;

      const rect = panel.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const startPoint = panel.guidePoints[0];
      const distanceSquared = dist2({ x: sx, y: sy }, startPoint);
      if (distanceSquared > 100) return;

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

        updateAnswerArea(panelImages[panel.index]);

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
        updateImage("");
        updateAnswerArea("");
        hideStageButtons();
      }
    });
  });

  stageButtons.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') {
      if (e.target.id === "backToPanel3") {
        updateAnswerArea("panel3.png");
        showStageButtons();
        window.dispatchEvent(new Event("panel3-drawn"));
        return;
      }
      const idx = parseInt(e.target.dataset.index);
      if (!isNaN(idx) && stageUnlocked[idx]) {
        showStageImage(idx);
      }
    }
  });

  window.addEventListener("panel3-drawn", () => {
    showStageButtons();
  });

  // 初期化処理
  stageUnlocked = [true, false, false];
  updateStageButtonStates();
  drawAllGuides();
  window.drawAllGuides = drawAllGuides;

  // 🔽 起動時に panel3 を表示
  updateAnswerArea("panel3.png");
  showStageButtons();
});
