import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Lightbulb,
  Target,
  History,
  Info,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  User,
  ChevronDown,
  TrendingUp,
  BookOpen,
  Palette
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  // إغلاق القائمة عند تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // منع التمرير عند فتح القائمة
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navItems: NavItem[] = [
    { href: "/home", label: "توليد الأفكار", icon: <Lightbulb className="w-4 h-4 flex-shrink-0" /> },
    { href: "/program-evaluation", label: "التقييم", icon: <Target className="w-4 h-4 flex-shrink-0" /> },
    { href: "/sustainability", label: "خبير الاستدامة", icon: <TrendingUp className="w-4 h-4 flex-shrink-0" /> },
    { href: "/research", label: "الدراسة البحثية", icon: <BookOpen className="w-4 h-4 flex-shrink-0" /> },
    { href: "/history", label: "السجل", icon: <History className="w-4 h-4 flex-shrink-0" /> },
    { href: "/about", label: "من نحن", icon: <Info className="w-4 h-4 flex-shrink-0" /> },
  ];

  const isActive = (href: string) => {
    if (href === "/home" && (location === "/" || location === "/home")) return true;
    return location === href;
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header className="border-b border-cyan-200/30 bg-gradient-to-r from-primary/95 via-primary/80 to-cyan-400/95 backdrop-blur-md sticky top-0 z-50 shadow-md shadow-cyan-400/15">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/methodology-choice">
              <div className="flex items-center gap-2 cursor-pointer group">
                <img 
                  src="/logo-masar.png" 
                  alt="مسار الابتكار" 
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform flex-shrink-0"
                />
                <span className="text-lg sm:text-xl font-bold text-white hidden xs:block">مسار الابتكار</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
                      isActive(item.href)
                        ? "bg-white/30 text-white shadow-sm"
                        : "text-white/80 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </Link>
              ))}
            </nav>

            {/* User Menu - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/organization-settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/20"
                >
                  <Building2 className="w-4 h-4" />
                  <span className="hidden xl:inline">إعدادات المؤسسة</span>
                </Button>
              </Link>

              <Link href="/color-settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/20"
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden xl:inline">تخصيص الألوان</span>
                </Button>
              </Link>

              {user?.role === "admin" && (
                <Link href="/admin/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/20"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden xl:inline">لوحة التحكم</span>
                  </Button>
                </Link>
              )}

              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline">خروج</span>
              </Button>
            </div>

            {/* Tablet Navigation (md-lg) */}
            <div className="hidden md:flex lg:hidden items-center gap-1">
              {navItems.slice(0, 3).map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-all text-xs font-medium ${
                      isActive(item.href)
                        ? "bg-white/30 text-white shadow-sm"
                        : "text-white/80 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                </Link>
              ))}
              
              {user && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 text-white text-xs">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="max-w-[60px] truncate">{user.name?.split(' ')[0] || 'مستخدم'}</span>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-lg text-white hover:bg-white/20 transition-colors active:scale-95"
              aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      <div
        className={`lg:hidden fixed top-14 sm:top-16 right-0 left-0 z-50 bg-gradient-to-b from-primary/98 via-primary/90 to-cyan-500/98 backdrop-blur-md shadow-xl transform transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "calc(100vh - 3.5rem)" }}
      >
        <div className="overflow-y-auto max-h-[calc(100vh-4rem)]">
          <nav className="flex flex-col p-4 gap-2">
            {/* Navigation Items */}
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 w-full px-4 py-4 rounded-xl transition-all text-base font-medium ${
                    isActive(item.href)
                      ? "bg-white/30 text-white shadow-md"
                      : "text-white/90 hover:bg-white/20 active:bg-white/30"
                  }`}
                >
                  <span className={`p-2 rounded-lg ${isActive(item.href) ? 'bg-white/20' : 'bg-white/10'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </Link>
            ))}

            {/* Organization Settings Link */}
            <Link href="/organization-settings">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 w-full px-4 py-4 rounded-xl transition-all text-base font-medium ${
                  location === "/organization-settings"
                    ? "bg-white/30 text-white shadow-md"
                    : "text-white/90 hover:bg-white/20 active:bg-white/30"
                }`}
              >
                <span className="p-2 rounded-lg bg-white/10">
                  <Building2 className="w-4 h-4" />
                </span>
                إعدادات المؤسسة
              </button>
            </Link>

            {/* Color Settings Link */}
            <Link href="/color-settings">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 w-full px-4 py-4 rounded-xl transition-all text-base font-medium ${
                  location === "/color-settings"
                    ? "bg-white/30 text-white shadow-md"
                    : "text-white/90 hover:bg-white/20 active:bg-white/30"
                }`}
              >
                <span className="p-2 rounded-lg bg-white/10">
                  <Palette className="w-4 h-4" />
                </span>
                تخصيص الألوان
              </button>
            </Link>

            {/* Admin Link */}
            {user?.role === "admin" && (
              <Link href="/admin">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 w-full px-4 py-4 rounded-xl transition-all text-base font-medium ${
                    location === "/admin"
                      ? "bg-white/30 text-white shadow-md"
                      : "text-white/90 hover:bg-white/20 active:bg-white/30"
                  }`}
                >
                  <span className="p-2 rounded-lg bg-white/10">
                    <Settings className="w-4 h-4" />
                  </span>
                  لوحة التحكم
                </button>
              </Link>
            )}

            {/* User Section */}
            <div className="border-t border-white/20 mt-3 pt-4">
              {user && (
                <div className="flex items-center gap-4 px-4 py-3 mb-2 rounded-xl bg-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.name || "مستخدم"}</p>
                    <p className="text-white/70 text-sm truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-white/90 hover:bg-red-500/20 active:bg-red-500/30 transition-all text-base font-medium"
              >
                <span className="p-2 rounded-lg bg-red-500/20">
                  <LogOut className="w-4 h-4 text-red-200" />
                </span>
                تسجيل الخروج
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
