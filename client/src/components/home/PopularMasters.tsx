
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

/**
 * Секция с популярными мастерами
 * Отображает карточки лучших мастеров с их информацией
 */
const PopularMasters = () => {
  const navigate = useNavigate();

  // Данные популярных мастеров (в реальном приложении будут получены из API)
  const featuredMasters = [
    {
      id: "1",
      name: "Анна Соколова",
      avatar: "/placeholder.svg",
      rating: 4.9,
      reviewsCount: 127,
      specialties: ["Гель-лак", "Дизайн", "Френч"],
      location: "Центр",
      priceFrom: "1500₽",
      image: "/placeholder.svg"
    },
    {
      id: "2",
      name: "Мария Петрова",
      avatar: "/placeholder.svg",
      rating: 4.8,
      reviewsCount: 89,
      specialties: ["Маникюр", "Педикюр", "Покрытие"],
      location: "Юго-Запад",
      priceFrom: "2000₽",
      image: "/placeholder.svg"
    },
    {
      id: "3",
      name: "Екатерина Смирнова",
      avatar: "/placeholder.svg",
      rating: 4.7,
      reviewsCount: 156,
      specialties: ["3D дизайн", "Роспись", "Стразы"],
      location: "Север",
      priceFrom: "2500₽",
      image: "/placeholder.svg"
    }
  ];

  return (
    <section className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Популярные мастера</h2>
        <Button variant="ghost" onClick={() => navigate("/auth")}>
          Смотреть всех
        </Button>
      </div>

      {/* Сетка карточек мастеров */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredMasters.map((master) => (
          <Card key={master.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/auth")}>
            
            {/* Изображение мастера */}
            <div className="aspect-video relative">
              <img 
                src={master.image} 
                alt={master.name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-3 left-3 bg-black/70 text-white">
                от {master.priceFrom}
              </Badge>
            </div>
            
            {/* Информация о мастере */}
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{master.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {master.location}
                  </div>
                </div>
                
                {/* Рейтинг */}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{master.rating}</span>
                  <span className="text-sm text-muted-foreground">({master.reviewsCount})</span>
                </div>
              </div>
              
              {/* Специализации */}
              <div className="flex flex-wrap gap-1 mb-3">
                {master.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              {/* Кнопка записи */}
              <Button className="w-full" onClick={() => navigate("/auth")}>
                Записаться
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PopularMasters;
