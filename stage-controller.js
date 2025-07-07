export class StageController {
  constructor(options) {
    this.panelImages = options.panelImages;
    this.stageImages = options.stageImages;
    this.correctAnswers = options.correctAnswers;

    this.stageUnlocked = [false, false, true]; // panel3だけ最初に開放
    this.stageButtons = document.getElementById("stageButtons");
    this.answerArea = document.getElementById("answerArea");
    this.answerInput = document.getElementById("answerInput");
    this.answerButton = document.getElementById("answerButton");
    this.answerResult = document.getElementById("answerResult");
    this.backToPanel3Btn = document.getElementById("backToPanel3");
    this.imageElement = document.getElementById("panelImage");
    this.panelContainer = document.querySelector(".container");

    this.init();
  }

  init() {
    this.updateStageButtonStates();
    this.bindEvents();
    this.showPanel3State(); // 起動時にpanel3へ
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
    const correct = this.correctAnswers[filename];
    if (!correct) return;

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
    if (filename === "panel3.png") {
      this.stageUnlocked[0] = true;
      this.stageUnlocked[1] = true;
      this.updateStageButtonStates();
      this.panelContainer.style.display = "flex"; // パネル表示
    }
    if (filename === "panel1.png") {
      this.stageUnlocked[0] = true;
    }
    if (filename === "panel2.png") {
      this.stageUnlocked[1] = true;
    }
    if (filename === "stage1.png") {
      this.stageUnlocked[1] = true;
    }
    if (filename === "stage2.png") {
      this.stageUnlocked[2] = true;
    }

    this.updateStageButtonStates();
  }

  showPanel3State() {
    this.imageElement.src = this.panelImages[2];
    this.imageElement.style.display = "block"; // ← ここを追加
    this.answerArea.style.display = "flex";
    this.answerInput.value = "";
    this.answerResult.textContent = "";
    this.stageButtons.style.display = "flex";
  }

  showStage(idx) {
    this.imageElement.src = this.stageImages[idx];
    this.imageElement.style.display = "block"; // ← ここも追加
    this.answerArea.style.display = "flex";
    this.answerInput.value = "";
    this.answerResult.textContent = "";
  }

  unlockStagesAfterPanel3() {
    this.stageUnlocked[0] = true;
    this.stageUnlocked[1] = true;
    this.updateStageButtonStates();
  }
}
