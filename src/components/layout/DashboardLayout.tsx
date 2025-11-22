import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
  const SidebarLink = ({ item, mobile = false }: { item: any, mobile?: boolean }) => (
    <Link
      to={item.path}
      onClick={() => mobile && setIsMobileOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive(item.path)
          ? 'bg-primary/20 text-primary border border-primary/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-primary' : 'text-gray-500 group-hover:text-white'}`} />
      <span className="font-medium">{item.label}</span>
    </Link>
  )

  // Menu de Usuário (Três Pontos)
  const UserMenu = () => (
    <div className="p-4 border-t border-white/10 mt-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full flex items-center justify-between p-2 h-auto hover:bg-white/5 rounded-lg group">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-white/10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block overflow-hidden">
                <p className="text-sm font-medium text-white truncate w-28">{profile?.full_name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{profile?.role === 'professional' ? 'Profissional' : 'Aluno'}</p>
              </div>
            </div>
            <MoreVertical className="h-4 w-4 text-gray-500 group-hover:text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10 text-white backdrop-blur-xl">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem onClick={() => navigate('/app/profile')} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
            <User className="mr-2 h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/app/settings')} disabled className="cursor-pointer hover:bg-white/10 text-gray-500">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações (Breve)</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-400 cursor-pointer hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400">
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
      <aside className="hidden md:flex w-64 flex-col fixed h-full border-r border-white/10 bg-slate-950/50 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Dumbbell className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">CapiFit<span className="text-primary">.</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </nav>

        <UserMenu />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">CapiFit</span>
        </div>
        
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-slate-950 border-r border-white/10 p-0 flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <span className="text-xl font-bold text-white">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="text-gray-400">
                <X className="h-5 w-5" />
              </Button>
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

      {/* Main Content */}
      <main className="flex-1 md:pl-64 pt-16 md:pt-0 min-h-screen transition-all duration-300">
        <div className="animate-in fade-in zoom-in-95 duration-500 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout