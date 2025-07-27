import { useState, useEffect, useCallback } from 'react';
import { KnobPosition, DragState } from '../types';
import { VOLUME_RANGE, NEON_GREEN_COLOR, FILL_PERCENTAGE } from '../constants';

export const useVolumeSlider = () => {
  const [volumeSliderValue, setVolumeSliderValue] = useState<number>(VOLUME_RANGE.MIN);
  const [knobPosition, setKnobPosition] = useState<KnobPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DragState>({ x: 0, y: 0, volume: 0 });

  // Обработка 2D перетаскивания шарика
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // Рассчитываем новое значение объема
      const volumeRange = VOLUME_RANGE.MAX - VOLUME_RANGE.MIN;
      const newVolume = Math.max(VOLUME_RANGE.MIN, Math.min(VOLUME_RANGE.MAX, 
        dragStart.volume + (deltaX * volumeRange) / 400
      ));
      
      // Простое смещение кнопки
      setKnobPosition({
        x: deltaX * 0.5,
        y: Math.max(-60, Math.min(60, deltaY * 1.0))
      });
      
      // Округляем до ближайшего кратного STEP и устанавливаем значение объема
      const roundedVolume = Math.round(newVolume / VOLUME_RANGE.STEP) * VOLUME_RANGE.STEP;
      setVolumeSliderValue(roundedVolume);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX,
      y: clientY,
      volume: volumeSliderValue
    });
  }, [volumeSliderValue]);

  const getDarkerFillColor = useCallback(() => {
    return NEON_GREEN_COLOR;
  }, []);

  const getFillPercentage = useCallback((volume: number) => {
    const basePercentage = ((volume - VOLUME_RANGE.MIN) / (VOLUME_RANGE.MAX - VOLUME_RANGE.MIN)) * FILL_PERCENTAGE.MAX;
    return basePercentage + FILL_PERCENTAGE.BASE;
  }, []);

  const getLineBendAndGlow = useCallback(() => {
    const knobPositionPercent = ((volumeSliderValue - VOLUME_RANGE.MIN) / (VOLUME_RANGE.MAX - VOLUME_RANGE.MIN)) * 100;
    const actualKnobX = knobPositionPercent + (knobPosition.x / 3);
    const knobY = Math.abs(knobPosition.y);
    
    const nearScale = knobY > 20;
    const nearEdge = actualKnobX < 15 || actualKnobX > 85;
    const shouldShow = nearScale || nearEdge;
    
    return {
      shouldBend: shouldShow,
      bendPosition: actualKnobX,
      bendIntensity: nearScale ? Math.min(15, knobY / 3) : (nearEdge ? 10 : 0),
      glowIntensity: nearScale ? Math.min(1, knobY / 40) : (nearEdge ? 0.7 : 0)
    };
  }, [volumeSliderValue, knobPosition]);

  const resetSlider = useCallback(() => {
    setVolumeSliderValue(VOLUME_RANGE.MIN);
    setKnobPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  return {
    volumeSliderValue,
    setVolumeSliderValue,
    knobPosition,
    isDragging,
    startDrag,
    getDarkerFillColor,
    getFillPercentage,
    getLineBendAndGlow,
    resetSlider
  };
}; 