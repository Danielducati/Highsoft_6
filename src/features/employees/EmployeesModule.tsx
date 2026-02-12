import { useState, useRef } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import { Switch } from "../../shared/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } 
  from "../../shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } 
  from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } 
  from "../../shared/ui/table";

import { Plus, Pencil, Trash2, Search, Eye, Users, Filter, Star, Briefcase, ImageIcon, X, Upload, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { ImageWithFallback } from "../guidelines/figma/ImageWithFallback";
import { Avatar, AvatarFallback } from "../../shared/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  image: string;
  isActive: boolean;
  hiredDate: string;
  totalAppointments: number;
  rating: number;
  availability: string;
}

interface Appointment {
  id: number;
  employeeId: number;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notes: string;
}

interface News {
  id: number;
  employeeId: number;
  title: string;
  content: string;
  category: string;
  date: string;
  isPublished: boolean;
}

interface EmployeesModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function EmployeesModule({ userRole }: EmployeesModuleProps) {
  // Estados para empleados
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "Ana María García",
      email: "ana.garcia@highlifespa.com",
      phone: "+57 310 234 5678",
      specialty: "Masajes Terapéuticos",
      image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400",
      isActive: true,
      hiredDate: "2023-01-15",
      totalAppointments: 156,
      rating: 4.8,
      availability: "Disponible"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@highlifespa.com",
      phone: "+57 320 345 6789",
      specialty: "Tratamientos Faciales",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
      isActive: true,
      hiredDate: "2023-03-20",
      totalAppointments: 132,
      rating: 4.9,
      availability: "Disponible"
    },
    {
      id: 3,
      name: "Laura Martínez",
      email: "laura.martinez@highlifespa.com",
      phone: "+57 315 456 7890",
      specialty: "Manicure & Pedicure",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
      isActive: true,
      hiredDate: "2023-06-10",
      totalAppointments: 98,
      rating: 4.7,
      availability: "En cita"
    },
    {
      id: 4,
      name: "David López",
      email: "david.lopez@highlifespa.com",
      phone: "+57 300 567 8901",
      specialty: "Aromaterapia",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      isActive: false,
      hiredDate: "2022-11-05",
      totalAppointments: 45,
      rating: 4.5,
      availability: "Inactivo"
    },
  ]);

  // Estados para citas
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      employeeId: 1,
      clientName: "María Rodríguez",
      serviceName: "Masaje Sueco Premium",
      date: "2025-10-17",
      time: "10:00",
      status: "confirmada",
      notes: "Cliente prefiere aceites cítricos"
    },
    {
      id: 2,
      employeeId: 1,
      clientName: "Pedro Sánchez",
      serviceName: "Masaje de Piedras Calientes",
      date: "2025-10-17",
      time: "14:00",
      status: "pendiente",
      notes: ""
    },
    {
      id: 3,
      employeeId: 2,
      clientName: "Sofia Torres",
      serviceName: "Tratamiento Facial Hidratante",
      date: "2025-10-18",
      time: "11:00",
      status: "confirmada",
      notes: "Piel sensible"
    },
  ]);

  // Estados para novedades
  const [news, setNews] = useState<News[]>([
    {
      id: 1,
      employeeId: 1,
      title: "Nuevo protocolo de masajes",
      content: "Se ha implementado un nuevo protocolo para masajes deportivos que incluye técnicas avanzadas de recuperación muscular.",
      category: "Protocolo",
      date: "2025-10-15",
      isPublished: true
    },
    {
      id: 2,
      employeeId: 2,
      title: "Productos orgánicos disponibles",
      content: "Ahora contamos con una línea completa de productos orgánicos certificados para tratamientos faciales.",
      category: "Productos",
      date: "2025-10-14",
      isPublished: true
    },
  ]);

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  
  // Diálogos
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isAgendaDialogOpen, setIsAgendaDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isAppointmentsListDialogOpen, setIsAppointmentsListDialogOpen] = useState(false);
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
  const [isNewsListDialogOpen, setIsNewsListDialogOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  // Formularios
  const [employeeForm, setEmployeeForm] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    document: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    specialty: "",
    image: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    clientName: "",
    serviceName: "",
    date: "",
    time: "",
    notes: "",
  });

  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    category: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrado de empleados
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === "all" || employee.specialty === filterSpecialty;
    const matchesAvailability = filterAvailability === "all" || 
                               (filterAvailability === "active" && employee.isActive) ||
                               (filterAvailability === "inactive" && !employee.isActive);
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  // Paginación
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
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

  const handleSpecialtyChange = (value: string) => {
    setFilterSpecialty(value);
    setCurrentPage(1);
  };

  const handleAvailabilityChange = (value: string) => {
    setFilterAvailability(value);
    setCurrentPage(1);
  };

  // Obtener especialidades únicas
  const specialties = Array.from(new Set(employees.map(e => e.specialty)));

  // Handlers para empleados
  const handleCreateOrUpdateEmployee = () => {
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.documentType || 
        !employeeForm.document || !employeeForm.email || !employeeForm.phone || 
        !employeeForm.city || !employeeForm.address || !employeeForm.specialty) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const fullName = `${employeeForm.firstName} ${employeeForm.lastName}`;

    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { 
              ...emp, 
              name: fullName,
              email: employeeForm.email,
              phone: employeeForm.phone,
              specialty: employeeForm.specialty,
              image: imagePreview || emp.image 
            }
          : emp
      ));
      toast.success("Empleado actualizado exitosamente");
    } else {
      const newEmployee: Employee = {
        id: Math.max(...employees.map(e => e.id), 0) + 1,
        name: fullName,
        email: employeeForm.email,
        phone: employeeForm.phone,
        specialty: employeeForm.specialty,
        image: imagePreview || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        isActive: true,
        hiredDate: new Date().toISOString().split('T')[0],
        totalAppointments: 0,
        rating: 5.0,
        availability: "Disponible"
      };
      setEmployees([...employees, newEmployee]);
      toast.success("Empleado creado exitosamente");
    }

    resetEmployeeForm();
  };

  const confirmDeleteEmployee = (id: number) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEmployee = () => {
    if (employeeToDelete) {
      setEmployees(employees.filter(emp => emp.id !== employeeToDelete));
      toast.success("Empleado eliminado exitosamente");
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    const nameParts = employee.name.split(' ');
    const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
    const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
    
    setEmployeeForm({
      firstName: firstName,
      lastName: lastName,
      documentType: "",
      document: "",
      email: employee.email,
      phone: employee.phone,
      city: "",
      address: "",
      specialty: employee.specialty,
      image: employee.image,
    });
    setImagePreview(employee.image);
    setIsEmployeeDialogOpen(true);
  };

  const resetEmployeeForm = () => {
    setIsEmployeeDialogOpen(false);
    setEditingEmployee(null);
    setEmployeeForm({ firstName: "", lastName: "", documentType: "", document: "", email: "", phone: "", city: "", address: "", specialty: "", image: "" });
    setImagePreview("");
  };

  // Handlers para citas
  const handleCreateOrUpdateAppointment = () => {
    if (!appointmentForm.clientName || !appointmentForm.serviceName || !appointmentForm.date || !appointmentForm.time) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (!selectedEmployee) {
      toast.error("Selecciona un empleado primero");
      return;
    }

    if (editingAppointment) {
      setAppointments(appointments.map(apt => 
        apt.id === editingAppointment.id 
          ? { ...apt, ...appointmentForm }
          : apt
      ));
      toast.success("Cita actualizada exitosamente");
    } else {
      const newAppointment: Appointment = {
        id: Math.max(...appointments.map(a => a.id), 0) + 1,
        employeeId: selectedEmployee.id,
        ...appointmentForm,
        status: 'pendiente'
      };
      setAppointments([...appointments, newAppointment]);
      toast.success("Cita programada exitosamente");
    }

    resetAppointmentForm();
  };

  const handleDeleteAppointment = (id: number) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
    toast.success("Cita eliminada exitosamente");
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setAppointmentForm({
      clientName: appointment.clientName,
      serviceName: appointment.serviceName,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes,
    });
    setIsAppointmentDialogOpen(true);
  };

  const resetAppointmentForm = () => {
    setIsAppointmentDialogOpen(false);
    setEditingAppointment(null);
    setAppointmentForm({ clientName: "", serviceName: "", date: "", time: "", notes: "" });
  };

  // Handlers para novedades
  const handleCreateOrUpdateNews = () => {
    if (!newsForm.title || !newsForm.content || !newsForm.category) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (!selectedEmployee) {
      toast.error("Selecciona un empleado primero");
      return;
    }

    if (editingNews) {
      setNews(news.map(n => 
        n.id === editingNews.id 
          ? { ...n, ...newsForm }
          : n
      ));
      toast.success("Novedad actualizada exitosamente");
    } else {
      const newNewsItem: News = {
        id: Math.max(...news.map(n => n.id), 0) + 1,
        employeeId: selectedEmployee.id,
        ...newsForm,
        date: new Date().toISOString().split('T')[0],
        isPublished: true
      };
      setNews([...news, newNewsItem]);
      toast.success("Novedad agregada exitosamente");
    }

    resetNewsForm();
  };

  const resetNewsForm = () => {
    setIsNewsDialogOpen(false);
    setEditingNews(null);
    setNewsForm({ title: "", content: "", category: "" });
  };

  // Handler para subir imagen
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
        toast.success("Imagen cargada exitosamente");
      };
      reader.readAsDataURL(file);
    }
  };

  // Obtener citas del empleado seleccionado
  const getEmployeeAppointments = (employeeId: number) => {
    return appointments.filter(apt => apt.employeeId === employeeId);
  };

  // Obtener novedades del empleado seleccionado
  const getEmployeeNews = (employeeId: number) => {
    return news.filter(n => n.employeeId === employeeId);
  };

  // Obtener badge de estado de cita
  const getAppointmentStatusBadge = (status: Appointment['status']) => {
    const badges = {
      pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      confirmada: { label: 'Confirmada', className: 'bg-blue-100 text-blue-700 border-blue-300' },
      completada: { label: 'Completada', className: 'bg-green-100 text-green-700 border-green-300' },
      cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-700 border-red-300' }
    };
    return badges[status];
  };

  const handleToggleStatus = (id: number) => {
    setEmployees(employees.map(emp =>
      emp.id === id ? { ...emp, isActive: !emp.isActive, availability: !emp.isActive ? "Disponible" : "Inactivo" } : emp
    ));
    toast.success("Estado actualizado");
  };

  const activeEmployees = employees.filter(e => e.isActive).length;
  const totalEmployees = employees.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#78D1BD]" />
            <h1 className="text-gray-900">Gestión de Empleados</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {totalEmployees} empleados • {activeEmployees} activos
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setEmployeeForm({ firstName: "", lastName: "", documentType: "", document: "", email: "", phone: "", city: "", address: "", specialty: "", image: "" });
            setImagePreview("");
            setIsEmployeeDialogOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo Empleado
        </button>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterSpecialty} onValueChange={handleSpecialtyChange}>
                <SelectTrigger className="w-40 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterAvailability} onValueChange={handleAvailabilityChange}>
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
        <div className="col-span-4">Nombre</div>
        <div className="col-span-3">Cargo</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-4 text-right">Acciones</div>
      </div>

      {/* Employees List - Table Rows */}
      <div className="space-y-1">
        {paginatedEmployees.map((employee) => {
          return (
            <div key={employee.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              {/* Main Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
                {/* Nombre */}
                <div className="lg:col-span-4 flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-sm flex-shrink-0">
                    {employee.image ? (
                      <ImageWithFallback
                        src={employee.image}
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      employee.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{employee.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-600">{employee.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Cargo */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{employee.specialty}</span>
                  </div>
                </div>

                {/* Estado */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-1.5">
                    {userRole === 'admin' && (
                      <Switch
                        checked={employee.isActive}
                        onCheckedChange={() => handleToggleStatus(employee.id)}
                        className="scale-75"
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-4 flex items-center justify-end gap-1">
                  {userRole === 'admin' && (
                    <>
                      <button
                        onClick={() => setViewingEmployee(employee)}
                        className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDeleteEmployee(employee.id)}
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

      {filteredEmployees.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron empleados</p>
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
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} de {filteredEmployees.length} empleados
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

      {/* Dialog: Crear/Editar Empleado */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingEmployee ? 'Actualiza la información del empleado' : 'Ingresa los datos del nuevo empleado'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
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
                      <AvatarFallback className="bg-gray-100">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {imagePreview && (
                    <button
                      onClick={() => setImagePreview("")}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
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
                    Subir Imagen
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF (máx. 5MB)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp-firstname" className="text-gray-900">Nombres *</Label>
                <Input
                  id="emp-firstname"
                  value={employeeForm.firstName}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })}
                  placeholder="Ana María"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-lastname" className="text-gray-900">Apellidos *</Label>
                <Input
                  id="emp-lastname"
                  value={employeeForm.lastName}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })}
                  placeholder="García Pérez"
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp-doctype" className="text-gray-900">Tipo de Documento *</Label>
                <Select 
                  value={employeeForm.documentType} 
                  onValueChange={(value: any) => setEmployeeForm({ ...employeeForm, documentType: value })}
                >
                  <SelectTrigger className="rounded-lg border-gray-200">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PAS">Pasaporte</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-document" className="text-gray-900">Documento *</Label>
                <Input
                  id="emp-document"
                  value={employeeForm.document}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, document: e.target.value })}
                  placeholder="1234567890"
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp-email" className="text-gray-900">Email *</Label>
                <Input
                  id="emp-email"
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  placeholder="empleado@highlifespa.com"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-phone" className="text-gray-900">Teléfono *</Label>
                <Input
                  id="emp-phone"
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                  placeholder="+57 310 123 4567"
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp-city" className="text-gray-900">Ciudad *</Label>
                <Input
                  id="emp-city"
                  value={employeeForm.city}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, city: e.target.value })}
                  placeholder="Bogotá"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-specialty" className="text-gray-900">Especialidad *</Label>
                <Select 
                  value={employeeForm.specialty} 
                  onValueChange={(value: any) => setEmployeeForm({ ...employeeForm, specialty: value })}
                >
                  <SelectTrigger className="rounded-lg border-gray-200">
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masajes Terapéuticos">Masajes Terapéuticos</SelectItem>
                    <SelectItem value="Tratamientos Faciales">Tratamientos Faciales</SelectItem>
                    <SelectItem value="Manicure & Pedicure">Manicure & Pedicure</SelectItem>
                    <SelectItem value="Aromaterapia">Aromaterapia</SelectItem>
                    <SelectItem value="Reflexología">Reflexología</SelectItem>
                    <SelectItem value="Bar & Bebidas">Bar & Bebidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-address" className="text-gray-900">Dirección *</Label>
              <Input
                id="emp-address"
                value={employeeForm.address}
                onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                placeholder="Calle 123 #45-67, Barrio Centro"
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={resetEmployeeForm}
                className="rounded-lg border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateOrUpdateEmployee}
                className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg"
              >
                {editingEmployee ? 'Actualizar' : 'Crear'} Empleado
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver Detalles del Empleado */}
      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detalles del Empleado</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-16 h-16 ring-2 ring-gray-100">
                  <ImageWithFallback
                    src={viewingEmployee.image}
                    alt={viewingEmployee.name}
                    className="w-full h-full object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white text-xl">
                    {viewingEmployee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-gray-900">{viewingEmployee.name}</h3>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-0.5 mt-1">
                    {viewingEmployee.specialty}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{viewingEmployee.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="text-gray-900">{viewingEmployee.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Fecha de Ingreso</p>
                  <p className="text-gray-900">{viewingEmployee.hiredDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Total Citas</p>
                  <p className="text-gray-900">{viewingEmployee.totalAppointments}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Calificación</p>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900">{viewingEmployee.rating}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Estado</p>
                  {viewingEmployee.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5">
                      {viewingEmployee.availability}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-xs px-2 py-0.5">
                      Inactivo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver Agenda */}
      <Dialog open={isAgendaDialogOpen} onOpenChange={setIsAgendaDialogOpen}>
        <DialogContent className="rounded-xl max-w-4xl border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Agenda de {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Visualiza las citas programadas para este empleado
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              {/* Calendario simplificado con citas */}
              <div className="grid grid-cols-1 gap-3">
                {getEmployeeAppointments(selectedEmployee.id).length > 0 ? (
                  getEmployeeAppointments(selectedEmployee.id).map(appointment => {
                    const statusBadge = getAppointmentStatusBadge(appointment.status);
                    return (
                      <Card key={appointment.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-900">
                                  {appointment.date} - {appointment.time}
                                </span>
                                <Badge variant="outline" className={`${statusBadge.className} text-xs px-2 py-0.5`}>
                                  {statusBadge.label}
                                </Badge>
                              </div>
                              <p className="text-gray-900 mb-1">{appointment.clientName}</p>
                              <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                              {appointment.notes && (
                                <p className="text-sm text-gray-500 mt-2 italic">{appointment.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditAppointment(appointment)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                                title="Editar cita"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                title="Eliminar cita"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay citas programadas para este empleado
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Programar/Editar Cita */}
      <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingAppointment ? 'Editar Cita' : 'Programar Nueva Cita'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedEmployee && `Empleado: ${selectedEmployee.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apt-client" className="text-gray-900">Cliente *</Label>
                <Input
                  id="apt-client"
                  value={appointmentForm.clientName}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, clientName: e.target.value })}
                  placeholder="Nombre del cliente"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apt-service" className="text-gray-900">Servicio *</Label>
                <Input
                  id="apt-service"
                  value={appointmentForm.serviceName}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, serviceName: e.target.value })}
                  placeholder="Nombre del servicio"
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apt-date" className="text-gray-900">Fecha *</Label>
                <Input
                  id="apt-date"
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apt-time" className="text-gray-900">Hora *</Label>
                <Input
                  id="apt-time"
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apt-notes" className="text-gray-900">Notas</Label>
              <Textarea
                id="apt-notes"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                placeholder="Observaciones o requerimientos especiales..."
                className="rounded-lg border-gray-200 min-h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={resetAppointmentForm}
                className="rounded-lg border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateOrUpdateAppointment}
                className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:from-[#9F7AEA] hover:to-[#7C3AED] text-white rounded-lg"
              >
                {editingAppointment ? 'Actualizar' : 'Programar'} Cita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Listar Citas */}
      <Dialog open={isAppointmentsListDialogOpen} onOpenChange={setIsAppointmentsListDialogOpen}>
        <DialogContent className="rounded-xl max-w-4xl border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Citas de {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Lista completa de todas las citas del empleado
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-gray-900">Fecha</TableHead>
                      <TableHead className="text-gray-900">Hora</TableHead>
                      <TableHead className="text-gray-900">Cliente</TableHead>
                      <TableHead className="text-gray-900">Servicio</TableHead>
                      <TableHead className="text-gray-900">Estado</TableHead>
                      <TableHead className="text-right text-gray-900">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getEmployeeAppointments(selectedEmployee.id).length > 0 ? (
                      getEmployeeAppointments(selectedEmployee.id).map(appointment => {
                        const statusBadge = getAppointmentStatusBadge(appointment.status);
                        return (
                          <TableRow key={appointment.id} className="hover:bg-gray-50">
                            <TableCell className="text-gray-900">{appointment.date}</TableCell>
                            <TableCell className="text-gray-900">{appointment.time}</TableCell>
                            <TableCell className="text-gray-900">{appointment.clientName}</TableCell>
                            <TableCell className="text-gray-900">{appointment.serviceName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${statusBadge.className} text-xs px-2 py-0.5`}>
                                {statusBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setIsAppointmentsListDialogOpen(false);
                                    handleEditAppointment(appointment);
                                  }}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                                  title="Editar cita"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                  title="Eliminar cita"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No hay citas registradas para este empleado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver Novedades */}
      <Dialog open={isNewsListDialogOpen} onOpenChange={setIsNewsListDialogOpen}>
        <DialogContent className="rounded-xl max-w-4xl border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Novedades de {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Visualiza y gestiona las novedades del empleado
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditingNews(null);
                    setNewsForm({ title: "", content: "", category: "" });
                    setIsNewsDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:from-[#9F7AEA] hover:to-[#7C3AED] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Novedad
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {getEmployeeNews(selectedEmployee.id).length > 0 ? (
                  getEmployeeNews(selectedEmployee.id).map(newsItem => (
                    <Card key={newsItem.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-gray-900">{newsItem.title}</h3>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
                                {newsItem.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{newsItem.content}</p>
                            <p className="text-xs text-gray-500">{newsItem.date}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingNews(newsItem);
                                setNewsForm({
                                  title: newsItem.title,
                                  content: newsItem.content,
                                  category: newsItem.category,
                                });
                                setIsNewsDialogOpen(true);
                              }}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                              title="Editar novedad"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setNews(news.filter(n => n.id !== newsItem.id));
                                toast.success("Novedad eliminada exitosamente");
                              }}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Eliminar novedad"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay novedades registradas para este empleado
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar/Editar Novedad */}
      <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingNews ? 'Editar Novedad' : 'Agregar Nueva Novedad'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedEmployee && `Empleado: ${selectedEmployee.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="news-title" className="text-gray-900">Título *</Label>
              <Input
                id="news-title"
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                placeholder="Título de la novedad"
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="news-category" className="text-gray-900">Categoría *</Label>
              <Select 
                value={newsForm.category} 
                onValueChange={(value: any) => setNewsForm({ ...newsForm, category: value })}
              >
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Protocolo">Protocolo</SelectItem>
                  <SelectItem value="Productos">Productos</SelectItem>
                  <SelectItem value="Capacitación">Capacitación</SelectItem>
                  <SelectItem value="Anuncio">Anuncio</SelectItem>
                  <SelectItem value="Recordatorio">Recordatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="news-content" className="text-gray-900">Contenido *</Label>
              <Textarea
                id="news-content"
                value={newsForm.content}
                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                placeholder="Describe la novedad..."
                className="rounded-lg border-gray-200 min-h-32"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={resetNewsForm}
                className="rounded-lg border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateOrUpdateNews}
                className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:from-[#9F7AEA] hover:to-[#7C3AED] text-white rounded-lg"
              >
                {editingNews ? 'Actualizar' : 'Agregar'} Novedad
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F87171]" />
              ¿Eliminar Empleado?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El empleado será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
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