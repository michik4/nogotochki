
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { User, Settings } from "lucide-react";
import GuestHomePage from "@/components/GuestHomePage";
import { GuestSessionManager } from "@/components/GuestSessionManager";
import { GuestModeNotification } from "@/components/GuestModeNotification";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const handleProfileClick = () => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    if (currentUser.type === 'master') {
      navigate("/master-dashboard");
    } else if (currentUser.type === 'guest') {
      navigate("/profile");
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GuestSessionManager />
      
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold gradient-text">NailMasters</h1>
          
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleProfileClick}
                  className="text-foreground hover:bg-accent"
                >
                  <User className="w-5 h-5" />
                </Button>
                {currentUser.type !== 'guest' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/admin")}
                    className="text-foreground hover:bg-accent"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                )}
              </>
            ) : (
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Войти
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {currentUser ? (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Добро пожаловать, {currentUser.name}!
              {currentUser.type === 'guest' && (
                <span className="text-sm block text-muted-foreground mt-2">
                  (Гостевой режим)
                </span>
              )}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {currentUser.type === 'master' 
                ? 'Управляйте своими записями и дизайнами' 
                : currentUser.type === 'guest'
                ? 'Исследуйте возможности платформы'
                : 'Найдите лучшего мастера для себя'}
            </p>
            <Button 
              size="lg" 
              className="gradient-bg text-white"
              onClick={handleProfileClick}
            >
              Перейти в {currentUser.type === 'master' ? 'кабинет мастера' : 'профиль'}
            </Button>
          </div>
        ) : (
          <GuestHomePage />
        )}
      </main>

      <GuestModeNotification />
    </div>
  );
};

export default Index;
