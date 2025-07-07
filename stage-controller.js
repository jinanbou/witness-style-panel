document.addEventListener("DOMContentLoaded", () => {
  const stageButtons = document.getElementById("stageButtons");
  const imageElement = document.getElementById("panelImage");
  const backToPanel3Btn = document.getElementById("backToPanel3");

  const stageImages = [
    "stage1.png",
    "stage2.png",
    "stage3.png"
  ];

  function showStageButtons() {
    stageButtons.style.display = "flex";
  }

  function hideStageButtons() {
    stageButtons.style.display = "none";
  }

  function showStageImage(index) {
    imageElement.src = stageImages[index];
  }

  window.addEventListener("panel3-drawn", () => {
    console.log("panel3-drawn event caught");
    showStageButtons();
  });

  stageButtons.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      if (e.target === backToPanel3Btn) {
        imageElement.src = "panel3.png";
          drawAllGuides(); // 🔵 追加：青い丸を再表示するため（witness-draw.jsにexport必要）
        } else {
        const idx = parseInt(e.target.dataset.index);
        if (!isNaN(idx)) {
        showStageImage(idx);
        }
      }
    }
  });
});
