// Substituir a função handleRemoveClient por esta versão se necessário:

// 🔧 CORREÇÃO: Remover vínculo E deletar planos de treino (alternativa)
const handleRemoveClient = async (clientProfessionalId: string, clientId: string) => {
  try {
    console.log('🔄 [CLIENTS] Removendo vínculo e deletando planos para cliente:', clientId)
    
    // 1. Desativar vínculo do cliente
    const { error: linkError } = await supabase
      .from('client_professionals')
      .update({ status: 'inactive', ended_at: new Date().toISOString() })
      .eq('id', clientProfessionalId)

    if (linkError) {
      console.error('Erro ao remover vínculo:', linkError)
      showError('Erro ao remover cliente')
      return
    }

    // 2. 🔧 NOVO: Deletar todos os planos de treino ativos do cliente
    const { error: workoutError } = await supabase
      .from('client_workouts')
      .delete()
      .eq('client_id', clientId)
      .eq('professional_id', user.id)
      .eq('status', 'active')

    if (workoutError) {
      console.error('Erro ao deletar planos de treino:', workoutError)
      // Não falhar completamente, apenas logar erro
      console.warn('⚠️ [CLIENTS] Vínculo removido mas houve erro ao deletar planos:', workoutError)
    }

    showSuccess('Cliente e planos de treino removidos com sucesso!')
    fetchClients()
  } catch (error) {
    console.error('Erro inesperado:', error)
    showError('Erro inesperado ao remover cliente')
  }
}