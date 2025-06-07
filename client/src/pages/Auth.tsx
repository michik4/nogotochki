
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useUser, Client, Master } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'client' | 'master'>('client');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Создание пользователя на основе выбранного типа
    const baseUser = {
      id: Date.now().toString(),
      name: formData.name || "Тестовый пользователь",
      email: formData.email,
      phone: formData.phone,
      avatar: "/placeholder.svg",
      location: "Москва",
      joinDate: "Январь 2024"
    };

    let user: Client | Master;

    if (userType === 'client') {
      user = {
        ...baseUser,
        type: 'client',
        totalBookings: 12,
        favoriteCount: 5,
        uploadsCount: 3
      };
      navigate("/profile");
    } else {
      user = {
        ...baseUser,
        type: 'master',
        rating: 4.9,
        reviewsCount: 127,
        experience: "5 лет",
        specialties: ["Гель-лак", "Дизайн", "Френч"],
        canDoDesigns: 15,
        uploadsCount: 8
      };
      navigate("/master-dashboard");
    }

    setCurrentUser(user);
    
    toast({
      title: "Добро пожаловать!",
      description: `Вы успешно ${isLogin ? 'вошли' : 'зарегистрировались'} как ${userType === 'client' ? 'клиент' : 'мастер'}.`,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">{isLogin ? "Вход" : "Регистрация"}</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-md mx-auto p-6">
        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">NailMasters</CardTitle>
            <CardDescription>
              {isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label>Тип аккаунта</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={userType === 'client' ? 'default' : 'outline'}
                        onClick={() => setUserType('client')}
                        className="w-full"
                      >
                        Клиент
                      </Button>
                      <Button
                        type="button"
                        variant={userType === 'master' ? 'default' : 'outline'}
                        onClick={() => setUserType('master')}
                        className="w-full"
                      >
                        Мастер
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      placeholder="Введите ваше имя"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Введите email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (999) 999-99-99"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full gradient-bg text-white">
                {isLogin ? "Войти" : "Зарегистрироваться"}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                  <Button
                    variant="link"
                    className="p-0 ml-1 h-auto font-medium text-primary"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Зарегистрироваться" : "Войти"}
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
