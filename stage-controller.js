// stage-controller.js
export class StageController {
  constructor(options) {
    this.panelImages = options.panelImages; // ["images/panel1.png", ...]
    this.stageImages = options.stageImages; // ["images/stage1.png", ...]
    this.correctAnswers = options.correctAnswers; // { "panel3.png":"helps", ... }

    this.stageUnlocked = [false, false, true]; // panel3のみ最初からアンロック
    this.stageButtons = document.getElementById("stageButtons");
    this.answerArea = document.getElementById("answerArea");
    this.answerInput = document.getElementById("answerInput");
    this.answerButton = document.getElementById("answerButton");
    this.answerResult = document.getElementById("answerResult");
    this.backToPanel3Btn = document.getElementById("backToPanel3");
    this.imageElement = document.getElementById("panelImage");

    this.panelContainer = document.querySelector(".container"); // ← パネル群を参照

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

  checkAnswer = () => {
    const src = this.imageElement.src;
    const filename = src.split("/").pop();
    const correct = this.correctAnswers[filename];
    console.log(`[checkAnswer] filename=${filename} correct=${correct}`);

    if (!correct) {
      console.warn("[checkAnswer] この画像に正解が設定されていません");
      return;
    }

    const input = this.answerInput.value.trim().toLowerCase();
    console.log(`[checkAnswer] 入力='${input}'`);

    if (!input) {
      this.answerResult.textContent = "解答を入力してください。";
      this.answerResult.style.color = "white";
      return;
    }
    if (input === correct.toLowerCase()) {
      console.log("[checkAnswer] 正解！");
      this.answerResult.textContent = "正解です！🎉";
      this.answerResult.style.color = "lime";
      this.handleCorrectAnswer(filename);
    } else {
      console.log("[checkAnswer] 不正解");
      this.answerResult.textContent = "不正解です。";
      this.answerResult.style.color = "red";
    }
  }

  handleCorrectAnswer = (filename) => {
    console.log(`[handleCorrectAnswer] filename=${filename}`);

    let updated = false;

    if (filename === "panel3.png") {
      this.stageUnlocked[0] = true;
      this.stageUnlocked[1] = true;
      this.showDrawingPanels();  // 表示切り替え
      console.log("[handleCorrectAnswer] panel3正解でパネル表示");
      updated = true;
    }
    if (filename === "panel1.png" && !this.stageUnlocked[0]) {
      this.stageUnlocked[0] = true;
      updated = true;
    }
    if (filename === "panel2.png" && !this.stageUnlocked[1]) {
      this.stageUnlocked[1] = true;
      updated = true;
    }
    if (filename === "stage1.png" && !this.stageUnlocked[1]) {
      this.stageUnlocked[1] = true;
      updated = true;
    }
    if (filename === "stage2.png" && !this.stageUnlocked[2]) {
      this.stageUnlocked[2] = true;
      updated = true;
    }

    if (updated) {
      this.updateStageButtonStates();
    }
  }

  showPanel3State() {
    this.showImage(this.panelImages[2]);
    this.stageButtons.style.display = "flex";
    this.answerArea.style.display = "flex";
    this.answerInput.value = "";
    this.answerResult.textContent = "";
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
    }
  }

  showDrawingPanels() {
    if (this.panelContainer) {
      this.panelContainer.style.display = "flex";
    }
  }
}
