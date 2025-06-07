
import { Upload, Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Компонент вкладки с загрузками пользователя
 * Отображает фото и видео, загруженные пользователем
 */
const UploadsTab = () => {
  const { uploads, removeUpload } = useUser();
  const { toast } = useToast();

  // Обработчик просмотра всех загрузок
  const handleViewUploads = () => {
    toast({
      title: "Мои загрузки",
      description: "Показаны все ваши загрузки.",
    });
  };

  // Обработчик удаления загрузки
  const handleDeleteUpload = (uploadId: string) => {
    removeUpload(uploadId);
    toast({
      title: "Загрузка удалена",
      description: "Контент удален из ваших загрузок.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Мои загрузки ({uploads.length})
          </div>
          <Button size="sm" variant="outline" onClick={handleViewUploads}>
            Все загрузки
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uploads.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {uploads.slice(0, 4).map((upload) => (
              <div key={upload.id} className="relative group">
                <div className="relative">
                  {/* Изображение/превью загрузки */}
                  <img 
                    src={upload.image} 
                    alt={upload.title}
                    className="w-full h-32 rounded-lg object-cover"
                  />
                  
                  {/* Иконка воспроизведения для видео */}
                  {upload.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  {/* Оверлей с кнопкой удаления */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteUpload(upload.id)}>
                      Удалить
                    </Button>
                  </div>
                </div>
                
                {/* Информация о загрузке */}
                <div className="mt-2">
                  <h4 className="font-medium text-sm">{upload.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{upload.date}</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{upload.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">У вас пока нет загрузок</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadsTab;
