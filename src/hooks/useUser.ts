import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Order, CartItem } from '../types';
import { REGISTRATION_TIMEOUT } from '../constants';

export const useUser = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User>(() => {
    const savedName = localStorage.getItem('userName') || '';
    const savedPhone = localStorage.getItem('userPhone') || '';
    const savedInviteCode = localStorage.getItem('inviteCode') || '';
    return {
      name: savedName,
      balance: '12 500 ₽',
      avatar: '',
      orders: [],
      address: '',
      phone: savedPhone,
      inviteCode: savedInviteCode,
    };
  });

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const updateUserField = useCallback((field: keyof User, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  }, []);

  const addOrder = useCallback((cartItems: CartItem[], address: string, phone: string) => {
    const newOrderId = `ORD-${Date.now()}`;
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const newOrder: Order = { 
      id: newOrderId, 
      date: new Date().toLocaleDateString('ru-RU'), 
      items: [...cartItems], 
      comment: '', 
      receiptAttached: false, 
      history: [], 
      awaitingManagerReply: false,
      address: address,
      phone: phone,
      total: total
    };
    
    setUser(prev => ({
      ...prev, 
      orders: [...prev.orders, newOrder],
      address: address,
      phone: phone
    }));

    return newOrder;
  }, []);

  const updateOrderHistory = useCallback((orderIndex: number, updates: Partial<Order>) => {
    setUser(prev => {
      const updatedOrders = [...prev.orders];
      updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], ...updates };
      return { ...prev, orders: updatedOrders };
    });
  }, []);

  const checkRegistrationStatus = useCallback(() => {
    const userRegistered = localStorage.getItem('userRegistered');
    const userName = localStorage.getItem('userName');
    const userPhone = localStorage.getItem('userPhone');
    const lastRegistrationTime = localStorage.getItem('lastRegistrationTime');
    const lastSkipTime = localStorage.getItem('lastSkipTime');

    const now = new Date().getTime();

    const registered = userRegistered === 'true' && !!userName && !!userPhone;
    const skippedRecently = lastSkipTime && (now - parseInt(lastSkipTime) < REGISTRATION_TIMEOUT);
    const registeredRecently = lastRegistrationTime && (now - parseInt(lastRegistrationTime) < REGISTRATION_TIMEOUT);

    if (registered) {
      const savedInviteCode = localStorage.getItem('inviteCode') || '';
      setUser(prev => ({ 
        ...prev, 
        name: userName!, 
        phone: userPhone!, 
        inviteCode: savedInviteCode 
      }));
    } else if (!skippedRecently && !registeredRecently) {
      navigate('/start');
    }
  }, [navigate]);

  useEffect(() => {
    checkRegistrationStatus();
    const intervalId = setInterval(checkRegistrationStatus, REGISTRATION_TIMEOUT);

    return () => clearInterval(intervalId);
  }, [checkRegistrationStatus]);

  return {
    user,
    updateUser,
    updateUserField,
    addOrder,
    updateOrderHistory,
    checkRegistrationStatus
  };
}; 