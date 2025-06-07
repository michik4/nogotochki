
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Design } from "@/contexts/UserContext";

interface DesignSelectorProps {
  designs: Design[];
  selectedDesign: string;
  onDesignSelect: (designId: string) => void;
}

/**
 * Компонент для выбора дизайна из списка доступных
 * Используется в модальном окне создания записи мастером
 */
const DesignSelector = ({
  designs,
  selectedDesign,
  onDesignSelect
}: DesignSelectorProps) => {
  return (
    <div>
      <Label className="text-base font-semibold">Выберите дизайн *</Label>
      <Select value={selectedDesign} onValueChange={onDesignSelect}>
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Выберите дизайн" />
        </SelectTrigger>
        <SelectContent>
          {designs.map((design) => (
            <SelectItem key={design.id} value={design.id}>
              <div className="flex items-center gap-2">
                <img 
                  src={design.image} 
                  alt={design.title} 
                  className="w-8 h-8 rounded object-cover" 
                />
                <div>
                  <div className="font-medium">{design.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {design.price} • {design.duration}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DesignSelector;
