// Типы и интерфейсы для приложения парфюмерии

export type Brand = { 
  name: string; 
  aromas: Aroma[] 
};

export type Aroma = { 
  name: string; 
  description: string; 
  aroma_group: string; 
  prices: { [key: string]: number }; 
  image?: string; 
  brand?: string;
  country?: string;
  flag?: string;
  gender?: string;
  rating?: number;
  topNotes?: string;
  middleNotes?: string;
  baseNotes?: string;
};

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  comment: string;
  receiptAttached: boolean;
  history: ChatMessage[];
  awaitingManagerReply: boolean;
  address?: string;
  phone?: string;
  total: number;
}

export interface CartItem {
  aroma: string;
  brand: string;
  volume: string;
  price: number;
}

export interface ChatMessage {
  text: string;
  sender: 'user' | 'manager';
  file?: {
    name: string;
    url: string;
  };
}

export interface User {
  name: string;
  balance: string;
  avatar: string;
  orders: Order[];
  address: string;
  phone: string;
  inviteCode: string;
}

export interface EmojiParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  opacity: number;
}

export interface KnobPosition {
  x: number;
  y: number;
}

export interface DragState {
  x: number;
  y: number;
  volume: number;
}

export interface AromaForVolume {
  aroma: Aroma;
  brand: string;
}

export type ProfileTab = 'data' | 'orders';
export type CheckoutStep = null | 'form' | 'payment' | 'orderDetail'; 