
import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

export const GuestSessionManager = () => {
  const { currentUser, setCurrentUser } = useUser();

  useEffect(() => {
    // Проверяем, есть ли сохраненная гостевая сессия
    if (!currentUser) {
      const savedGuestSession = localStorage.getItem('guestSession');
      if (savedGuestSession) {
        try {
          const guestUser = JSON.parse(savedGuestSession);
          // Проверяем, что сессия не старше 24 часов
          const sessionAge = Date.now() - new Date(guestUser.createdAt).getTime();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          
          if (sessionAge < twentyFourHours) {
            setCurrentUser(guestUser);
          } else {
            localStorage.removeItem('guestSession');
          }
        } catch (error) {
          localStorage.removeItem('guestSession');
        }
      }
    }
  }, [currentUser, setCurrentUser]);

  return null; // Этот компонент не рендерит ничего
};
