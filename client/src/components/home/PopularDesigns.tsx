
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

/**
 * Секция с популярными дизайнами
 * Отображает сетку трендовых дизайнов ногтей
 */
const PopularDesigns = () => {
  const navigate = useNavigate();

  // Данные популярных дизайнов (в реальном приложении будут получены из API)
  const popularDesigns = [
    {
      id: "1",
      title: "Классический френч",
      image: "/placeholder.svg",
      likes: 124,
      masterName: "Анна Соколова",
      price: "1500₽"
    },
    {
      id: "2",
      title: "Омбре с блестками",
      image: "/placeholder.svg",
      likes: 89,
      masterName: "Мария Петрова",
      price: "2200₽"
    },
    {
      id: "3",
      title: "3D дизайн с цветами",
      image: "/placeholder.svg",
      likes: 156,
      masterName: "Екатерина Смирнова",
      price: "3500₽"
    },
    {
      id: "4",
      title: "Минимализм",
      image: "/placeholder.svg",
      likes: 67,
      masterName: "Анна Соколова",
      price: "1800₽"
    }
  ];

  return (
    <section className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Популярные дизайны</h2>
        <Button variant="ghost" onClick={() => navigate("/auth")}>
          Смотреть все
        </Button>
      </div>

      {/* Сетка дизайнов */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {popularDesigns.map((design) => (
          <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate("/auth")}>
            <div className="aspect-square relative">
              {/* Изображение дизайна */}
              <img 
                src={design.image} 
                alt={design.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              
              {/* Градиентный оверлей */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Информация о дизайне */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-semibold text-sm mb-1">{design.title}</h3>
                <div className="flex items-center justify-between text-xs">
                  <span>{design.masterName}</span>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {design.likes}
                  </div>
                </div>
              </div>
              
              {/* Ценник */}
              <Badge className="absolute top-3 right-3 bg-black/70 text-white text-xs">
                {design.price}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PopularDesigns;
