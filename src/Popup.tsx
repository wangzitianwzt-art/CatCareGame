import { useState, useEffect } from "react";
import { useGameState } from "./hooks/useGameState";
import { CatDisplay } from "./components/CatDisplay";
import "./styles/popup.css";

export function Popup() {
  const { state, addFood, play, bath, canBath, getMoodEmoji, resetGame, setCatImage, setCatName } = useGameState();
  const [toast, setToast] = useState<string | null>(null);

  // 自动隐藏提示信息
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string) => {
    setToast(message);
  };

  const handleAddFood = () => {
    if (state.isSleeping) {
      showToast("😴 猫咪在睡觉，让它好好休息吧");
      return;
    }
    addFood();
    showToast("🍖 猫粮已加满！");
  };

  const handleBath = () => {
    if (state.isSleeping) {
      showToast("😴 猫咪在睡觉，让它好好休息吧");
      return;
    }

    if (!canBath()) {
      showToast("🛁 需要等待10分钟才能再次洗澡");
      return;
    }

    bath();
    showToast("✨ 洗澡完成！猫咪干干净净啦");
  };

  const handlePlay = () => {
    if (state.isSleeping) {
      showToast("😴 猫咪在睡觉，让它好好休息吧");
      return;
    }
    play();
    
    if (state.tiredness + 5 >= 80) {
      showToast("😴 猫咪太累了，需要休息一下");
    } else {
      showToast("🎾 猫咪玩得很开心！");
    }
  };

  const handleReset = () => {
    // 保留图片和名字
    resetGame();
    showToast("🔄 游戏数据已重置");
  };

  return (
    <div className="popup-container">
      {/* 顶部提示信息 */}
      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}

      {/* 标题 */}
      <div className="header">
        <h1>猫咪养成</h1>
      </div>

      {/* 猫咪展示 - 支持上传图片，状态悬浮显示 */}
      <CatDisplay
        catImageUrl={state.catImageUrl}
        catName={state.catName}
        moodEmoji={getMoodEmoji()}
        isSleeping={state.isSleeping}
        hunger={state.hunger}
        tiredness={state.tiredness}
        cleanliness={state.cleanliness}
        catFood={state.catFood}
        onImageUpload={setCatImage}
        onNameChange={setCatName}
      />

      {/* 操作按钮 - 使用小图标 */}
      <div className="actions">
        <button
          className="action-btn"
          onClick={handleAddFood}
          title="补充猫粮（加满）"
          disabled={state.isSleeping}
        >
          🍖
        </button>
        <button
          className="action-btn"
          onClick={handleBath}
          title="给猫洗澡"
          disabled={state.isSleeping}
        >
          🛁
        </button>
        <button
          className="action-btn"
          onClick={handlePlay}
          title="逗猫咪"
          disabled={state.isSleeping}
        >
          🎾
        </button>
        <button
          className="action-btn"
          onClick={handleReset}
          title="重置游戏"
        >
          🔄
        </button>
      </div>
    </div>
  );
}
