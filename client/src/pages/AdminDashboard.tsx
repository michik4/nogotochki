
import { useState } from "react";
import { ArrowLeft, Users, Calendar, Palette, Upload, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { bookings, designs, uploads } = useUser();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    totalUsers: 245,
    totalMasters: 32,
    totalClients: 213,
    totalBookings: bookings.length,
    totalDesigns: designs.length,
    totalUploads: uploads.length,
    revenue: "₽245,000",
    activeBookings: bookings.filter(b => b.status === 'confirmed').length
  };

  const recentUsers = [
    { id: 1, name: "Анна Соколова", type: "master", email: "anna@example.com", joinDate: "2024-12-01" },
    { id: 2, name: "Мария Петрова", type: "client", email: "maria@example.com", joinDate: "2024-12-02" },
    { id: 3, name: "Елена Сидорова", type: "master", email: "elena@example.com", joinDate: "2024-12-03" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Панель администратора</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text">Админ панель</h1>
          <p className="text-muted-foreground">Управление платформой NailMasters</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="bookings">Записи</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Статистические карточки */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% за месяц
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активные записи</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% за неделю
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Доходы</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.revenue}</div>
                  <p className="text-xs text-muted-foreground">
                    +15% за месяц
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Дизайны</CardTitle>
                  <Palette className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDesigns}</div>
                  <p className="text-xs text-muted-foreground">
                    +5% за неделю
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Последние пользователи */}
            <Card>
              <CardHeader>
                <CardTitle>Недавние регистрации</CardTitle>
                <CardDescription>Новые пользователи за последние дни</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.type === 'master' ? 'default' : 'secondary'}>
                          {user.type === 'master' ? 'Мастер' : 'Клиент'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{user.joinDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>Список всех пользователей платформы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.totalMasters}</div>
                        <p className="text-sm text-muted-foreground">Мастера</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.totalClients}</div>
                        <p className="text-sm text-muted-foreground">Клиенты</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Button className="w-full">Просмотреть всех пользователей</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление записями</CardTitle>
                <CardDescription>Все записи на платформе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{booking.clientName || booking.masterName}</p>
                        <p className="text-sm text-muted-foreground">{booking.service}</p>
                        <p className="text-sm text-muted-foreground">{booking.date}</p>
                      </div>
                      <Badge 
                        variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          booking.status === 'completed' ? 'outline' : 'destructive'
                        }
                      >
                        {booking.status === 'confirmed' ? 'Подтверждена' :
                         booking.status === 'pending' ? 'Ожидание' :
                         booking.status === 'completed' ? 'Завершена' : 'Отменена'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Дизайны</CardTitle>
                  <CardDescription>Управление дизайнами мастеров</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{stats.totalDesigns}</div>
                  <p className="text-sm text-muted-foreground mb-4">Всего дизайнов</p>
                  <Button variant="outline" className="w-full">
                    <Palette className="w-4 h-4 mr-2" />
                    Управлять дизайнами
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Загрузки</CardTitle>
                  <CardDescription>Фото и видео пользователей</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{stats.totalUploads}</div>
                  <p className="text-sm text-muted-foreground mb-4">Всего файлов</p>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Управлять файлами
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
