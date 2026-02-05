// Content Script - 悬浮球功能

interface GameState {
  hunger: number;
  tiredness: number;
  cleanliness: number;
  catFood: number;
  isSleeping: boolean;
  catImageUrl: string | null;
  catName: string;
  lastBathTime: number;
  totalPlayTime: number;
  sleepStartTime: number | null;
}

const GAME_CONFIG = {
  TICK_INTERVAL: 1000, // 每秒更新一次
  FOOD_CONSUME_INTERVAL: 5, // 每5秒消耗1猫粮
  BATH_COOLDOWN: 10 * 60 * 1000,
  BATH_EMERGENCY_THRESHOLD: 25,
  SLEEP_TIREDNESS_DECREASE: 2, // 睡眠时每秒减少2疲惫值
};

let gameInterval: number | null = null;

// 获取默认状态
function getDefaultState(): GameState {
  return {
    hunger: 0,
    tiredness: 0,
    cleanliness: 100,
    catFood: 0,
    isSleeping: false,
    catImageUrl: null,
    catName: '你的猫咪',
    lastBathTime: Date.now(),
    totalPlayTime: 0,
    sleepStartTime: null,
  };
}

// 启动游戏逻辑定时器
function startGameLoop() {
  if (gameInterval) return;
  
  gameInterval = window.setInterval(() => {
    chrome.storage.local.get('gameState', (result: any) => {
      const state: GameState = result.gameState || getDefaultState();
      let newState = { ...state };
      const tickCount = state.totalPlayTime + 1;

      // 处理睡眠状态
      if (state.isSleeping) {
        // 睡眠时疲惫值持续减少
        newState.tiredness = Math.max(0, state.tiredness - GAME_CONFIG.SLEEP_TIREDNESS_DECREASE);
        
        // 疲惫值为0时，猫咪醒来
        if (newState.tiredness <= 0) {
          newState.isSleeping = false;
          newState.sleepStartTime = null;
          newState.tiredness = 0;
        }
      } else {
        // 非睡眠状态下的逻辑
        if (tickCount % GAME_CONFIG.FOOD_CONSUME_INTERVAL === 0) {
          if (state.catFood > 0) {
            // 猫粮不为0时：消耗1猫粮，同时饥饿值减少1（直到饥饿值为0）
            newState.catFood = Math.max(0, state.catFood - 1);
            newState.hunger = Math.max(0, state.hunger - 1);
          } else {
            // 猫粮为0时：饥饿值增加1
            newState.hunger = Math.min(100, state.hunger + 1);
          }
        }
      }

      newState.totalPlayTime = tickCount;

      // 保存状态
      chrome.storage.local.set({ gameState: newState });
    });
  }, GAME_CONFIG.TICK_INTERVAL);
}

// 创建悬浮球
function createFloatingBall() {
  // 检查是否已存在
  if (document.getElementById('cat-care-floating-ball')) {
    return;
  }

  const ball = document.createElement('div');
  ball.id = 'cat-care-floating-ball';
  ball.innerHTML = '🐱';
  ball.title = '猫咪养成';
  
  // 从存储中获取位置
  chrome.storage.local.get('floatingBallPosition', (result: any) => {
    if (result.floatingBallPosition) {
      ball.style.right = result.floatingBallPosition.right + 'px';
      ball.style.bottom = result.floatingBallPosition.bottom + 'px';
    }
  });

  document.body.appendChild(ball);

  // 拖动功能
  let isDragging = false;
  let hasMoved = false;
  let startX: number, startY: number;
  let startRight: number, startBottom: number;

  ball.addEventListener('mousedown', (e: MouseEvent) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    const rect = ball.getBoundingClientRect();
    startRight = window.innerWidth - rect.right;
    startBottom = window.innerHeight - rect.bottom;
    ball.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = startX - e.clientX;
    const deltaY = startY - e.clientY;
    
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true;
    }
    
    let newRight = startRight + deltaX;
    let newBottom = startBottom + deltaY;
    
    // 边界限制
    newRight = Math.max(10, Math.min(window.innerWidth - 60, newRight));
    newBottom = Math.max(10, Math.min(window.innerHeight - 60, newBottom));
    
    ball.style.right = newRight + 'px';
    ball.style.bottom = newBottom + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      ball.style.cursor = 'grab';
      
      // 保存位置
      const rect = ball.getBoundingClientRect();
      chrome.storage.local.set({
        floatingBallPosition: {
          right: window.innerWidth - rect.right,
          bottom: window.innerHeight - rect.bottom
        }
      });
    }
  });

  // 点击打开面板（只有没有拖动时才触发）
  ball.addEventListener('click', () => {
    if (!hasMoved) {
      togglePanel();
    }
  });
}

