export class StageController {
  constructor(options) {
    this.panelImages = options.panelImages; // ["images/panel1.png", ...]
    this.stageImages = options.stageImages; // ["images/stage1.png", ...]
    this.correctAnswers = options.correctAnswers; // { "panel3.png":"helps", ... }

    // panel3のみ最初からアンロックに変更（末尾true）
    this.stageUnlocked = [false, false, true];
    this.stageButtons = document.getElementById("stageButtons");
    this.answerArea = document.getElementById("answerArea");
    this.answerInput = document.getElementById("answerInput");
    this.answerButton = document.getElementById("answerButton");
    this.answerResult = document.getElementById("answerResult");
    this.backToPanel3Btn = document.getElementById("backToPanel3");
    this.imageElement = document.getElementById("panelImage");

    this.panelContainer = document.querySelector(".container"); // ← パネル群を参照

    if (!this.panelContainer) {
      console.warn("⚠️ .container 要素が見つかりません。");
    }

    this.init();
  }

  init() {
    this.hideDrawingPanels(); // ← 初期状態で非表示にする
    this.updateStageButtonStates();
    this.bindEvents();
    this.showPanel3State();
  }

  bindEvents() {
    this.answerButton.addEventListener("click", () => this.checkAnswer());
    this.answerInput.addEventListener("keydown", e => {
      if (e.key === "Enter") this.checkAnswer();
    });

    this.stageButtons.addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;

      if (btn.id === "backToPanel3") {
        this.showPanel3State();
      } else {
        const idx = parseInt(btn.dataset.index);
        if (isNaN(idx)) return;
        if (!this.stageUnlocked[idx]) return;
        this.showStage(idx);
      }
    });

    window.addEventListener("panel3-drawn", () => {
      this.unlockStagesAfterPanel3();
    });
  }

  updateStageButtonStates() {
    const buttons = this.stageButtons.querySelectorAll('button[data-index]');
    buttons.forEach(btn => {
      const idx = parseInt(btn.dataset.index);
      btn.disabled = !this.stageUnlocked[idx];
    });
  }

  checkAnswer() {
    const src = this.imageElement.src;
    const filename = src.split("/").pop();
    console.log("[StageController] 現在表示中の画像:", src, "→ファイル名:", filename);

    const correct = this.correctAnswers[filename];
    if (!correct) {
      console.warn("[StageController] 解答判定用の正解が見つかりません:", filename);
      return;
    }

    const input = this.answerInput.value.trim().toLowerCase();
    if (!input) {
      this.answerResult.textContent = "解答を入力してください。";
      this.answerResult.style.color = "white";
      return;
    }
    if (input === correct.toLowerCase()) {
      this.answerResult.textContent = "正解です！🎉";
      this.answerResult.style.color = "lime";
      this.handleCorrectAnswer(filename);
    } else {
      this.answerResult.textContent = "不正解です。";
      this.answerResult.style.color = "red";
    }
  }

  handleCorrectAnswer(filename) {
    let updated = false;

    if (filename === "panel3.png") {
      this.stageUnlocked[0] = true;
      this.stageUnlocked[1] = true;
      this.showDrawingPanels(); // ← ここで表示！
      updated = true;
      console.log("[StageController] panel3正解でパネル1・2をアンロック＆表示");
    }
    if (filename === "panel1.png" && !this.stageUnlocked[0]) {
      this.stageUnlocked[0] = true;
      updated = true;
      console.log("[StageController] panel1正解でアンロック");
    }
    if (filename === "panel2.png" && !this.stageUnlocked[1]) {
      this.stageUnlocked[1] = true;
      updated = true;
      console.log("[StageController] panel2正解でアンロック");
    }
    if (filename === "stage1.png" && !this.stageUnlocked[1]) {
      this.stageUnlocked[1] = true;
      updated = true;
      console.log("[StageController] stage1正解でアンロック");
    }
    if (filename === "stage2.png" && !this.stageUnlocked[2]) {
      this.stageUnlocked[2] = true;
      updated = true;
      console.log("[StageController] stage2正解でアンロック");
    }

    if (updated) {
      this.updateStageButtonStates();
    }
  }

  showPanel3State() {
    this.showImage(this.panelImages[2]);
    this.stageButtons.style.display = "flex";
    this.answerArea.style.display = "flex";
    if (this.panelContainer) {
      // panel3は最初から表示しておく
      this.panelContainer.style.display = "flex";
    }
  }

  showStage(idx) {
    this.showImage(this.stageImages[idx]);
  }

  showImage(src) {
    this.imageElement.src = src;
    this.answerArea.style.display = "flex";
    this.answerInput.value = "";
    this.answerResult.textContent = "";
  }

  unlockStagesAfterPanel3() {
    this.stageUnlocked[0] = true;
    this.stageUnlocked[1] = true;
    this.updateStageButtonStates();
  }

  hideDrawingPanels() {
    if (this.panelContainer) {
      this.panelContainer.style.display = "none";
      console.log("[StageController] パネル群を非表示にしました");
    }
  }

  showDrawingPanels() {
    if (this.panelContainer) {
      this.panelContainer.style.display = "flex";
      console.log("[StageController] パネル群を表示しました");
    }
  }
}
