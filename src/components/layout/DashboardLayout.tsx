import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
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
  Settings
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

    if (profile?.role === 'professional' || profile?.role === 'admin') {
      return [
        ...commonItems,
        { label: 'Meus Alunos', icon: Users, path: '/app/clients' },
        { label: 'Planejador de Treinos', icon: Dumbbell, path: '/app/planner' },
        { label: 'Planejador de Dietas', icon: Utensils, path: '/app/meal-planner' },
        { label: 'Biblioteca de Exercícios', icon: BookOpen, path: '/app/library' },
        { label: 'Biblioteca de Alimentos', icon: Utensils, path: '/app/foods' },
      ]
    }

    if (profile?.role === 'client') {
      return [
        ...commonItems,
        { label: 'Meu Treino', icon: Dumbbell, path: '/app/my-workout' },
        { label: 'Minha Dieta', icon: Utensils, path: '/app/my-meal-plan' },
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
        <span className="font-medium">{item.label}</span>
      </Link>
    )
  }

  // Menu de Usuário (Três Pontos)
  const UserMenu = () => (
    <div className="p-4 border-t border-border mt-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full flex items-center justify-between p-2 h-auto hover:bg-accent rounded-lg group">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate w-28">{profile?.full_name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{profile?.role === 'professional' ? 'Profissional' : 'Aluno'}</p>
              </div>
            </div>
            <MoreVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground backdrop-blur-xl">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={() => navigate('/app/profile')} className="cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground">
            <User className="mr-2 h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/app/settings')} disabled className="cursor-pointer hover:bg-accent text-muted-foreground">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações (Breve)</span>
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
      <aside className="hidden md:flex w-64 flex-col fixed h-full border-r border-border bg-card/50 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">CapiFit<span className="text-primary">.</span></span>
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
      <main className="flex-1 md:pl-64 pt-16 md:pt-0 min-h-screen transition-all duration-300">
        <div className="animate-in fade-in zoom-in-95 duration-500 h-full">
          <div className="hidden md:flex justify-end p-4 absolute top-0 right-0 z-10">
            <ModeToggle />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout