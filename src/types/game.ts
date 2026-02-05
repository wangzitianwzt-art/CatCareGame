export type CatMood = "happy" | "hungry" | "tired" | "sleeping" | "clean";

export interface GameState {
  hunger: number; // 0-100，饮饿值
  tiredness: number; // 0-100，疲惫值
  cleanliness: number; // 0-100，清洁度
  catFood: number; // 猫粮数量
  mood: CatMood; // 猫咪心情
  lastBathTime: number; // 上次洗潜的时间戳
  lastFeedTime: number; // 上次补充猫粮的时戳
  sleepStartTime: number | null; // 睡眠开始时间
  isSleeping: boolean; // 是否在睡眠
  totalPlayTime: number; // 总游玩时间（秒）
  createdAt: number; // 游戏创建时间
  catImageUrl: string | null; // 用户上传的猫咪照片 URL
  catName: string; // 猫咪的名字
}

export const INITIAL_GAME_STATE: GameState = {
  hunger: 0,
  tiredness: 0,
  cleanliness: 100,
  catFood: 0,
  mood: "happy",
  lastBathTime: Date.now(),
  lastFeedTime: Date.now(),
  sleepStartTime: null,
  isSleeping: false,
  totalPlayTime: 0,
  createdAt: Date.now(),
  catImageUrl: null,
  catName: "你的猫咪",
};

export const GAME_CONSTANTS = {
  TICK_INTERVAL: 1000,
  FOOD_CONSUME_INTERVAL: 10,
  HUNGER_INCREASE_INTERVAL: 5,
  CLEANLINESS_DECREASE_INTERVAL: 30,
  TIREDNESS_DECREASE_INTERVAL: 2,
  HUNGER_THRESHOLD: 70,
  TIREDNESS_THRESHOLD: 80,
  BATH_COOLDOWN: 24 * 60 * 60 * 1000,
  FOOD_AMOUNT_PER_ADD: 50,
  TIREDNESS_PER_PLAY: 15,
  SLEEP_DURATION: 5 * 60 * 1000,
};
