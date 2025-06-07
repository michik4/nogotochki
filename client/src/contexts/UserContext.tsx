
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Типы пользователей в системе
export type UserType = 'client' | 'master' | 'guest';

// Базовый интерфейс пользователя
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  type: UserType;
  location?: string;
  joinDate?: string;
}

// Интерфейс клиента - расширяет базовый User
export interface Client extends User {
  type: 'client';
  totalBookings: number;
  favoriteCount: number;
  uploadsCount: number;
}

// Интерфейс мастера - расширяет базовый User
export interface Master extends User {
  type: 'master';
  rating: number;
  reviewsCount: number;
  experience: string;
  specialties: string[];
  canDoDesigns: number;
  uploadsCount: number;
}

// Интерфейс гостевого пользователя - временный аккаунт
export interface Guest extends User {
  type: 'guest';
  sessionId: string;
  createdAt: string;
  isTemporary: true;
}

// Интерфейс записи к мастеру
export interface Booking {
  id: string;
  clientName?: string;
  masterName?: string;
  service: string;
  design: string;
  date: string;
  time?: string;
  price: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  image: string;
  needsResponse?: boolean;
  requestTime?: string;
}

// Интерфейс дизайна ногтей
export interface Design {
  id: string;
  title: string;
  image: string;
  category: string;
  price?: string;
  duration?: string;
  likes: number;
  bookings?: number;
  active?: boolean;
  masterName?: string;
}

// Интерфейс загруженного контента
export interface Upload {
  id: string;
  title: string;
  image: string;
  type: 'photo' | 'video';
  likes: number;
  date: string;
}

