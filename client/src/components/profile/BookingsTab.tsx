
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, Booking } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface BookingsTabProps {
  onBookAgain: (designId: string) => void;
}

/**
 * Компонент вкладки с записями пользователя
 * Отображает список записей и позволяет управлять ими
 */
const BookingsTab = ({ onBookAgain }: BookingsTabProps) => {
  const { bookings, updateBooking } = useUser();
  const { toast } = useToast();

  // Получение цвета статуса записи
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-600";
      case "pending": return "text-yellow-600";
      case "completed": return "text-blue-600";
      case "cancelled": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  // Получение текста статуса записи
  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Подтверждена";
      case "pending": return "Ожидает подтверждения";
      case "completed": return "Завершена";
      case "cancelled": return "Отменена";
      default: return "Неизвестно";
    }
  };

  // Обработчик отмены записи
  const handleCancelBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: 'cancelled' });
    toast({
      title: "Запись отменена",
      description: "Ваша запись была отменена.",
    });
  };

  // Обработчик просмотра всех записей
  const handleViewBookings = () => {
    toast({
      title: "Все записи",
      description: "Показаны все ваши записи.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Мои записи ({bookings.length})
          </div>
          <Button size="sm" variant="outline" onClick={handleViewBookings}>
            Все записи
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.slice(0, 3).map((booking) => (
          <div key={booking.id} className="border border-border rounded-lg p-4">
            <div className="flex gap-4">
              {/* Изображение дизайна */}
              <img 
                src={booking.image} 
                alt={booking.design}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                {/* Информация о записи */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{booking.design}</h4>
                    <p className="text-sm text-muted-foreground">{booking.masterName}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(booking.status)}>
                    {getStatusText(booking.status)}
                  </Badge>
                </div>
                
                {/* Дата, цена и действия */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{booking.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{booking.price}</span>
                    {booking.status === 'pending' ? (
                      <Button size="sm" variant="destructive" onClick={() => handleCancelBooking(booking.id)}>
                        Отменить
                      </Button>
                    ) : booking.status === 'completed' ? (
                      <Button size="sm" variant="outline" onClick={() => onBookAgain(booking.id)}>
                        Снова
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <p className="text-center text-muted-foreground py-8">У вас пока нет записей</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsTab;
