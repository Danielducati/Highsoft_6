import { useState, useRef } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { Badge } from "../../shared/ui/badge";
import { Avatar, AvatarFallback } from "../../shared/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Eye, UserCircle, Mail, Phone, Filter, Users as UsersIcon, Shield, Briefcase, AlertCircle, Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Switch } from "../../shared/ui/switch";
import { Checkbox } from "../../shared/ui/checkbox";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  assignedServices: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

interface UsersModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function UsersModule({ userRole }: UsersModuleProps) {
  const availableRoles = [
    "Administrador",
    "Empleado",
    "Recepcionista",
    "Terapeuta",
    "Cliente"
  ];

  const availableServices = [
    "Masaje Sueco",
    "Masaje Tailandés",
    "Tratamiento Facial",
    "Aromaterapia",
    "Manicure",
    "Pedicure",
    "Spa Bar Experience",
    "Reflexología"
  ];

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "María González",
      email: "maria@highlife.com",
      phone: "+57 310 111 2222",
      role: "Administrador",
      assignedServices: [],
      isActive: true,
      createdAt: "2024-01-10",
      lastLogin: "2025-10-16"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      email: "carlos@highlife.com",
      phone: "+57 320 333 4444",
      role: "Terapeuta",
      assignedServices: ["Masaje Sueco", "Masaje Tailandés", "Aromaterapia"],
      isActive: true,
      createdAt: "2024-02-15",
      lastLogin: "2025-10-15"
    },
    {
      id: 3,
      name: "Ana Martínez",
      email: "ana@highlife.com",
      phone: "+57 315 555 6666",
      role: "Empleado",
      assignedServices: ["Tratamiento Facial", "Manicure", "Pedicure"],
      isActive: true,
      createdAt: "2024-03-20",
      lastLogin: "2025-10-16"
    },
    {
      id: 4,
      name: "Patricia López",
      email: "patricia@highlife.com",
      phone: "+57 300 777 8888",
      role: "Recepcionista",
      assignedServices: [],
      isActive: true,
      createdAt: "2024-04-05",
      lastLogin: "2025-10-14"
    },
    {
      id: 5,
      name: "Roberto Díaz",
      email: "roberto@highlife.com",
      phone: "+57 318 999 0000",
      role: "Terapeuta",
      assignedServices: ["Reflexología", "Spa Bar Experience"],
      isActive: false,
      createdAt: "2024-05-12",
      lastLogin: "2025-09-20"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    document: "",
    email: "",
    phone: "",
    role: "",
    assignedServices: [] as string[],
    image: "",
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && user.isActive) ||
                         (filterStatus === "inactive" && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value: string) => {
    setFilterRole(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleCreateOrUpdate = () => {
    if (!formData.firstName || !formData.lastName || !formData.documentType || !formData.document || !formData.email || !formData.phone || !formData.role) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`;

    if (editingUser) {
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { 
              ...user, 
              name: fullName,
              email: formData.email,
              phone: formData.phone,
              role: formData.role,
              assignedServices: formData.assignedServices
            }
          : user
      ));
      toast.success("Usuario actualizado exitosamente");
    } else {
      const newUser: User = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        assignedServices: formData.assignedServices,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: "-"
      };
      setUsers([...users, newUser]);
      toast.success("Usuario creado exitosamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({ firstName: "", lastName: "", documentType: "", document: "", email: "", phone: "", role: "", assignedServices: [], image: "" });
    setImagePreview("");
  };

  const confirmDelete = (id: number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete));
      toast.success("Usuario eliminado exitosamente");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const nameParts = user.name.split(' ');
    const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
    const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
    
    setFormData({
      firstName: firstName,
      lastName: lastName,
      documentType: "",
      document: "",
      email: user.email,
      phone: user.phone,
      role: user.role,
      assignedServices: user.assignedServices,
      image: "",
    });
    setImagePreview("");
    setIsDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
        toast.success("Imagen cargada exitosamente");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleStatus = (id: number) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ));
    toast.success("Estado actualizado");
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      assignedServices: prev.assignedServices.includes(service)
        ? prev.assignedServices.filter(s => s !== service)
        : [...prev.assignedServices, service]
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'Administrador': 'bg-purple-100 text-purple-700 border-purple-200',
      'Empleado': 'bg-blue-100 text-blue-700 border-blue-200',
      'Recepcionista': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Terapeuta': 'bg-pink-100 text-pink-700 border-pink-200',
      'Cliente': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const activeUsers = users.filter(u => u.isActive).length;
  const totalUsers = users.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-[#60A5FA]" />
            <h1 className="text-gray-900">Gestión de Usuarios</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {totalUsers} usuarios • {activeUsers} activos
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ firstName: "", lastName: "", documentType: "", document: "", email: "", phone: "", role: "", assignedServices: [], image: "" });
              setIsDialogOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-40 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Header - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Nombre</div>
        <div className="col-span-2">Rol</div>
        <div className="col-span-3">Correo</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      {/* Users List - Table Rows */}
      <div className="space-y-1">
        {paginatedUsers.map((user) => {
          return (
            <div key={user.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              {/* Main Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
                {/* Nombre */}
                <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-sm flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">Desde {user.createdAt}</p>
                  </div>
                </div>

                {/* Rol */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <Badge className={`${getRoleBadgeColor(user.role)} text-xs px-1.5 py-0 h-4`}>
                      {user.role}
                    </Badge>
                  </div>
                </div>

                {/* Correo */}
                <div className="lg:col-span-3 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 truncate">{user.email}</span>
                  </div>
                </div>

                {/* Estado */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-1.5">
                    {userRole === 'admin' && (
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleStatus(user.id)}
                        className="scale-75"
                      />
                    )}
                    <Badge
                      className={`text-xs px-2 py-0 h-5 ${
                        user.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-2 flex items-center justify-end gap-1">
                  {userRole === 'admin' && (
                    <>
                      <button
                        onClick={() => setViewingUser(user)}
                        className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(user.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <UsersIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron usuarios</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-lg border-gray-200 disabled:opacity-50"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border-gray-200 disabled:opacity-50"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-xl max-w-3xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingUser ? 'Actualiza la información del usuario' : 'Crea un nuevo usuario en el sistema'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            {/* Upload de Imagen */}
            <div className="space-y-2">
              <Label className="text-gray-900">Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-2 ring-gray-200">
                    {imagePreview ? (
                      <ImageWithFallback
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white text-xl">
                        <ImageIcon className="w-8 h-8" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {imagePreview && (
                    <button
                      onClick={() => {
                        setImagePreview("");
                        setFormData({ ...formData, image: "" });
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-lg border-gray-200"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {imagePreview ? "Cambiar Imagen" : "Subir Imagen"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF (máx. 5MB)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-900">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Juan"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-900">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Pérez García"
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentType" className="text-gray-900">Tipo de Documento *</Label>
                <Select 
                  value={formData.documentType}
                  onValueChange={(value: any) => setFormData({ ...formData, documentType: value })}
                >
                  <SelectTrigger className="rounded-lg border-gray-200">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="PP">Pasaporte</SelectItem>
                    <SelectItem value="NIT">NIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="document" className="text-gray-900">Número de Documento *</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  placeholder="1234567890"
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+57 300 123 4567"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@highlife.com"
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-900">Rol *</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.role === 'Terapeuta' || formData.role === 'Empleado') && (
              <div className="space-y-3">
                <Label className="text-gray-900">Asignar Servicios</Label>
                <div className="border border-gray-200 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                  {availableServices.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.assignedServices.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <label
                        htmlFor={service}
                        className="text-sm text-gray-700 cursor-pointer select-none"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.assignedServices.length} servicio{formData.assignedServices.length !== 1 ? 's' : ''} asignado{formData.assignedServices.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetForm}
                className="rounded-lg border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateOrUpdate}
                className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg"
              >
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-16 h-16 ring-2 ring-gray-100">
                  <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white text-xl">
                    {viewingUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-gray-900">{viewingUser.name}</h3>
                  <Badge variant="outline" className={`${getRoleBadgeColor(viewingUser.role)} text-xs px-2 py-0.5 mt-1`}>
                    {viewingUser.role}
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-0.5 ${
                    viewingUser.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {viewingUser.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{viewingUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="text-gray-900">{viewingUser.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Fecha de Creación</p>
                  <p className="text-gray-900">{viewingUser.createdAt}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Último Acceso</p>
                  <p className="text-gray-900">{viewingUser.lastLogin}</p>
                </div>
              </div>

              {viewingUser.assignedServices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">Servicios Asignados</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingUser.assignedServices.map((service) => (
                      <Badge key={service} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setViewingUser(null)}
                  className="rounded-lg border-gray-300"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F87171]" />
              ¿Eliminar Usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#F87171] hover:bg-[#EF4444]"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}