
import { useState, useEffect } from "react";
import { ArrowLeft, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import EditProfileModal from "@/components/EditProfileModal";
import UploadContentModal from "@/components/UploadContentModal";
import ConvertGuestModal from "@/components/ConvertGuestModal";
import ProfileHeader from "@/components/profile/ProfileHeader";
import BookingsTab from "@/components/profile/BookingsTab";
import FavoritesTab from "@/components/profile/FavoritesTab";
import UploadsTab from "@/components/profile/UploadsTab";

/**
 * Страница профиля пользователя
 * Отображает информацию о пользователе и его активность
 */
const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const { toast } = useToast();
  
  // Перенаправление неавторизованных пользователей
  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const isGuest = currentUser.type === 'guest';

  // Обработчик повторной записи
  const handleBookAgain = (designId: string) => {
    toast({
      title: "Записаться снова",
      description: "Функция записи будет доступна в следующем обновлении.",
    });
  };

  // Обработчик выхода из аккаунта
  const handleLogout = () => {
    setCurrentUser(null);
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из аккаунта.",
    });
    navigate("/");
  };

  // Рендер содержимого вкладок
  const renderTabContent = () => {
    switch (activeTab) {
      case "bookings":
        return <BookingsTab onBookAgain={handleBookAgain} />;
      case "favorites":
        return <FavoritesTab onBookAgain={handleBookAgain} />;
      case "uploads":
        return <UploadsTab />;
      default:
        return <BookingsTab onBookAgain={handleBookAgain} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Заголовок страницы */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Профиль клиента</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        {/* Заголовок профиля */}
        <ProfileHeader 
          onEditProfile={() => setIsEditModalOpen(true)}
          onConvertGuest={() => setIsConvertModalOpen(true)}
        />

        {/* Содержимое вкладки */}
        {renderTabContent()}

        {/* Карточка выхода */}
        <Card>
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти из аккаунта
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Модальные окна */}
      {!isGuest && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}
      
      <UploadContentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />

      {isGuest && (
        <ConvertGuestModal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;
