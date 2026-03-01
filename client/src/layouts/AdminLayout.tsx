/**
 * Admin Dashboard Layout
 * 
 * Features:
 * - RTL-only layout (dir="rtl")
 * - Animated sidebar with Framer Motion
 * - Cairo font family
 * - Collapsible sidebar
 * - Responsive design
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import {
  LayoutDashboard,
  Library,
  Settings,
  Palette,
  BarChart3,
  Cpu,
  Menu,
  ChevronRight,
  ChevronLeft,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDashboardStore, useUserProfile } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Navigation items with section grouping (TailAdmin-style)
type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string }[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: 'القائمة الرئيسية',
    items: [
      { name: 'توليد الأفكار', href: '/admin/generate', icon: Sparkles },
      { name: 'لوحة التحكم', href: '/admin/dashboard', icon: LayoutDashboard, children: [{ name: 'نظرة عامة', href: '/admin/dashboard' }] },
      { name: 'مكتبة العروض', href: '/admin/decks', icon: Library },
      { name: 'النماذج الذكية', href: '/admin/models', icon: Cpu },
    ],
  },
  {
    title: 'الدعم',
    items: [
      { name: 'الاستخدام والحصة', href: '/admin/usage', icon: BarChart3 },
    ],
  },
  {
    title: 'أخرى',
    items: [
      { name: 'العلامة التجارية', href: '/admin/branding', icon: Palette },
      { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
    ],
  },
];

// Sidebar animation variants
const sidebarVariants = {
  expanded: { 
    width: 280,
    transition: { 
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    }
  },
  collapsed: { 
    width: 80,
    transition: { 
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    }
  },
};

// Menu item animation variants
const menuItemVariants = {
  expanded: { 
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 }
  },
  collapsed: { 
    opacity: 0,
    x: -10,
    transition: { duration: 0.15 }
  },
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarCollapsed = useDashboardStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  const userProfile = useUserProfile();
  const updateBranding = useDashboardStore((state) => state.updateBranding);
  const { data: branding } = trpc.adminDashboard.getBranding.useQuery();

  useEffect(() => {
    if (branding) {
      updateBranding({
        organizationLogo: branding.logoUrl ?? null,
        logoPlacement: (branding.logoPlacement as 'cover' | 'footer' | 'hidden') ?? 'cover',
        primaryColor: branding.primaryColor ?? null,
        secondaryColor: branding.secondaryColor ?? null,
        backgroundColor: branding.backgroundColor ?? null,
      });
      if (branding.primaryColor) {
        document.documentElement.style.setProperty('--primary', branding.primaryColor);
      }
    }
  }, [branding, updateBranding]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-800">
      {/* Logo Area — add your logo: set organizationLogo in branding, or replace /logo-masar.png in public/ */}
      <div className="flex min-h-[80px] shrink-0 items-center justify-between gap-4 px-5 py-5 border-b border-slate-700/50">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-w-0 flex-1 items-center gap-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 ring-1 ring-slate-600/50">
                {(userProfile?.organizationLogo || '/logo-masar.png') && (
                  <img
                    src={userProfile?.organizationLogo || '/logo-masar.png'}
                    alt="Logo"
                    className="h-9 w-9 object-contain"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      const fb = el.parentElement?.querySelector('.logo-fallback');
                      if (fb) (fb as HTMLElement).style.display = 'flex';
                    }}
                  />
                )}
                <div className="logo-fallback hidden h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="truncate font-bold text-lg text-white" style={{ fontFamily: 'Cairo, sans-serif' }}>
                مسار الابتكار
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 justify-center"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 ring-1 ring-slate-600/50">
                <img
                  src={userProfile?.organizationLogo || '/logo-masar.png'}
                  alt="Logo"
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const fb = el.parentElement?.querySelector('.logo-fallback');
                    if (fb) (fb as HTMLElement).style.display = 'flex';
                  }}
                />
                <div className="logo-fallback hidden h-8 w-8 items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden shrink-0 lg:flex text-slate-300 hover:text-white hover:bg-slate-700/50">
          {sidebarCollapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation with sections */}
      <nav className="flex-1 overflow-y-auto min-h-0 px-4 py-6">
        <div className="flex flex-col gap-8">
        {navSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            {!sidebarCollapsed && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 pb-1"
                style={{ fontFamily: 'Cairo, sans-serif' }}
              >
                {section.title}
              </motion.p>
            )}
            <div className="flex flex-col gap-1">
        {section.items.map((item) => {
          const isActive = location === item.href || item.children?.some((c) => location === c.href);
          const Icon = item.icon;
          
          return (
            <div key={item.name}>
              <Link href={item.href}>
                  <motion.div
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer',
                      isActive
                        ? 'bg-slate-700/80 text-white border-l-2 border-cyan-400'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    )}
                    style={{ fontFamily: 'Cairo, sans-serif' }}
                    whileHover={{ x: sidebarCollapsed ? 0 : -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-cyan-400' : '')} />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span variants={menuItemVariants} initial="collapsed" animate="expanded" exit="collapsed" className="flex-1">
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!sidebarCollapsed && item.children && item.children.length > 0 && (
                      <ChevronRight className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-cyan-400' : 'text-slate-500')} />
                    )}
                  </motion.div>
                </Link>
                {!sidebarCollapsed && item.children && item.children.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-4 mt-2 flex flex-col gap-1 border-l-2 border-slate-600 pl-2"
                  >
                    {item.children.map((child) => {
                      const isChildActive = location === child.href;
                      return (
                        <Link key={child.href} href={child.href}>
                          <div
                            className={cn(
                              'rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                              isChildActive ? 'bg-slate-700/60 text-cyan-300 border-l-2 border-cyan-400 -ml-[2px]' : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
                            )}
                            style={{ fontFamily: 'Cairo, sans-serif' }}
                          >
                            {child.name}
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
            </div>
          </div>
        ))}
        </div>
      </nav>

      {/* User Profile - Dark footer */}
      <div className="shrink-0 border-t border-slate-700/50 px-4 py-5">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <Avatar className="h-9 w-9 ring-2 ring-slate-600">
            <AvatarImage src={userProfile?.organizationLogo || undefined} />
            <AvatarFallback className="bg-cyan-500/20 text-cyan-300" style={{ fontFamily: 'Cairo, sans-serif' }}>
              {userProfile?.name?.charAt(0) || 'م'}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div variants={menuItemVariants} initial="collapsed" animate="expanded" exit="collapsed" className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate" style={{ fontFamily: 'Cairo, sans-serif' }}>{userProfile?.name || 'المستخدم'}</p>
                <p className="text-xs text-slate-400 truncate" style={{ fontFamily: 'Cairo, sans-serif' }}>{userProfile?.email || ''}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <Button variant="ghost" size="icon" className="flex-shrink-0 text-slate-400 hover:text-white hover:bg-slate-700/50">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard min-h-screen bg-background" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sticky top-0 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <span className="font-bold text-lg">لوحة التحكم</span>
        
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {userProfile?.name?.charAt(0) || 'م'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 z-50 shadow-xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                  <span className="font-bold text-lg">القائمة</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Animated Sidebar */}
        <motion.aside
          variants={sidebarVariants}
          initial="expanded"
          animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
          className="fixed inset-y-0 right-0 bg-slate-800 border-l border-slate-700/50 z-30 shadow-xl"
        >
          <SidebarContent />
        </motion.aside>

        {/* Main Content Area */}
        <motion.main
          className="flex-1 bg-gray-50 dark:bg-gray-100"
          initial={{ marginRight: 280 }}
          animate={{ marginRight: sidebarCollapsed ? 80 : 280 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="h-full p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </div>
        </motion.main>
      </div>

      {/* Mobile Main Content */}
      <main className="lg:hidden bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-4rem)]">
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;