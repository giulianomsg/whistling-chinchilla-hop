import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Calendar, 
  BookOpen, 
  Dumbbell, 
  LogOut,
  Menu,
  Apple,
  Utensils,
  LayoutDashboard,
  Home,
  MessageSquare
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { showSuccess } from '@/utils/toast'

interface MenuItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: ('admin' | 'professional' | 'client')[]
}

const DashboardLayout: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const menuItems: MenuItem[] = [
    {
      title: 'Início',
      href: '/app/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ['admin', 'professional', 'client']
    },
    {
      title: 'Mensagens',
      href: '/app/chat',
      icon: <MessageSquare className="h-5 w-5" />,
      roles: ['professional', 'client']
    },
    {
      title: 'Meusos Clientes',
      href: '/app/clients',
      icon: <Users className="h-5 w-5" />,
      roles: ['admin', 'professional']
    },
    {
      title: 'Planos de Treino',
      href: '/app/planner',
      icon: <Calendar className="h-5 w-5" />,
      roles: ['admin', 'professional']
    },
    {
      title: 'Planos Alimentares',
      href: '/app/meal-planner',
      icon: <Utensils className="h-5 w-5" />,
      roles: ['admin', 'professional']
    },
    {
      title: 'Biblioteca de Exercícios',
      href: '/app/library',
      icon: <BookOpen className="h-5 w-5" />,
      roles: ['admin', 'professional']
    },
    {
      title: 'Biblioteca de Alimentos',
      href: '/app/foods',
      icon: <Apple className="h-5 w-5" />,
      roles: ['admin', 'professional']
    },
    {
      title: 'Meu Treino',
      href: '/app/my-workout',
      icon: <Dumbbell className="h-5 w-5" />,
      roles: ['client']
    },
    {
      title: 'Meu Plano Alimentar',
      href: '/app/meal-plan',
      icon: <Utensils className="h-5 w-5" />,
      roles: ['client']
    }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    profile?.role && item.roles.includes(profile.role as any)
  )

  const handleLogout = async () => {
    await signOut()
    showSuccess('Logout realizado com sucesso!')
    // Forçar reload para limpar estados
    window.location.href = '/auth'
  }

  const getUserInitials = () => {
    // ✅ PROTEÇÃO CONTRA NULL
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    // Fallback para email
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getDisplayName = () => {
    // ✅ PROTEÇÃO CONTRA NULL
    return profile?.full_name || 'Usuário'
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : 'w-64'} bg-white border-r`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">CapiFit</h2>
            <p className="text-xs text-gray-500 capitalize">{profile?.role || 'carregando...'}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getDisplayName()}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'carregando...'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-600 rounded">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">CapiFit</span>
            </div>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout