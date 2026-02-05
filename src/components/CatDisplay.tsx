import { useState, useRef, useEffect } from "react";
import { StatsDisplay } from "./StatsDisplay";
import "../styles/cat-display.css";

interface CatDisplayProps {
  catImageUrl: string | null;
  catName: string;
  moodEmoji: string;
  isSleeping: boolean;
  hunger: number;
  tiredness: number;
  cleanliness: number;
  catFood: number;
  onImageUpload: (imageUrl: string | null) => void;
  onNameChange: (name: string) => void;
}

export function CatDisplay({
  catImageUrl,
  catName,
  moodEmoji,
  isSleeping,
  hunger,
  tiredness,
  cleanliness,
  catFood,
  onImageUpload,
  onNameChange,
}: CatDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(catName);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 同步外部名字变化
  useEffect(() => {
    setNameInput(catName);
  }, [catName]);

  // 自动聚焦输入框
  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageUpload(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameBlur = () => {
    // 失去焦点时自动保存
    const trimmedName = nameInput.trim();
    if (trimmedName) {
      onNameChange(trimmedName);
    } else {
      setNameInput(catName); // 如果为空，恢复原名字
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setNameInput(catName);
      setIsEditing(false);
    }
  };

  return (
    <div className="cat-display">
      {/* 猫咪图片区域 */}
      <div className="cat-image-container">
        {catImageUrl ? (
          <>
            <img src={catImageUrl} alt="用户的猫咪" className="cat-image" />
            <div className="mood-badge">{moodEmoji}</div>
            <button
              className="upload-btn-overlay"
              onClick={() => fileInputRef.current?.click()}
              title="更换照片"
            >
              📷
            </button>
          </>
        ) : (
          <div className="cat-placeholder">
            <div className="emoji-display">{moodEmoji}</div>
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              title="上传猫咪照片"
            >
              📷 上传照片
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>

      {/* 状态指示器 - 横向排列在图片下方 */}
      <StatsDisplay
        hunger={hunger}
        tiredness={tiredness}
        cleanliness={cleanliness}
        catFood={catFood}
      />

      {/* 猫咪名字和状态 - 同一行 */}
      <div className="cat-info-row">
        <div className="cat-name-status-row">
          {isEditing ? (
            <input
              ref={nameInputRef}
              type="text"
              className="name-input-inline"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleKeyDown}
              placeholder="输入猫咪名字"
              maxLength={20}
            />
          ) : (
            <div className="cat-name-display" onClick={() => setIsEditing(true)}>
              <span className="cat-name">{catName}</span>
              <span className="edit-hint">✏️</span>
            </div>
          )}
          {isSleeping && (
            <span className="cat-status">· 猫咪在睡觉 Zzz</span>
          )}
        </div>
      </div>
    </div>
  );
}
