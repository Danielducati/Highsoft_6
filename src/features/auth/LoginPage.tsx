import { useState } from "react";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";

import { Sparkles, User, Shield, Users, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";


interface LoginPageProps {
  onLogin: (role: 'admin' | 'employee' | 'client') => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleLogin = (role: 'admin' | 'employee' | 'client') => {
    // Simulación de login
    onLogin(role);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryEmail) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    // Simulación de envío de correo de recuperación
    setTimeout(() => {
      setRecoverySuccess(true);
      toast.success("Correo de recuperación enviado exitosamente");
    }, 1000);
  };

  const handleCloseRecoveryDialog = () => {
    setForgotPasswordOpen(false);
    setRecoveryEmail("");
    setRecoverySuccess(false);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al inicio
          </button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-3xl text-foreground">HIGHLIFE SPA & BAR</h1>
          </div>
          <p className="text-muted-foreground">Sistema de Gestión Integral de Spa y Bienestar</p>
        </div>

        {/* Login Tabs */}
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Administrador
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Empleado
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Cliente
            </TabsTrigger>
          </TabsList>

          {/* Admin Login */}
          <TabsContent value="admin">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Acceso de Administrador
                </CardTitle>
                <CardDescription>
                  Acceso completo a todos los módulos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Correo Electrónico</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@highlifespa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Contraseña</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <button 
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-foreground"
                  onClick={() => handleLogin('admin')}
                >
                  Iniciar Sesión como Administrador
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Demo: usa cualquier credencial para acceder
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employee Login */}
          <TabsContent value="employee">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Acceso de Empleado
                </CardTitle>
                <CardDescription>
                  Gestión de citas, horarios y novedades asignadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-email">Correo Electrónico</Label>
                  <Input
                    id="employee-email"
                    type="email"
                    placeholder="empleado@highlifespa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-password">Contraseña</Label>
                  <Input
                    id="employee-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <button 
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-foreground"
                  onClick={() => handleLogin('employee')}
                >
                  Iniciar Sesión como Empleado
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Demo: usa cualquier credencial para acceder
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Login */}
          <TabsContent value="client">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Acceso de Cliente
                </CardTitle>
                <CardDescription>
                  Agendamiento de citas, historial y perfil personal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Correo Electrónico</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-password">Contraseña</Label>
                  <Input
                    id="client-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <button 
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <a href="#" className="text-primary hover:underline">
                    Crear cuenta
                  </a>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-foreground"
                  onClick={() => handleLogin('client')}
                >
                  Iniciar Sesión como Cliente
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Demo: usa cualquier credencial para acceder
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forgot Password Dialog */}
        <Dialog open={forgotPasswordOpen} onOpenChange={handleCloseRecoveryDialog}>
          <DialogContent className="sm:max-w-[480px]">
            {!recoverySuccess ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#78D1BD]" />
                    Recuperar Contraseña
                  </DialogTitle>
                  <DialogDescription>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recovery-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="recovery-email"
                        type="email"
                        placeholder="tu_correo@ejemplo.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseRecoveryDialog}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
                    >
                      Enviar Enlace
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Correo Enviado
                  </DialogTitle>
                </DialogHeader>
                <div className="py-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-green-800 mb-1">
                          ¡Correo enviado exitosamente!
                        </p>
                        <p className="text-xs text-green-700">
                          Hemos enviado un enlace de recuperación a <span className="font-semibold">{recoveryEmail}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">Nota:</span> Si no recibes el correo en los próximos minutos, revisa tu carpeta de spam o correo no deseado.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleCloseRecoveryDialog}
                    className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
                  >
                    Entendido
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}