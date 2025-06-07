
import { useState } from "react";
import { ArrowLeft, Edit, Settings, Calendar, Star, Plus, Users, TrendingUp, Clock, DollarSign, Upload, Heart, Play, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useUser, Master } from "@/contexts/UserContext";
import EditProfileModal from "@/components/EditProfileModal";
import { toast } from "sonner";

const MasterDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, bookings, designs, updateBooking, addDesign, updateDesign, removeDesign } = useUser();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  // Проверяем, что пользователь - мастер
  if (!currentUser || currentUser.type !== 'master') {
    navigate('/auth');
    return null;
  }

  const master = currentUser as Master;

  // Получаем записи для текущего мастера
  const masterBookings = bookings.filter(booking => booking.masterName === master.name);
  
  // Получаем дизайны мастера
  const masterDesigns = designs.filter(design => design.masterName === master.name);

  // Статистика
  const todayBookings = masterBookings.filter(booking => {
    const today = new Date().toLocaleDateString('ru-RU');
    return booking.date.includes(today.split('.')[0]); // Простая проверка по дню
  });

  const pendingBookings = masterBookings.filter(booking => booking.status === 'pending');
  const completedBookings = masterBookings.filter(booking => booking.status === 'completed');

  const stats = {
    todayEarnings: todayBookings.reduce((sum, booking) => {
      return sum + parseInt(booking.price.replace(/\D/g, ''));
    }, 0) + '₽',
    monthlyEarnings: masterBookings.reduce((sum, booking) => {
      return sum + parseInt(booking.price.replace(/\D/g, ''));
    }, 0) + '₽',
    todayClients: todayBookings.length,
    monthlyClients: masterBookings.length,
    averageRating: master.rating,
    completedBookings: completedBookings.length,
    pendingRequests: pendingBookings.length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-600";
      case "pending": return "text-yellow-600";
      case "completed": return "text-blue-600";
      case "cancelled": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Подтверждена";
      case "pending": return "Ожидает подтверждения";
      case "completed": return "Завершена";
      case "cancelled": return "Отменена";
      default: return "Неизвестно";
    }
  };

  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  const handleConfirmBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: 'confirmed' });
    toast.success("Запись подтверждена!");
  };

  const handleRejectBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: 'cancelled' });
    toast.success("Запись отклонена");
  };

  const handleCompleteBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: 'completed' });
    toast.success("Запись отмечена как завершенная!");
  };

  const handleSuggestTime = (bookingId: string) => {
    // В реальном приложении здесь было бы модальное окно для выбора времени
    toast.info("Функция предложения другого времени в разработке");
  };

  const handleUploadDesign = () => {
    // Создаем новый дизайн для демонстрации
    const newDesign = {
      id: Date.now().toString(),
      title: "Новый дизайн",
      image: "/placeholder.svg",
      category: "Базовый",
      price: "2000₽",
      duration: "90 мин",
      likes: 0,
      bookings: 0,
      active: true,
      masterName: master.name
    };
    addDesign(newDesign);
    toast.success("Дизайн добавлен! Отредактируйте его детали.");
  };

  const handleToggleDesign = (designId: string) => {
    const design = masterDesigns.find(d => d.id === designId);
    if (design) {
      updateDesign(designId, { active: !design.active });
      toast.success(design.active ? "Дизайн деактивирован" : "Дизайн активирован");
    }
  };

  const handleEditDesign = (designId: string) => {
    toast.info("Функция редактирования дизайна в разработке");
  };

  const handleViewSchedule = () => {
    toast.info("Функция просмотра расписания в разработке");
  };

  const handleViewAnalytics = () => {
    toast.info("Функция аналитики в разработке");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Кабинет мастера</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleEditProfile}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="max-w-md lg:max-w-6xl mx-auto lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
          {/* Master Profile Card */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="relative h-20 gradient-bg"></div>
              <CardContent className="relative p-6 -mt-10">
                <div className="flex items-end gap-4 mb-4">
                  <Avatar className="w-20 h-20 border-4 border-background">
                    <AvatarImage src={master.avatar} />
                    <AvatarFallback className="text-xl">{master.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 pb-2">
                    <h2 className="text-xl font-bold mb-1">{master.name}</h2>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{master.rating}</span>
                      <span className="text-muted-foreground text-sm">({master.reviewsCount} отзывов)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{master.location}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{masterDesigns.length}</p>
                    <p className="text-xs text-muted-foreground">Дизайнов</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{master.uploadsCount}</p>
                    <p className="text-xs text-muted-foreground">Загрузок</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {master.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mb-2" onClick={handleEditProfile}>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать профиль
                </Button>
                
                <Button variant="outline" className="w-full" onClick={handleUploadDesign}>
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить дизайн
                </Button>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.todayEarnings}</p>
                  <p className="text-xs text-muted-foreground">Сегодня</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.todayClients}</p>
                  <p className="text-xs text-muted-foreground">Клиентов сегодня</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.monthlyEarnings}</p>
                  <p className="text-xs text-muted-foreground">За месяц</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center relative">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                  <p className="text-xs text-muted-foreground">Ожидает ответа</p>
                  {stats.pendingRequests > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Today's Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Мои записи ({masterBookings.length})
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {masterBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">У вас пока нет записей</p>
                ) : (
                  masterBookings.map((booking) => (
                    <div key={booking.id} className={`border rounded-lg p-4 ${booking.status === 'pending' ? 'border-yellow-500 bg-yellow-50/10' : 'border-border'}`}>
                      <div className="flex gap-4">
                        <img 
                          src={booking.image} 
                          alt={booking.design}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{booking.clientName}</h4>
                              <p className="text-sm text-muted-foreground">{booking.design}</p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{booking.date}</span>
                              {booking.time && (
                                <>
                                  <Clock className="w-3 h-3 ml-2" />
                                  <span>{booking.time}</span>
                                </>
                              )}
                            </div>
                            <span className="font-semibold text-primary">{booking.price}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => handleConfirmBooking(booking.id)}>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Подтвердить
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleSuggestTime(booking.id)}>
                                  <Clock className="w-4 h-4 mr-1" />
                                  Другое время
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectBooking(booking.id)}>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Отклонить
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button size="sm" onClick={() => handleCompleteBooking(booking.id)}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Завершить
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* My Designs Catalog */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Мой каталог дизайнов ({masterDesigns.length})
                  <Button size="sm" variant="outline" onClick={handleUploadDesign}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {masterDesigns.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">У вас пока нет дизайнов</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {masterDesigns.map((design) => (
                      <div key={design.id} className="border border-border rounded-lg overflow-hidden">
                        <img 
                          src={design.image} 
                          alt={design.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{design.title}</h4>
                              <p className="text-sm text-muted-foreground">{design.category}</p>
                            </div>
                            <Badge variant={design.active ? "default" : "secondary"}>
                              {design.active ? "Активен" : "Неактивен"}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between text-sm mb-3">
                            <span className="font-semibold text-primary">{design.price}</span>
                            <span className="text-muted-foreground">{design.duration}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{design.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{design.bookings || 0} записей</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditDesign(design.id)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={design.active ? "secondary" : "default"}
                              onClick={() => handleToggleDesign(design.id)}
                              className="flex-1"
                            >
                              {design.active ? "Деактивировать" : "Активировать"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-16" onClick={handleViewSchedule}>
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">Расписание</span>
                </div>
              </Button>
              
              <Button variant="outline" className="h-16" onClick={handleViewAnalytics}>
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">Аналитика</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};

export default MasterDashboard;
