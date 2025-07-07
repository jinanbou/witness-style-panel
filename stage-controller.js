const stageButtons = document.getElementById("stageButtons");
const imageElement = document.getElementById("panelImage");

const stageImages = [
  "stage1.png",
  "stage2.png",
  "stage3.png"
];

// ステージ選択ボタンの表示
function showStageButtons() {
  stageButtons.style.display = "flex";
}

// ステージ選択ボタンの非表示
function hideStageButtons() {
  stageButtons.style.display = "none";
}

// ステージ画像の表示
function showStageImage(index) {
  imageElement.src = stageImages[index];
}

// パネル3完了通知を受け取り、ボタンを表示
window.addEventListener("panel3-drawn", () => {
  console.log("panel3-drawn event caught");
  showStageButtons();
});

// ステージ選択ボタンのクリック処理
stageButtons.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const idx = parseInt(e.target.dataset.index);
    if (!isNaN(idx)) {
      showStageImage(idx);
    }
  }
});
