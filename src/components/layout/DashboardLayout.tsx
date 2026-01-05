import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { supabase } from '@/integrations/supabase/client'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Utensils,
  BookOpen,
  MessageSquare,
  Menu,
  X,
  LogOut,
  User,
  MoreVertical,
  Settings,
  Calendar,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

const DashboardLayout: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSandbox, setIsSandbox] = useState(false)

  React.useEffect(() => {
    const checkSandbox = async () => {
      const { data } = await supabase.from('platform_settings').select('payment_mode').maybeSingle();
      if (data?.payment_mode === 'sandbox') setIsSandbox(true);
    };
    checkSandbox();
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  // Definição dos menus baseados na Role
  const getMenuItems = () => {
    const commonItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
      { label: 'Chat', icon: MessageSquare, path: '/app/chat' },
    ]

    if (profile?.role === 'professional') {
      return [
        ...commonItems,
        { label: 'Meus Alunos', icon: Users, path: '/app/clients' },
        { label: 'Planejador de Treinos', icon: Dumbbell, path: '/app/planner' },
        { label: 'Planejador de Dietas', icon: Utensils, path: '/app/meal-planner' },
        { label: 'Biblioteca de Exercícios', icon: BookOpen, path: '/app/library' },
        { label: 'Biblioteca de Alimentos', icon: Utensils, path: '/app/foods' },
        { label: 'Agenda Global', icon: Calendar, path: '/app/agenda/global' },
      ]
    }

    if (profile?.role === 'admin') {
      return [
        ...commonItems,
        { label: 'Meus Alunos', icon: Users, path: '/app/clients' },
        { label: 'Planejador de Treinos', icon: Dumbbell, path: '/app/planner' },
        { label: 'Planejador de Dietas', icon: Utensils, path: '/app/meal-planner' },
        { label: 'Biblioteca de Exercícios', icon: BookOpen, path: '/app/library' },
        { label: 'Biblioteca de Alimentos', icon: Utensils, path: '/app/foods' },
        { label: 'Agenda Global', icon: Calendar, path: '/app/agenda/global' },
        { label: 'Gestão de Usuários', icon: ShieldCheck, path: '/app/admin/users' },
      ]
    }

    if (profile?.role === 'client') {
      return [
        ...commonItems,
        { label: 'Meu Treino', icon: Dumbbell, path: '/app/my-workout' },
        { label: 'Minha Dieta', icon: Utensils, path: '/app/my-meal-plan' },
        { label: 'Meus Profissionais', icon: Users, path: '/app/my-professionals' },
        { label: 'Encontrar Profissionais', icon: Search, path: '/app/marketplace' },
        { label: 'Agenda', icon: Calendar, path: '/app/agenda' },
      ]
    }

    return commonItems
  }

  const menuItems = getMenuItems()

  const isActive = (path: string) => location.pathname === path

  // Componente de Link da Sidebar
  const SidebarLink = ({ item, mobile = false }: { item: any, mobile?: boolean }) => {
    const { totalUnreadCount } = useChat()
    const isChat = item.path === '/app/chat'

    return (
      <Link
        to={item.path}
        onClick={() => mobile && setIsMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive(item.path)
          ? 'bg-primary/20 text-primary border border-primary/20'
          : 'text-gray-400 hover:text-foreground hover:bg-accent'
          }`}
      >
        <div className="relative">
          <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-primary' : 'text-gray-500 group-hover:text-foreground'}`} />
          {isChat && totalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </span>
          )}
        </div>

        {!isSidebarCollapsed && <span className="font-medium animate-in fade-in duration-300">{item.label}</span>}
      </Link >
    )
  }

  // Menu de Usuário (Três Pontos)
  const UserMenu = () => (
    <div className="p-4 border-t border-border mt-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={`w-full flex items-center justify-between p-2 h-auto hover:bg-accent rounded-lg group ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isSidebarCollapsed && (
                <div className="text-left overflow-hidden animate-in fade-in duration-300">
                  <p className="text-sm font-medium text-foreground truncate w-28">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'professional' ? 'Profissional' : 'Aluno'}
                  </p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && <MoreVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground backdrop-blur-xl">
          <div className="flex items-center justify-between px-2 py-1.5 text-sm font-semibold">
            <span>Tema</span>
            <ModeToggle />
          </div>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={() => navigate('/app/profile')} className="cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground">
            <User className="mr-2 h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/app/settings')} className="cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex flex-col fixed h-full border-r border-border bg-card/50 backdrop-blur-xl z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center p-4' : 'justify-between'}`}>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isSidebarCollapsed && <span className="text-xl font-bold text-foreground tracking-tight animate-in fade-in duration-300">CapiFit<span className="text-primary">.</span></span>}
          </div>

        </div>

        {/* Toggle Button Positioned relatively or absolutely */}
        <div className="w-full flex justify-end px-2 mb-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-6 w-6 text-muted-foreground hover:text-foreground hidden md:flex">
            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </nav>

        <UserMenu />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full h-16 border-b border-border bg-card/80 backdrop-blur-xl z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">CapiFit</span>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card border-r border-border p-0 flex flex-col">
              <div className="p-6 flex items-center justify-between border-b border-border">
                <span className="text-xl font-bold text-foreground">Menu</span>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                  <SidebarLink key={item.path} item={item} mobile />
                ))}
              </nav>
              <UserMenu />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className={`flex-1 pt-16 md:pt-0 min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        {isSandbox && (
          <div className="w-full bg-yellow-400/20 border-b border-yellow-500/30 text-yellow-700 dark:text-yellow-400 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            AMBIENTE DE TESTES (SANDBOX ATIVO) - NENHUMA COBRANÇA REAL SERÁ FEITA
          </div>
        )}
        <div className="animate-in fade-in zoom-in-95 duration-500 h-full">
          <div className="hidden md:flex justify-end p-4 absolute top-0 right-0 z-10 gap-2">
            {/* ModeToggle moved to sidebar */}
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout