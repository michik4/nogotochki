
import { useState } from "react";
import { X, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

export const GuestModeNotification = () => {
  const { currentUser } = useUser();
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!currentUser || currentUser.type !== 'guest' || !isVisible) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-semibold text-sm">Гостевой режим</h4>
            <p className="text-xs text-muted-foreground">
              Вы используете временный аккаунт. Данные сохранятся на 24 часа.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => navigate("/auth")}
              className="h-7 px-3 text-xs"
            >
              <LogIn className="w-3 h-3 mr-1" />
              Войти
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-7 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
