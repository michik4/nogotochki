
import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import DateTimeSelector from "./booking/DateTimeSelector";
import ClientInfoForm, { ClientInfo } from "./booking/ClientInfoForm";
import DesignSelector from "./booking/DesignSelector";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно для создания новой записи мастером
 * Позволяет мастеру создавать записи для своих клиентов
 */
const CreateBookingModal = ({ isOpen, onClose }: CreateBookingModalProps) => {
  const { currentUser, designs, addBooking } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDesign, setSelectedDesign] = useState("");
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    phone: "",
    notes: ""
  });

  // Получаем дизайны текущего мастера
  const masterDesigns = designs.filter(design => 
    design.masterName === currentUser?.name && design.active
  );

  const handleCreateBooking = () => {
    if (!selectedDate || !selectedTime || !selectedDesign || !clientInfo.name || !clientInfo.phone) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const design = masterDesigns.find(d => d.id === selectedDesign);
    if (!design) {
      toast.error("Выбранный дизайн не найден");
      return;
    }

    const newBooking = {
      id: Date.now().toString(),
      clientName: clientInfo.name,
      masterName: currentUser?.name || "",
      service: "Маникюр + гель-лак",
      design: design.title,
      date: selectedDate.toLocaleDateString('ru-RU'),
      time: selectedTime,
      price: design.price || "2500₽",
      status: "confirmed" as const,
      image: design.image
    };

    addBooking(newBooking);
    toast.success("Запись успешно создана!");
    
    // Сброс формы
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedDesign("");
    setClientInfo({ name: "", phone: "", notes: "" });
  };

  const handleClientInfoChange = (updates: Partial<ClientInfo>) => {
    setClientInfo(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать новую запись</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Client Information */}
          <ClientInfoForm
            clientInfo={clientInfo}
            onClientInfoChange={handleClientInfoChange}
          />

          {/* Design Selection */}
          <DesignSelector
            designs={masterDesigns}
            selectedDesign={selectedDesign}
            onDesignSelect={setSelectedDesign}
          />

          {/* Date and Time Selection */}
          <DateTimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleCreateBooking} className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Создать запись
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookingModal;
