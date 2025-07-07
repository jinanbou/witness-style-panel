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

  // 起動時は線を引くパネルを全部非表示に（解答欄・画像・ステージ選択は表示）
  panels.forEach((p, i) => {
    p.panel.style.display = "none"; // キャンバスパネル非表示に
  });
  // panel3の画像と解答欄は表示するのでここで表示
  // パネル3の描画キャンバスだけは非表示で操作不可です

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

  // ステージのアンロック状態
  // パネルの線は非表示なので線引きパネルは全ロック相当の非表示
  // パネル3画像は最初から見えるのでstageUnlockedはステージボタン管理用
  let stageUnlocked = [false, false, true];

  function updateStageButtonStates() {
    const buttons = stageButtons.querySelectorAll('button[data-index]');
    buttons.forEach(btn => {
      const idx = parseInt(btn.dataset.index);
      btn.disabled = !stageUnlocked[idx];
    });
  }

  // 以下線描画関連関数はパネル非表示なので不要だが一応残す

  function clearCanvas(panel) {
    panel.ctx.clearRect(0, 0, panel.canvas.width, panel.canvas.height);
  }

  function forceDrawGuide(panel) {
    if (panel.panel.style.display === "none") return;
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
    if (panel.panel.style.display === "none") return;
    forceDrawGuide(panel);
  }

  function drawLine(panel) {
    if (panel.panel.style.display === "none") return;
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
      if (panel.panel.style.display === "none") return;
      clearCanvas(panel);
      drawGuide(panel);
      if (panel.drawn && panel.path.length > 1) {
        drawLine(panel);
      }
    });
  }

  // パネルの線を引く部分は最初非表示なので、パネル3に正解したらパネル1,2を表示＆操作可能にする
  function unlockPanels1and2() {
    // 表示とロック解除
    [0,1].forEach(i => {
      panels[i].panel.style.display = "block";
      panels[i].panel.classList.remove("locked-panel");
    });
    // panel3はそのまま表示・アンロック（もともと表示なしで非操作）
    // これで線引き可能になる
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
      return;
    }
    if (userAnswer === correct.toLowerCase()) {
      answerResult.textContent = "正解です！🎉";
      answerResult.style.color = "green";

      if (filename === "panel3.png") {
        // パネル3正解でパネル1,2を表示＆操作可能にする
        unlockPanels1and2();
        stageUnlocked = [true, true, true];
        updateStageButtonStates();
      } else if (filename === "panel1.png") {
        stageUnlocked[0] = true;
        updateStageButtonStates();
      } else if (filename === "panel2.png") {
        stageUnlocked[1] = true;
        updateStageButtonStates();
      } else if (filename === "stage1.png") {
        stageUnlocked[1] = true;
        updateStageButtonStates();
      } else if (filename === "stage2.png") {
        stageUnlocked[2] = true;
        updateStageButtonStates();
      }
    } else {
      answerResult.textContent = "不正解です。";
      answerResult.style.color = "red";
    }
  });

  // パネル非表示なので以下の描画操作はほぼ不要。いずれかパネル表示時のみ動作。
  panels.forEach(panel => {
    panel.canvas.addEventListener('pointerdown', e => {
      if (panel.panel.style.display === "none") return;
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
      if (panel.panel.style.display === "none") return;
      if (panel.panel.classList.contains('locked-panel')) return;

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
      if (panel.panel.style.display === "none") return;
      if (panel.panel.classList.contains('locked-panel')) return;

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

  // 起動時はパネルの線引きパネル非表示
  stageUnlocked = [false, false, true];
  updateStageButtonStates();

  // 起動時にパネル3の画像を表示（解答欄も表示）
  updateAnswerArea("panel3.png");
  showStageButtons();

  drawAllGuides();

  window.drawAllGuides = drawAllGuides;
});
