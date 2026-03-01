import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, Lock, LogIn, Loader2, Eye, EyeOff, Lightbulb, BarChart3, MessageSquare, Zap, UserPlus } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import Background3D from '@/components/Background3D';

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loading: isLoading, refresh } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [associationName, setAssociationName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      setLocation('/admin/dashboard');
    }
  }, [user, isLoading, setLocation]);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginMutation.mutateAsync({ email, password });
      toast.success('تم تسجيل الدخول بنجاح');
      await refresh();
      setLocation('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'فشل تسجيل الدخول');
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || !password || !confirmPassword || !associationName || !phoneNumber) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerMutation.mutateAsync({ email, name, password, associationName, phoneNumber });
      toast.success(result.message || 'تم إنشاء الحساب بنجاح. يرجى انتظار موافقة المدير.');
      setIsLoginMode(true);
      setEmail('');
      setPassword('');
      setName('');
      setConfirmPassword('');
      setAssociationName('');
      setPhoneNumber('');
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Background3D />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Lightbulb,
      title: 'توليد الأفكار',
      description: 'استخدم الذكاء الاصطناعي لتوليد أفكار مبتكرة للبرامج والمبادرات',
      color: 'from-primary to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'التقييم الشامل',
      description: 'قيّم برامجك وفق منهجيات عالمية معترف بها',
      color: 'from-emerald-400 to-green-500'
    },
    {
      icon: MessageSquare,
      title: 'المحادثة التفاعلية',
      description: 'تفاعل مع الذكاء الاصطناعي لتطوير أفكارك بشكل مستمر',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Zap,
      title: 'تحليل متقدم',
      description: 'احصل على تحليلات عميقة ونقاط قوة وضعف لبرامجك',
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* خلفية 3D متحركة */}
      <Background3D />
      
      {/* Header */}
      <header className="border-b border-primary/20 bg-gradient-to-r from-primary/80 via-primary/70 to-cyan-400/80 backdrop-blur-md sticky top-0 z-50 shadow-md shadow-primary/15">
        <div className="container flex items-center justify-center h-14 md:h-16 px-3 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <img 
              src="/logo-masar.png" 
              alt="مسار الابتكار" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
            <h1 className="text-base md:text-xl font-bold text-white">مسار الابتكار</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 md:py-12 lg:py-16 gradient-subtle">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-8">
            {/* إطار زجاجي يجمع العناصر */}
            <div className="inline-block px-6 md:px-8 py-3 md:py-4 mb-6 md:mb-8 rounded-2xl backdrop-blur-md bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 shadow-lg animate-scale-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600 mb-2">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 animate-pulse-soft text-primary" />
                مدعوم بالذكاء الاصطناعي
              </div>
              <p className="text-base md:text-lg lg:text-xl font-semibold text-primary">
                منصة ذكية لتطوير وتقييم برامجك
              </p>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              مرحباً بك في
              <span className="text-primary"> مسار الابتكار</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed px-2 animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              سجل دخولك للوصول إلى أدوات تطوير البرامج والمبادرات المتكاملة
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Features Section */}
              <div className="hidden lg:flex flex-col gap-6 animate-slide-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    مميزات المنصة
                  </h3>
                  <p className="text-muted-foreground">
                    أدوات متكاملة لتطوير وتقييم برامجك والمبادرات الاجتماعية
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card
                        key={index}
                        className="shadow-lg border-0 glass glass-card-enhanced transition-all duration-300 hover:scale-105"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-sm">
                                {feature.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Card className="shadow-lg border-0 glass">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">500+</div>
                      <div className="text-xs text-muted-foreground">فكرة مولدة</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg border-0 glass">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">1000+</div>
                      <div className="text-xs text-muted-foreground">مستخدم نشط</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg border-0 glass">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">98%</div>
                      <div className="text-xs text-muted-foreground">رضا المستخدمين</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Login Form */}
              <div className="w-full max-w-md mx-auto lg:mx-0 animate-slide-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                <Card className="shadow-lg border-0 glass glass-card-enhanced">
                  <CardHeader className="space-y-2 text-center p-6">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب'}</CardTitle>
                    <CardDescription>
                      {isLoginMode ? 'سجل الدخول إلى حسابك' : 'أنشئ حساباً جديداً للبدء'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 p-6 pt-0">
                    {isLoginMode ? (
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">
                            البريد الإلكتروني
                          </Label>
                          <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="example@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pr-10 h-11"
                              dir="ltr"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium">
                            كلمة المرور
                          </Label>
                          <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pr-10 pl-10 h-11"
                              dir="ltr"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 text-base gradient-primary border-0"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري تسجيل الدخول...
                            </>
                          ) : (
                            <>
                              <LogIn className="ml-2 h-4 w-4" />
                              تسجيل الدخول
                            </>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            الاسم الكامل
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="أدخل اسمك الكامل"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11"
                            dir="rtl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="association-name" className="text-sm font-medium">
                            اسم الجمعية
                          </Label>
                          <Input
                            id="association-name"
                            type="text"
                            placeholder="أدخل اسم الجمعية"
                            value={associationName}
                            onChange={(e) => setAssociationName(e.target.value)}
                            className="h-11"
                            dir="rtl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone-number" className="text-sm font-medium">
                            رقم التواصل
                          </Label>
                          <Input
                            id="phone-number"
                            type="tel"
                            placeholder="05xxxxxxxx"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="h-11"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-sm font-medium">
                            البريد الإلكتروني
                          </Label>
                          <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="example@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pr-10 h-11"
                              dir="ltr"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-password" className="text-sm font-medium">
                            كلمة المرور
                          </Label>
                          <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="register-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pr-10 pl-10 h-11"
                              dir="ltr"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password" className="text-sm font-medium">
                            تأكيد كلمة المرور
                          </Label>
                          <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pr-10 pl-10 h-11"
                              dir="ltr"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 text-base gradient-primary border-0"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري إنشاء الحساب...
                            </>
                          ) : (
                            <>
                              <UserPlus className="ml-2 h-4 w-4" />
                              إنشاء حساب
                            </>
                          )}
                        </Button>
                      </form>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">أو</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11"
                      onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setEmail('');
                        setPassword('');
                        setName('');
                        setConfirmPassword('');
                      }}
                    >
                      {isLoginMode ? (
                        <>
                          <UserPlus className="ml-2 h-4 w-4" />
                          إنشاء حساب جديد
                        </>
                      ) : (
                        <>
                          <LogIn className="ml-2 h-4 w-4" />
                          لدي حساب بالفعل
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