// Интерфейс контекста пользователя
interface UserContextType {
  currentUser: Client | Master | Guest | null;
  bookings: Booking[];
  favorites: Design[];
  uploads: Upload[];
  designs: Design[];
  setCurrentUser: (user: Client | Master | Guest | null) => void;
  createGuestSession: () => Guest;
  convertGuestToUser: (userType: 'client' | 'master', userData: Partial<User>) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  addToFavorites: (design: Design) => void;
  removeFromFavorites: (designId: string) => void;
  addUpload: (upload: Upload) => void;
  removeUpload: (uploadId: string) => void;
  addDesign: (design: Design) => void;
  updateDesign: (id: string, updates: Partial<Design>) => void;
  removeDesign: (designId: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Хук для использования контекста пользователя
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

/**
 * Провайдер контекста пользователя
 * Управляет состоянием пользователя и связанными данными
 */
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Client | Master | Guest | null>(null);
  
  // Начальные данные записей (заглушка)
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      masterName: "Анна Соколова",
      service: "Маникюр + гель-лак",
      design: "Классический френч",
      date: "15 мая, 14:00",
      price: "2500₽",
      status: "confirmed",
      image: "/placeholder.svg"
    },
    {
      id: "2",
      masterName: "Мария Петрова",
      service: "Френч",
      design: "Омбре с блестками",
      date: "20 мая, 16:00",
      price: "2200₽",
      status: "pending",
      image: "/placeholder.svg"
    }
  ]);

  // Начальные данные избранного (заглушка)
  const [favorites, setFavorites] = useState<Design[]>([
    {
      id: "1",
      title: "Классический френч",
      image: "/placeholder.svg",
      category: "Базовый",
      price: "2500₽",
      likes: 124,
      masterName: "Анна Соколова"
    },
    {
      id: "2",
      title: "3D дизайн с цветами",
      image: "/placeholder.svg",
      category: "Дизайнерский",
      price: "3500₽",
      likes: 89,
      masterName: "Екатерина Смирнова"
    }
  ]);

  // Начальные данные загрузок (заглушка)
  const [uploads, setUploads] = useState<Upload[]>([
    {
      id: "1",
      title: "Мой маникюр",
      image: "/placeholder.svg",
      type: "photo",
      likes: 24,
      date: "10 мая 2024"
    },
    {
      id: "2",
      title: "Результат работы",
      image: "/placeholder.svg",
      type: "video",
      likes: 45,
      date: "8 мая 2024"
    }
  ]);

  // Начальные данные дизайнов (заглушка)
  const [designs, setDesigns] = useState<Design[]>([
    {
      id: "1",
      title: "Классический френч",
      image: "/placeholder.svg",
      category: "Базовый",
      price: "1500₽",
      duration: "60 мин",
      likes: 124,
      bookings: 45,
      active: true
    },
    {
      id: "2",
      title: "Омбре с блестками",
      image: "/placeholder.svg",
      category: "Дизайнерский",
      price: "2800₽",
      duration: "120 мин",
      likes: 89,
      bookings: 23,
      active: true
    }
  ]);

  /**
   * Создание гостевой сессии
   * Создает временного пользователя для неавторизованных посетителей
   */
  const createGuestSession = (): Guest => {
    const guestUser: Guest = {
      id: `guest_${Date.now()}`,
      name: `Гость ${Math.floor(Math.random() * 1000)}`,
      email: '',
      phone: '',
      avatar: '/placeholder.svg',
      type: 'guest',
      location: 'Москва',
      joinDate: new Date().toLocaleDateString('ru-RU'),
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isTemporary: true
    };

    setCurrentUser(guestUser);
    
    // Сохранение сессии в localStorage для восстановления
    localStorage.setItem('guestSession', JSON.stringify(guestUser));
    
    return guestUser;
  };

  /**
   * Преобразование гостевого аккаунта в постоянный
   * Конвертирует временного пользователя в клиента или мастера
   */
  const convertGuestToUser = (userType: 'client' | 'master', userData: Partial<User>) => {
    if (!currentUser || currentUser.type !== 'guest') return;

    const baseUser = {
      id: Date.now().toString(),
      name: userData.name || currentUser.name,
      email: userData.email || '',
      phone: userData.phone || '',
      avatar: userData.avatar || currentUser.avatar,
      location: userData.location || currentUser.location,
      joinDate: new Date().toLocaleDateString('ru-RU')
    };

    let newUser: Client | Master;

    if (userType === 'client') {
      newUser = {
        ...baseUser,
        type: 'client',
        totalBookings: 0,
        favoriteCount: favorites.length,
        uploadsCount: uploads.length
      };
    } else {
      newUser = {
        ...baseUser,
        type: 'master',
        rating: 5.0,
        reviewsCount: 0,
        experience: 'Новичок',
        specialties: ['Маникюр'],
        canDoDesigns: designs.length,
        uploadsCount: uploads.length
      };
    }

    setCurrentUser(newUser);
    
    // Удаление гостевой сессии
    localStorage.removeItem('guestSession');
  };

  // Функции управления записями
  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(booking => 
      booking.id === id ? { ...booking, ...updates } : booking
    ));
  };

  const removeBooking = (id: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== id));
  };

  // Функции управления избранным
  const addToFavorites = (design: Design) => {
    setFavorites(prev => {
      if (prev.some(fav => fav.id === design.id)) return prev;
      return [...prev, design];
    });
  };

  const removeFromFavorites = (designId: string) => {
    setFavorites(prev => prev.filter(design => design.id !== designId));
  };

  // Функции управления загрузками
  const addUpload = (upload: Upload) => {
    setUploads(prev => [...prev, upload]);
  };

  const removeUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  };

  // Функции управления дизайнами
  const addDesign = (design: Design) => {
    setDesigns(prev => [...prev, design]);
  };

  const updateDesign = (id: string, updates: Partial<Design>) => {
    setDesigns(prev => prev.map(design => 
      design.id === id ? { ...design, ...updates } : design
    ));
  };

  const removeDesign = (designId: string) => {
    setDesigns(prev => prev.filter(design => design.id !== designId));
  };

  // Функция обновления профиля пользователя
  const updateUserProfile = (updates: Partial<User>) => {
    if (currentUser) {
      if (currentUser.type === 'client') {
        setCurrentUser({ ...currentUser, ...updates } as Client);
      } else {
        setCurrentUser({ ...currentUser, ...updates } as Master);
      }
    }
  };

  // Значение контекста
  const value: UserContextType = {
    currentUser,
    bookings,
    favorites,
    uploads,
    designs,
    setCurrentUser,
    createGuestSession,
    convertGuestToUser,
    addBooking,
    updateBooking,
    removeBooking,
    addToFavorites,
    removeFromFavorites,
    addUpload,
    removeUpload,
    addDesign,
    updateDesign,
    removeDesign,
    updateUserProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