// 创建游戏面板
function createPanel() {
  if (document.getElementById('cat-care-panel')) {
    return document.getElementById('cat-care-panel');
  }

  const panel = document.createElement('div');
  panel.id = 'cat-care-panel';
  panel.innerHTML = `
    <div class="cat-care-panel-header">
      <span>猫咪养成</span>
      <button class="cat-care-close-btn">✕</button>
    </div>
    <div class="cat-care-panel-content">
      <div class="cat-care-toast" id="cat-care-toast"></div>
      <div class="cat-care-cat-display">
        <div class="cat-care-image-container" id="cat-care-image-container">
          <div class="cat-care-placeholder" id="cat-care-placeholder">
            <div class="cat-care-emoji" id="cat-care-emoji">😸</div>
            <button class="cat-care-upload-btn" id="cat-care-upload-btn">📷 上传照片</button>
          </div>
          <img id="cat-care-cat-image" class="cat-care-cat-image" style="display:none;" />
          <div class="cat-care-mood-badge" id="cat-care-mood-badge">😸</div>
          <button class="cat-care-upload-overlay" id="cat-care-upload-overlay" style="display:none;">📷</button>
        </div>
        <input type="file" id="cat-care-file-input" accept="image/*" style="display:none;" />
      </div>
      <div class="cat-care-stats">
        <div class="cat-care-stat-item">
          <div class="cat-care-stat-label">饥饿</div>
          <div class="cat-care-stat-bubble">
            <span class="cat-care-stat-icon" id="cat-care-hunger-icon">😊</span>
            <span class="cat-care-stat-value" id="cat-care-hunger-value">0</span>
          </div>
        </div>
        <div class="cat-care-stat-item">
          <div class="cat-care-stat-label">疲惫</div>
          <div class="cat-care-stat-bubble">
            <span class="cat-care-stat-icon" id="cat-care-tiredness-icon">😄</span>
            <span class="cat-care-stat-value" id="cat-care-tiredness-value">0</span>
          </div>
        </div>
        <div class="cat-care-stat-item">
          <div class="cat-care-stat-label">清洁</div>
          <div class="cat-care-stat-bubble">
            <span class="cat-care-stat-icon" id="cat-care-cleanliness-icon">✨</span>
            <span class="cat-care-stat-value" id="cat-care-cleanliness-value">100</span>
          </div>
        </div>
        <div class="cat-care-stat-item">
          <div class="cat-care-stat-label">猫粮</div>
          <div class="cat-care-stat-bubble">
            <span class="cat-care-stat-icon">🍖</span>
            <span class="cat-care-stat-value" id="cat-care-food-value">0</span>
          </div>
        </div>
      </div>
      <div class="cat-care-name-row">
        <span class="cat-care-cat-name" id="cat-care-cat-name">你的猫咪</span>
        <span class="cat-care-edit-hint">✏️</span>
        <span class="cat-care-status" id="cat-care-status"></span>
      </div>
      <input type="text" id="cat-care-name-input" class="cat-care-name-input" style="display:none;" maxlength="20" />
      <div class="cat-care-actions">
        <button class="cat-care-action-btn" id="cat-care-feed-btn" title="补充猫粮">🍖</button>
        <button class="cat-care-action-btn" id="cat-care-bath-btn" title="给猫洗澡">🛁</button>
        <button class="cat-care-action-btn" id="cat-care-play-btn" title="逗猫咪">🎾</button>
        <button class="cat-care-action-btn" id="cat-care-reset-btn" title="重置游戏">🔄</button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // 绑定事件
  bindPanelEvents(panel);

  return panel;
}

// 绑定面板事件
function bindPanelEvents(panel: HTMLElement) {
  const closeBtn = panel.querySelector('.cat-care-close-btn');
  const feedBtn = panel.querySelector('#cat-care-feed-btn');
  const bathBtn = panel.querySelector('#cat-care-bath-btn');
  const playBtn = panel.querySelector('#cat-care-play-btn');
  const resetBtn = panel.querySelector('#cat-care-reset-btn');
  const fileInput = panel.querySelector('#cat-care-file-input') as HTMLInputElement;
  const uploadBtn = panel.querySelector('#cat-care-upload-btn');
  const uploadOverlay = panel.querySelector('#cat-care-upload-overlay');
  const catNameEl = panel.querySelector('#cat-care-cat-name');
  const nameInput = panel.querySelector('#cat-care-name-input') as HTMLInputElement;

  closeBtn?.addEventListener('click', () => togglePanel());
  
  feedBtn?.addEventListener('click', () => {
    chrome.storage.local.get('gameState', (result: any) => {
      const state = result.gameState || getDefaultState();
      if (state.isSleeping) {
        showToast('😴 猫咪在睡觉，让它好好休息吧');
        return;
      }
      state.catFood = 100;
      state.lastFeedTime = Date.now();
      chrome.storage.local.set({ gameState: state }, () => {
        updatePanelUI(state);
        showToast('🍖 猫粮已加满！');
      });
    });
  });

  bathBtn?.addEventListener('click', () => {
    chrome.storage.local.get('gameState', (result: any) => {
      const state = result.gameState || getDefaultState();
      if (state.isSleeping) {
        showToast('😴 猫咪在睡觉，让它好好休息吧');
        return;
      }
      const now = Date.now();
      const canBath = state.cleanliness < GAME_CONFIG.BATH_EMERGENCY_THRESHOLD || 
                      (now - state.lastBathTime) >= GAME_CONFIG.BATH_COOLDOWN;
      if (!canBath) {
        showToast('🛁 需要等待10分钟才能再次洗澡');
        return;
      }
      state.cleanliness = 100;
      state.lastBathTime = now;
      chrome.storage.local.set({ gameState: state }, () => {
        updatePanelUI(state);
        showToast('✨ 洗澡完成！猫咪干干净净啦');
      });
    });
  });

  playBtn?.addEventListener('click', () => {
    chrome.storage.local.get('gameState', (result: any) => {
      const state = result.gameState || getDefaultState();
      if (state.isSleeping) {
        showToast('😴 猫咪在睡觉，让它好好休息吧');
        return;
      }
      state.hunger = Math.min(100, state.hunger + 5);
      state.cleanliness = Math.max(0, state.cleanliness - 5);
      state.tiredness = Math.min(100, state.tiredness + 5);
      
      if (state.tiredness >= 80) {
        state.isSleeping = true;
        state.sleepStartTime = Date.now();
        showToast('😴 猫咪太累了，需要休息一下');
      } else {
        showToast('🎾 猫咪玩得很开心！');
      }
      
      chrome.storage.local.set({ gameState: state }, () => {
        updatePanelUI(state);
      });
    });
  });

  resetBtn?.addEventListener('click', () => {
    chrome.storage.local.get('gameState', (result: any) => {
      const oldState = result.gameState || getDefaultState();
      const newState = {
        ...getDefaultState(),
        catImageUrl: oldState.catImageUrl,
        catName: oldState.catName,
      };
      chrome.storage.local.set({ gameState: newState }, () => {
        updatePanelUI(newState);
        showToast('🔄 游戏数据已重置');
      });
    });
  });

  uploadBtn?.addEventListener('click', () => fileInput?.click());
  uploadOverlay?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imageUrl = ev.target?.result as string;
        chrome.storage.local.get('gameState', (result: any) => {
          const state = result.gameState || getDefaultState();
          state.catImageUrl = imageUrl;
          chrome.storage.local.set({ gameState: state }, () => {
            updatePanelUI(state);
          });
        });
      };
      reader.readAsDataURL(file);
    }
  });

  // 名字编辑
  catNameEl?.addEventListener('click', () => {
    const nameEl = document.getElementById('cat-care-cat-name');
    const inputEl = document.getElementById('cat-care-name-input') as HTMLInputElement;
    if (nameEl && inputEl) {
      nameEl.style.display = 'none';
      inputEl.style.display = 'inline-block';
      inputEl.value = nameEl.textContent || '';
      inputEl.focus();
      inputEl.select();
    }
  });

  nameInput?.addEventListener('blur', () => {
    const nameEl = document.getElementById('cat-care-cat-name');
    const inputEl = document.getElementById('cat-care-name-input') as HTMLInputElement;
    if (nameEl && inputEl) {
      const newName = inputEl.value.trim() || '你的猫咪';
      nameEl.textContent = newName;
      nameEl.style.display = 'inline';
      inputEl.style.display = 'none';
      
      chrome.storage.local.get('gameState', (result: any) => {
        const state = result.gameState || getDefaultState();
        state.catName = newName;
        chrome.storage.local.set({ gameState: state });
      });
    }
  });

  nameInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      nameInput.blur();
    }
  });
}

// 显示提示
function showToast(message: string) {
  const toast = document.getElementById('cat-care-toast');
  if (toast) {
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.animation = 'none';
    toast.offsetHeight; // 触发重绘
    toast.style.animation = 'cat-care-toast-fade 3s ease forwards';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
}

// 更新面板UI
function updatePanelUI(state: GameState) {
  // 更新数值
  const hungerValue = document.getElementById('cat-care-hunger-value');
  const tirednessValue = document.getElementById('cat-care-tiredness-value');
  const cleanlinessValue = document.getElementById('cat-care-cleanliness-value');
  const foodValue = document.getElementById('cat-care-food-value');
  
  if (hungerValue) hungerValue.textContent = Math.round(state.hunger).toString();
  if (tirednessValue) tirednessValue.textContent = Math.round(state.tiredness).toString();
  if (cleanlinessValue) cleanlinessValue.textContent = Math.round(state.cleanliness).toString();
  if (foodValue) foodValue.textContent = state.catFood.toString();

  // 更新图标
  const hungerIcon = document.getElementById('cat-care-hunger-icon');
  const tirednessIcon = document.getElementById('cat-care-tiredness-icon');
  const cleanlinessIcon = document.getElementById('cat-care-cleanliness-icon');
  
  if (hungerIcon) {
    hungerIcon.textContent = state.hunger >= 70 ? '😠' : state.hunger >= 40 ? '😐' : '😊';
  }
  if (tirednessIcon) {
    tirednessIcon.textContent = state.tiredness >= 80 ? '😴' : state.tiredness >= 50 ? '😑' : '😄';
  }
  if (cleanlinessIcon) {
    cleanlinessIcon.textContent = state.cleanliness <= 30 ? '🤢' : state.cleanliness <= 60 ? '😕' : '✨';
  }

  // 更新猫咪图片
  const catImage = document.getElementById('cat-care-cat-image') as HTMLImageElement;
  const placeholder = document.getElementById('cat-care-placeholder');
  const uploadOverlay = document.getElementById('cat-care-upload-overlay');
  const moodBadge = document.getElementById('cat-care-mood-badge');
  
  if (state.catImageUrl) {
    if (catImage) {
      catImage.src = state.catImageUrl;
      catImage.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (uploadOverlay) uploadOverlay.style.display = 'flex';
  } else {
    if (catImage) catImage.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    if (uploadOverlay) uploadOverlay.style.display = 'none';
  }

  // 更新心情
  let mood = '😸';
  if (state.isSleeping) mood = '😴';
  else if (state.hunger >= 70) mood = '😾';
  else if (state.tiredness >= 80) mood = '😻';
  else if (state.cleanliness < 30) mood = '✨';
  
  if (moodBadge) moodBadge.textContent = mood;
  const emoji = document.getElementById('cat-care-emoji');
  if (emoji) emoji.textContent = mood;

  // 更新名字
  const catName = document.getElementById('cat-care-cat-name');
  if (catName) catName.textContent = state.catName;

  // 更新状态
  const status = document.getElementById('cat-care-status');
  if (status) {
    status.textContent = state.isSleeping ? '· 猫咪在睡觉 Zzz' : '';
  }

  // 更新按钮状态
  const feedBtn = document.getElementById('cat-care-feed-btn') as HTMLButtonElement;
  const bathBtn = document.getElementById('cat-care-bath-btn') as HTMLButtonElement;
  const playBtn = document.getElementById('cat-care-play-btn') as HTMLButtonElement;
  
  if (feedBtn) feedBtn.disabled = state.isSleeping;
  if (bathBtn) bathBtn.disabled = state.isSleeping;
  if (playBtn) playBtn.disabled = state.isSleeping;
}

// 切换面板显示
function togglePanel() {
  let panel = document.getElementById('cat-care-panel');
  
  if (!panel) {
    panel = createPanel();
  }
  
  if (panel) {
    const isVisible = panel.style.display === 'block';
    panel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      // 加载数据
      chrome.storage.local.get('gameState', (result: any) => {
        const state = result.gameState || getDefaultState();
        updatePanelUI(state);
      });
    }
  }
}

// 初始化
function init() {
  createFloatingBall();
  startGameLoop(); // 启动游戏逻辑定时器
  
  // 监听存储变化，更新UI
  chrome.storage.onChanged.addListener((changes: any) => {
    if (changes.gameState) {
      const panel = document.getElementById('cat-care-panel');
      if (panel && panel.style.display === 'block') {
        updatePanelUI(changes.gameState.newValue);
      }
    }
  });
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
