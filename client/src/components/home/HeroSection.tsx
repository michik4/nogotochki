
import { useState } from "react";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

/**
 * Главная секция домашней страницы
 * Включает заголовок, описание, поиск и основные кнопки действий
 */
const HeroSection = () => {
  const navigate = useNavigate();
  const { createGuestSession } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  // Обработчик входа в гостевой режим
  const handleTryAsGuest = () => {
    createGuestSession();
    // Страница автоматически обновится через контекст
  };

  return (
    <div className="text-center space-y-6 py-12">
      {/* Заголовок приложения */}
      <h1 className="text-4xl md:text-6xl font-bold gradient-text">
        NailMasters
      </h1>
      
      {/* Описание */}
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Найдите лучшего мастера маникюра в вашем городе и запишитесь онлайн
      </p>
      
      {/* Поиск */}
      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Поиск мастера или услуги..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-3 text-lg"
        />
      </div>

      {/* Основные кнопки действий */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg" 
          className="gradient-bg text-white"
          onClick={() => navigate("/auth")}
        >
          Найти мастера
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => navigate("/auth")}
        >
          Стать мастером
        </Button>
        <Button 
          size="lg" 
          variant="secondary"
          onClick={handleTryAsGuest}
        >
          <User className="w-4 h-4 mr-2" />
          Попробовать как гость
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
