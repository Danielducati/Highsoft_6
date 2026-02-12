import { useState } from "react";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Card, CardContent } from "../../shared/ui/card";

import { Sparkles, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";


interface RegisterPageProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

export function RegisterPage({ onBack, onRegisterSuccess }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    tipocedula: "",
    cedula: "",
    password: "",
    confirmPassword: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    if (!formData.fullName || !formData.email || !formData.phone || !formData.tipocedula|| !formData.cedula || !formData.password|| !formData.confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    // Validación de contraseña
    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Mostrar pantalla de éxito
    setShowSuccess(true);
    
    // Después de 2.5 segundos, volver a la landing
    setTimeout(() => {
      onRegisterSuccess();
    }, 2500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Pantalla de éxito
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#78D1BD]/10 via-[#60A5FA]/10 to-[#A78BFA]/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200 shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl text-gray-900">¡Registro Exitoso!</h2>
                <p className="text-gray-600">
                  Tu cuenta ha sido creada correctamente. Bienvenido a HIGHLIFE SPA & BAR.
                </p>
              </div>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-[#78D1BD]" />
                <span>Usuario registrado exitosamente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#78D1BD]/10 via-[#60A5FA]/10 to-[#A78BFA]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl text-gray-900">HIGHLIFE SPA & BAR</h1>
          </div>
          <div>
            <h2 className="text-xl text-gray-900">Crear Cuenta</h2>
            <p className="text-sm text-gray-600 mt-1">
              Completa tus datos para registrarte
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-gray-200 shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre y Apellidos */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-900">
                  Nombre y Apellidos *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Ingresa tu nombre y apellidos"
                  className="rounded-lg border-gray-200 h-11"
                />
              </div>

              {/* Correo electrónico */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">
                  Correo Electrónico *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="rounded-lg border-gray-200 h-11"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900">
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="rounded-lg border-gray-200 h-11"
                />
              </div>

              {/* Tipo de Cédula */}
              <div className="space-y-2">
                <Label className="text-gray-900">
                  Tipo de Cédula *
                </Label>

                <Select
                  value={formData.tipocedula}
                  onValueChange={(value) => handleChange("tipocedula", value)}
                >
                  <SelectTrigger className="h-11 rounded-lg border-gray-200">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PAS">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cédula */}
              <div className="space-y-2">
                <Label htmlFor="cedula" className="text-gray-900">
                  Cédula *
                </Label>
                <Input
                  id="cedula"
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => handleChange("cedula", e.target.value)}
                  placeholder="1234567890"
                  className="rounded-lg border-gray-200 h-11"
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">
                  Contraseña *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="rounded-lg border-gray-200 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900">
                  Confirmar Contraseña *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="Confirma tu contraseña"
                    className="rounded-lg border-gray-200 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

               {/* Botón de registro */}         
              <Button
                type="submit"
                variant="default"
                className="w-full h-11 rounded-lg !bg-[#00aae4] hover:!bg-[#0095c7] !text-white"
              >
                Registrar
              </Button>

              {/* Volver */}
              <button
                type="button"
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={onBack}
            className="text-[#007BFF] hover:text-[#0056b3] transition-colors"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}