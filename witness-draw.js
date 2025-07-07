document.addEventListener("DOMContentLoaded", () => {
  const panels = Array.from(document.querySelectorAll('.panel')).map((panel, i) => {
    // ...（既存の初期化処理はそのまま）
  });

  const imageElement = document.getElementById("panelImage");
  const answerArea = document.getElementById("answerArea");
  const answerInput = document.getElementById("answerInput");
  const answerResult = document.getElementById("answerResult");

  const correctAnswers = {
    "panel1.png": "visits",
    "panel2.png": "comment",
    "panel3.png": "helps",
    "stage1.png": "burglary",
    "stage2.png": "alley",
    "stage3.png": "fetching"
  };

  function updateImage(src) {
    imageElement.src = src || "";
    if (!src) {
      imageElement.style.display = "none"; // 画像がない場合は非表示
    } else {
      imageElement.style.display = "block"; // 画像がある場合は表示
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

  // 例：パネル描画完了時などに画像差し替え
  panels.forEach(panel => {
    // ...（イベントリスナー内の一部）
    // 画像切り替え例
    // updateAnswerArea(panelImages[panel.index]);
  });

  // 他の既存ロジックはそのまま

  // 最初は画像なしで非表示にしたい場合
  updateImage("");
});
  let activePanel = null;
  let isDrawing = false;
  let lastDrawnPanelIndex = -1;

  const panelImages = ["panel1.png", "panel2.png", "panel3.png"];
  const stageImages = ["stage1.png", "stage2.png", "stage3.png"];

  const imageElement = document.getElementById("panelImage");

function updateImage(src) {
  imageElement.src = src || "";
  if (!src) {
    imageElement.style.display = "none";  // 画像が無いなら非表示
  } else {
    imageElement.style.display = "block"; // 画像があれば表示
  }
}
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

  function drawGuide(panel) {
    if (panel.panel.classList.contains('locked-panel')) return;
    forceDrawGuide(panel);
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
    updateStageButtonStates();
  }

  function hideStageButtons() {
    stageButtons.style.display = 'none';
  }

  function showStageImage(index) {
    updateAnswerArea(imageElement.src);
  }

  function updateAnswerArea(imageSrc) {
    const filename = imageSrc.split("/").pop();
    if (correctAnswers[filename]) {
      answerArea.style.display = "flex";
      answerInput.value = "";
      answerResult.textContent = "";
    } else {
      answerArea.style.display = "none";
    }
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
      if (e.target.id === "backToPanel3") {
        imageElement.src = "panel3.png";
        updateAnswerArea(imageElement.src);
        window.dispatchEvent(new Event("panel3-drawn")); // ★ イベント再発火でステージボタン表示
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

  stageUnlocked = [true, false, false];
  updateStageButtonStates();

  window.drawAllGuides = drawAllGuides;
});
