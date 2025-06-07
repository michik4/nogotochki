
import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import DateTimeSelector from "./booking/DateTimeSelector";
import ClientInfoForm, { ClientInfo } from "./booking/ClientInfoForm";
import DesignInfo from "./booking/DesignInfo";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: {
    id: string;
    title: string;
    image: string;
    category: string;
    difficulty?: string;
    price: string;
    duration: string;
    masterName: string;
    masterAvatar?: string;
    masterRating?: number;
  } | null;
}

/**
 * Модальное окно для записи клиента к мастеру
 * Позволяет клиентам создавать запросы на бронирование
 */
const BookingModal = ({ isOpen, onClose, design }: BookingModalProps) => {
  const { addBooking } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !clientInfo.name || !clientInfo.phone || !design) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const newBooking = {
      id: Date.now().toString(),
      clientName: clientInfo.name,
      masterName: design.masterName,
      service: "Маникюр + гель-лак",
      design: design.title,
      date: selectedDate.toLocaleDateString('ru-RU'),
      time: selectedTime,
      price: design.price,
      status: "pending" as const,
      image: design.image,
      needsResponse: true,
      requestTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    addBooking(newBooking);
    toast.success("Запись успешно создана! Мастер свяжется с вами для подтверждения.");
    
    // Сброс формы
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setClientInfo({ name: "", phone: "", email: "", notes: "" });
  };

  const handleClientInfoChange = (updates: Partial<ClientInfo>) => {
    setClientInfo(prev => ({ ...prev, ...updates }));
  };

  if (!design) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Записаться на маникюр</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Design Info */}
          <DesignInfo design={design} />

          <Separator />

          {/* Date and Time Selection */}
          <DateTimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
            disableWeekends={true}
          />

          <Separator />

          {/* Client Information */}
          <ClientInfoForm
            clientInfo={clientInfo}
            onClientInfoChange={handleClientInfoChange}
            showEmail={true}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleBooking} className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Записаться
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
