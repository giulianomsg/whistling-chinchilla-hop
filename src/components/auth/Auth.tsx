import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, User, Phone, Calendar, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { showSuccess, showError } from '@/utils/toast'
import { Switch } from "@/components/ui/switch"

export const Auth: React.FC = () => {
  const { signIn, signUp } = useAuth()

  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Estados para Cadastro
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupFullName, setSignupFullName] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupDOB, setSignupDOB] = useState('')
  const [signupCPF, setSignupCPF] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)
  const [isProfessional, setIsProfessional] = useState(false)

  // Estados de feedback
  const [loginError, setLoginError] = useState('')
  const [signupError, setSignupError] = useState('')

  // Função de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    try {
      const { error } = await signIn(loginEmail, loginPassword)

      if (error) {
        setLoginError(error.message)
        showError('Erro no login: ' + error.message)
      } else {
        showSuccess('Login realizado com sucesso!')
        // Redirecionamento será feito automaticamente pelo listener
      }
    } catch (error) {
      const errorMessage = 'Erro inesperado ao fazer login'
      setLoginError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoginLoading(false)
    }
  }

  // Função de Cadastro
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupLoading(true)
    setSignupError('')

    // Validações básicas
    if (!signupFullName.trim()) {
      setSignupError('Por favor, informe seu nome completo')
      setSignupLoading(false)
      return
    }

    if (signupPassword.length < 6) {
      setSignupError('A senha deve ter pelo menos 6 caracteres')
      setSignupLoading(false)
      return
    }


    // Validação de Idade para Profissionais
    if (isProfessional && signupDOB) {
      const birthDate = new Date(signupDOB);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setSignupError('Profissionais devem ser maiores de 18 anos.');
        setSignupLoading(false);
        return;
      }
    }

    try {
      const role = isProfessional ? 'professional' : 'client'
      const { error } = await signUp(signupEmail, signupPassword, signupFullName, role, {
        phone: signupPhone,
        data_nascimento: signupDOB,
        cpf: signupCPF
      })

      if (error) {
        setSignupError(error.message)
        showError('Erro no cadastro: ' + error.message)
      } else {
        showSuccess('Cadastro realizado! Verifique seu email para confirmar.')
        // Limpar formulário
        setSignupEmail('')
        setSignupPassword('')
        setSignupFullName('')
        // Redirecionamento será feito automaticamente pelo listener após confirmação
      }
    } catch (error) {
      const errorMessage = 'Erro inesperado ao fazer cadastro'
      setSignupError(errorMessage)
      showError(errorMessage)
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Bem-vindo ao CapiFit
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sua plataforma de fitness e nutrição
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acessar sua conta</CardTitle>
            <CardDescription>
              Faça login ou crie sua conta para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              {/* Tab de Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loginLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loginLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Tab de Cadastro */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupError && (
                    <Alert variant="destructive">
                      <AlertDescription>{signupError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="João Silva"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        className="pl-10"
                        required
                        disabled={signupLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Celular / WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          className="pl-10"
                          required
                          disabled={signupLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-dob">Data de Nascimento</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-dob"
                          type="date"
                          value={signupDOB}
                          onChange={(e) => setSignupDOB(e.target.value)}
                          className="pl-10"
                          required
                          disabled={signupLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-cpf">CPF</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={signupCPF}
                        onChange={(e) => setSignupCPF(e.target.value)}
                        className="pl-10"
                        required
                        disabled={signupLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={signupLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                        disabled={signupLoading}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 py-4">
                    <Switch id="professional-mode" checked={isProfessional} onCheckedChange={setIsProfessional} />
                    <Label htmlFor="professional-mode">Sou um Profissional</Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signupLoading}
                  >
                    {signupLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}