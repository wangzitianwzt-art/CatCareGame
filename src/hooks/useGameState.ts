import { useState, useEffect, useCallback } from "react";
import { GameState, INITIAL_GAME_STATE, CatMood } from "../types/game";

declare const chrome: any;

// 游戏常量
const GAME_CONFIG = {
  TICK_INTERVAL: 1000, // 每秒更新一次
  FOOD_CONSUME_INTERVAL: 5, // 每5秒消耗1猫粮
  HUNGER_INCREASE_INTERVAL: 5, // 每5秒增加1饥饿值（当猫粮为0时）
  TIREDNESS_THRESHOLD: 80, // 疲惫值达到80时进入睡眠
  BATH_COOLDOWN: 10 * 60 * 1000, // 洗澡冷協10分钟
  BATH_EMERGENCY_THRESHOLD: 25, // 清洁度低于25时可立即洗澡
  PLAY_HUNGER_INCREASE: 5, // 逗猫增加5饥饿值
  PLAY_CLEANLINESS_DECREASE: 5, // 逗猫减少5清洁度
  PLAY_TIREDNESS_INCREASE: 5, // 逗猫增加5疲惫值
  SLEEP_TIREDNESS_DECREASE: 2, // 睡眠时每秒减少2疲惫值
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 Chrome Storage 加载游戏状态
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get("gameState", (result: any) => {
        if (result.gameState) {
          setState({
            ...INITIAL_GAME_STATE,
            ...result.gameState,
          });
        }
        setIsLoaded(true);
      });
    } else {
      setIsLoaded(true);
    }
  }, []);

  // 保存游戏状态到 Chrome Storage
  useEffect(() => {
    if (isLoaded && typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ gameState: state });
    }
  }, [state, isLoaded]);

  // 每秒更新一次游戏状态
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prevState) => {
        let newState = { ...prevState };
        const tickCount = prevState.totalPlayTime + 1;

        // 处理睡眠状态 - 疲惫值为0时醒来
        if (prevState.isSleeping) {
          // 睡眠时疲惫值持续减少
          newState.tiredness = Math.max(0, prevState.tiredness - GAME_CONFIG.SLEEP_TIREDNESS_DECREASE);
          
          // 疲惫值为0时，猫咪醒来
          if (newState.tiredness <= 0) {
            newState.isSleeping = false;
            newState.sleepStartTime = null;
            newState.tiredness = 0;
          }
        } else {
          // 非睡眠状态下的逻辑

          if (tickCount % GAME_CONFIG.FOOD_CONSUME_INTERVAL === 0) {
            if (prevState.catFood > 0) {
              // 猫粮不为0时：消耗1猫粮，同时饥饿值减少1（直到饥饿值为0）
              newState.catFood = Math.max(0, prevState.catFood - 1);
              newState.hunger = Math.max(0, prevState.hunger - 1);
            } else {
              // 猫粮为0时：饥饿值增加1
              newState.hunger = Math.min(100, prevState.hunger + 1);
            }
          }
        }

        newState.totalPlayTime = tickCount;

        return newState;
      });
    }, GAME_CONFIG.TICK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // 补充猫粮 - 直接加满到100（饥饿值会随着猫粮消耗逐渐减少）
  const addFood = useCallback(() => {
    setState((prevState) => {
      if (prevState.isSleeping) return prevState;
      return {
        ...prevState,
        catFood: 100,
        lastFeedTime: Date.now(),
      };
    });
  }, []);

  // 逗猫 - 饥饿+5、清洁度-5、疲惫+5
  const play = useCallback(() => {
    setState((prevState) => {
      if (prevState.isSleeping) return prevState;

      const newHunger = Math.min(100, prevState.hunger + GAME_CONFIG.PLAY_HUNGER_INCREASE);
      const newCleanliness = Math.max(0, prevState.cleanliness - GAME_CONFIG.PLAY_CLEANLINESS_DECREASE);
      const newTiredness = Math.min(100, prevState.tiredness + GAME_CONFIG.PLAY_TIREDNESS_INCREASE);
      
      // 疲惫值达到阈值时进入睡眠
      const isSleeping = newTiredness >= GAME_CONFIG.TIREDNESS_THRESHOLD;

      return {
        ...prevState,
        hunger: newHunger,
        cleanliness: newCleanliness,
        tiredness: newTiredness,
        isSleeping,
        sleepStartTime: isSleeping ? Date.now() : null,
      };
    });
  }, []);

  // 洗澡 - 清洁度恢复到100
  // 清洁度 < 25 时可立即洗澡，否则需要等待10分钟冷却
  const bath = useCallback(() => {
    setState((prevState) => {
      if (prevState.isSleeping) return prevState;
      
      const now = Date.now();
      const timeSinceLastBath = now - prevState.lastBathTime;
      
      // 清洁度低于25时可以立即洗澡
      const canBathNow = prevState.cleanliness < GAME_CONFIG.BATH_EMERGENCY_THRESHOLD || 
                         timeSinceLastBath >= GAME_CONFIG.BATH_COOLDOWN;

      if (!canBathNow) {
        return prevState;
      }

      return {
        ...prevState,
        cleanliness: 100,
        lastBathTime: now,
      };
    });
  }, []);

  // 检查是否可以洗澡
  // 清洁度 < 25 时可立即洗澡，否则需要等待10分钟冷却
  const canBath = useCallback(() => {
    // 清洁度低于25时可以立即洗澡
    if (state.cleanliness < GAME_CONFIG.BATH_EMERGENCY_THRESHOLD) {
      return true;
    }
    // 否则检查冷却时间
    const now = Date.now();
    const timeSinceLastBath = now - state.lastBathTime;
    return timeSinceLastBath >= GAME_CONFIG.BATH_COOLDOWN;
  }, [state.lastBathTime, state.cleanliness]);

  // 获取猫咪表情
  const getMoodEmoji = useCallback((): string => {
    const mood = determineMood(state);
    const moodMap: Record<CatMood, string> = {
      happy: "😸",
      hungry: "😾",
      tired: "😻",
      sleeping: "😴",
      clean: "✨",
    };
    return moodMap[mood];
  }, [state]);

  // 重置游戏（保留图片和名字）
  const resetGame = useCallback(() => {
    setState((prevState) => ({
      ...INITIAL_GAME_STATE,
      createdAt: Date.now(),
      lastBathTime: Date.now(),
      lastFeedTime: Date.now(),
      catImageUrl: prevState.catImageUrl, // 保留图片
      catName: prevState.catName, // 保留名字
    }));
  }, []);

  // 设置猫咪图片
  const setCatImage = useCallback((imageUrl: string | null) => {
    setState((prevState) => ({
      ...prevState,
      catImageUrl: imageUrl,
    }));
  }, []);

  // 设置猫咪名字
  const setCatName = useCallback((name: string) => {
    setState((prevState) => ({
      ...prevState,
      catName: name || "你的猫咪",
    }));
  }, []);

  return {
    state: { ...state, mood: determineMood(state) },
    addFood,
    play,
    bath,
    canBath,
    getMoodEmoji,
    resetGame,
    setCatImage,
    setCatName,
  };
}

// 判断猫咪心情
function determineMood(state: GameState): CatMood {
  if (state.isSleeping) return "sleeping";
  if (state.hunger >= 70) return "hungry";
  if (state.tiredness >= 80) return "tired";
  if (state.cleanliness < 30) return "clean";
  return "happy";
}
