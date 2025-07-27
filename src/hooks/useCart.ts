import { useState, useCallback } from 'react';
import { CartItem, Brand, EmojiParticle } from '../types';
import { EMOJIS, AUDIO_PATH } from '../constants';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartFlash, setCartFlash] = useState(false);
  const [emojiParticles, setEmojiParticles] = useState<EmojiParticle[]>([]);

  const addToCart = useCallback((aromaName: string, brandName: string, volume: number, brands: Brand[], selectedIndex: number) => {
    // Находим цену аромата
    const selectedBrand = brands[selectedIndex];
    const selectedAroma = selectedBrand?.aromas.find(aroma => aroma.name === aromaName);
    const price = selectedAroma?.prices[volume] || 0;

    const newItem: CartItem = { 
      aroma: aromaName, 
      brand: brandName, 
      volume: `${volume} гр`,
      price: price
    };

    setCart(prev => [...prev, newItem]);
    
    // Эффект флеша корзины
    setCartFlash(true);
    setTimeout(() => setCartFlash(false), 300);

    // Эффект эмодзи
    const newParticle: EmojiParticle = {
      id: Date.now(),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: 0,
      y: 0,
      opacity: 1,
    };

    setEmojiParticles([newParticle]);

    setTimeout(() => {
      setEmojiParticles(prev => 
        prev.map(p => p.id === newParticle.id ? { ...p, opacity: 0 } : p)
      );
      setTimeout(() => {
        setEmojiParticles(prev => 
          prev.filter(p => p.id !== newParticle.id)
        );
      }, 500);
    }, 100);

    // Воспроизведение звука
    const audio = new Audio(AUDIO_PATH);
    audio.play().catch(e => {
      console.warn('Audio playback failed:', e);
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  }, [cart]);

  return {
    cart,
    cartFlash,
    emojiParticles,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    cartItemsCount: cart.length
  };
}; 