// Константы для приложения парфюмерии

export const EMOJIS = ['✨', '🎉', '🚀', '💫', '💯', '✅'];

export const VOLUME_RANGE = {
  MIN: 30,
  MAX: 1000,
  STEP: 5
} as const;

export const FILL_PERCENTAGE = {
  BASE: 8, // минимальное заполнение в процентах
  MAX: 92   // максимальное заполнение в процентах (100% - 8%)
} as const;

export const NEON_GREEN_COLOR = '#39FF14';

export const REGISTRATION_TIMEOUT = 5 * 60 * 1000; // 5 минут в миллисекундах

export const AUDIO_PATH = '/voice/voice1.mp3'; 