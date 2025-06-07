
import { useState } from "react";
import { Edit2, User, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUser, Client, Master, Guest } from "@/contexts/UserContext";

interface ProfileHeaderProps {
  onEditProfile: () => void;
  onConvertGuest: () => void;
}

/**
 * Компонент заголовка профиля пользователя
 * Отображает основную информацию о пользователе и кнопки действий
 */
const ProfileHeader = ({ onEditProfile, onConvertGuest }: ProfileHeaderProps) => {
  const { currentUser } = useUser();

  if (!currentUser) return null;

  const isGuest = currentUser.type === 'guest';

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Аватар пользователя */}
          <Avatar className="w-24 h-24">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="text-xl">{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          
          {/* Основная информация о пользователе */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold">{currentUser.name}</h1>
              {isGuest && (
                <Badge variant="secondary" className="mt-1">
                  Гостевой аккаунт
                </Badge>
              )}
              <p className="text-muted-foreground">{currentUser.email}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {currentUser.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  С {currentUser.joinDate}
                </span>
              </div>
            </div>
            
            {/* Кнопки действий */}
            <div className="flex gap-2">
              {!isGuest && (
                <Button variant="outline" onClick={onEditProfile}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              )}
              
              {isGuest && (
                <Button onClick={onConvertGuest} className="gradient-bg text-white">
                  <User className="w-4 h-4 mr-2" />
                  Создать постоянный аккаунт
                </Button>
              )}
            </div>
          </div>
          
          {/* Статистика для клиентов */}
          {!isGuest && currentUser.type === 'client' && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{(currentUser as Client).totalBookings}</div>
                <div className="text-sm text-muted-foreground">Записей</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{(currentUser as Client).favoriteCount}</div>
                <div className="text-sm text-muted-foreground">Избранное</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{(currentUser as Client).uploadsCount}</div>
                <div className="text-sm text-muted-foreground">Загрузок</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
