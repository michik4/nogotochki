
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface FavoritesTabProps {
  onBookAgain: (designId: string) => void;
}

/**
 * Компонент вкладки с избранными дизайнами
 * Отображает сетку избранных дизайнов пользователя
 */
const FavoritesTab = ({ onBookAgain }: FavoritesTabProps) => {
  const { favorites, removeFromFavorites } = useUser();
  const { toast } = useToast();

  // Обработчик просмотра всех избранных
  const handleViewFavorites = () => {
    toast({
      title: "Избранные дизайны",
      description: "Показаны все избранные дизайны.",
    });
  };

  // Обработчик удаления из избранного
  const handleRemoveFromFavorites = (designId: string) => {
    removeFromFavorites(designId);
    toast({
      title: "Удалено из избранного",
      description: "Дизайн удален из ваших избранных.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Избранные дизайны ({favorites.length})
          </div>
          <Button size="sm" variant="outline" onClick={handleViewFavorites}>
            Все избранные
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {favorites.slice(0, 4).map((design) => (
              <div key={design.id} className="relative group">
                {/* Изображение дизайна */}
                <img 
                  src={design.image} 
                  alt={design.title}
                  className="w-full h-32 rounded-lg object-cover"
                />
                
                {/* Оверлей с кнопками действий */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onBookAgain(design.id)}>
                      Записаться
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveFromFavorites(design.id)}>
                      Удалить
                    </Button>
                  </div>
                </div>
                
                {/* Информация о дизайне */}
                <div className="mt-2">
                  <h4 className="font-medium text-sm">{design.title}</h4>
                  <p className="text-xs text-muted-foreground">{design.masterName}</p>
                  <p className="text-xs font-semibold text-primary">{design.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">У вас пока нет избранных дизайнов</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoritesTab;
