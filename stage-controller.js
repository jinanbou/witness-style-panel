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

    this.init();
  }

  init() {
    this.hideAllPanels(); // 初期化時にすべてのパネルを非表示に
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
    // ✅ panel3 正解で .panel 要素を表示
    if (filename === "panel3.png") {
      this.stageUnlocked[0] = true;
      this.stageUnlocked[1] = true;
      this.updateStageButtonStates();

      // 🔽 .panel クラスを表示する
      document.querySelectorAll(".panel").forEach(panel => {
        panel.classList.remove("hidden-panel");
      });

      // 🔽 ガイド再描画（もし関数が定義されていれば）
      if (window.drawAllGuides) {
        window.drawAllGuides();
      }
    }

    // ▼ 他の解答によるステージ解放（必要に応じて調整）
    if (filename === "panel1.png") {
      this.stageUnlocked[0] = true;
      this.updateStageButtonStates();
    }
    if (filename === "panel2.png") {
      this.stageUnlocked[1] = true;
      this.updateStageButtonStates();
    }
    if (filename === "stage1.png") {
      this.stageUnlocked[1] = true;
      this.updateStageButtonStates();
    }
    if (filename === "stage2.png") {
      this.stageUnlocked[2] = true;
      this.updateStageButtonStates();
    }
  }

  showPanel3State() {
    this.imageElement.src = this.panelImages[2];
    this.answerArea.style.display = "flex";
    this.answerInput.value = "";
    this.answerResult.textContent = "";
    this.stageButtons.style.display = "flex";
  }

  showStage(idx) {
    this.imageElement.src = this.stageImages[idx];
    this.answerArea.style.display = "flex";
    this.answerInput.value = "";
    this.answerResult.textContent = "";
  }

  unlockStagesAfterPanel3() {
    this.stageUnlocked[0] = true;
    this.stageUnlocked[1] = true;
    this.updateStageButtonStates();
  }

  hideAllPanels() {
    document.querySelectorAll(".panel").forEach(panel => {
      panel.classList.add("hidden-panel");
    });
  }
}
