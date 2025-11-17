// ESTE COMPONENTE NÃO SERÁ MAIS USADO
// A lógica de redirecionamento foi movida para o App.tsx

import React from 'react'
import { Loader2 } from 'lucide-react'

const AppIndex: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}

export default AppIndex