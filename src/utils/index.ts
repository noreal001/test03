// Утилитарные функции

export const formatPrice = (price: number): string => {
  return price.toLocaleString('ru-RU');
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU');
};

export const loadBrandsData = async () => {
  try {
    const response = await fetch('/brands.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.slice().sort((a: any, b: any) => a.name.localeCompare(b.name, 'ru'));
  } catch (error) {
    console.error("Ошибка при загрузке брендов:", error);
    return [];
  }
};

export const generateOrderId = (): string => {
  return `ORD-${Date.now()}`;
};

export const generateRandomRating = (): number => {
  return 85 + Math.floor(Math.random() * 10);
}; 