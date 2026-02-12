import React, { useState } from "react";

import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,} from "../../shared/ui/dialog";

import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,
  AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,} from "../../shared/ui/alert-dialog";

import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "../../shared/ui/select";

import { Badge } from "../../shared/ui/badge";
import { Textarea } from "../../shared/ui/textarea";

import {Plus,ChevronLeft,ChevronRight,Clock,User,Trash2,Edit,CalendarIcon,X,Search,Filter,List,Calendar,XCircle,
} from "lucide-react";

import { toast } from "sonner";

// Tipos
interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
}

interface Employee {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

interface AppointmentService {
  serviceId: string;
  serviceName: string;
  employeeId: string;
  employeeName: string;
  duration: number;
  startTime: string;
}

interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  date: Date;
  services: AppointmentService[];
  totalDuration: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'cancelled' | 'completed';
  notes?: string;
}

interface AppointmentsModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function AppointmentsModule({ userRole }: AppointmentsModuleProps) {
  // Datos de servicios
  const services: Service[] = [
    { id: "s1", name: "Masaje Relajante", category: "Masajes", duration: 60, price: 80000 },
    { id: "s2", name: "Masaje Deportivo", category: "Masajes", duration: 90, price: 120000 },
    { id: "s3", name: "Masaje Piedras Calientes", category: "Masajes", duration: 75, price: 100000 },
    { id: "s4", name: "Tratamiento Facial Básico", category: "Faciales", duration: 45, price: 65000 },
    { id: "s5", name: "Tratamiento Facial Premium", category: "Faciales", duration: 90, price: 110000 },
    { id: "s6", name: "Limpieza Profunda", category: "Faciales", duration: 60, price: 75000 },
    { id: "s7", name: "Manicure", category: "Estética", duration: 45, price: 40000 },
    { id: "s8", name: "Pedicure", category: "Estética", duration: 60, price: 50000 },
    { id: "s9", name: "Depilación Piernas", category: "Estética", duration: 40, price: 45000 },
    { id: "s10", name: "Aromaterapia", category: "Terapias", duration: 60, price: 70000 },
    { id: "s11", name: "Reflexología", category: "Terapias", duration: 50, price: 60000 },
  ];

  // Datos de empleados
  const employees: Employee[] = [
    { id: "e1", name: "Ana María García", specialty: "Masajes", color: "#78D1BD" },
    { id: "e2", name: "Carlos Rodríguez", specialty: "Masajes", color: "#60A5FA" },
    { id: "e3", name: "Laura Martínez", specialty: "Faciales", color: "#FBBF24" },
    { id: "e4", name: "David López", specialty: "Faciales", color: "#F87171" },
    { id: "e5", name: "María González", specialty: "Estética", color: "#A78BFA" },
    { id: "e6", name: "Roberto Silva", specialty: "Terapias", color: "#EC4899" },
  ];

  const clients = [
    { id: 1, name: "Laura Sánchez", phone: "+57 310 123 4567" },
    { id: 2, name: "Pedro Ramírez", phone: "+57 320 987 6543" },
    { id: 3, name: "Sofia Torres", phone: "+57 315 555 1234" },
    { id: 4, name: "Miguel Ángel Castro", phone: "+57 300 444 7890" },
    { id: 5, name: "Carmen López", phone: "+57 311 222 3333" },
  ];

  // Estados
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      clientName: "Laura Sánchez",
      clientPhone: "+57 310 123 4567",
      date: new Date(2025, 10, 17),
      services: [
        {
          serviceId: "s1",
          serviceName: "Masaje Relajante",
          employeeId: "e1",
          employeeName: "Ana María García",
          duration: 60,
          startTime: "10:00"
        }
      ],
      totalDuration: 60,
      startTime: "10:00",
      endTime: "11:00",
      status: "completed",
      notes: "Cliente prefiere música suave"
    },
    {
      id: 2,
      clientName: "Pedro Ramírez",
      clientPhone: "+57 320 987 6543",
      date: new Date(2025, 10, 17),
      services: [
        {
          serviceId: "s4",
          serviceName: "Tratamiento Facial Básico",
          employeeId: "e3",
          employeeName: "Laura Martínez",
          duration: 45,
          startTime: "14:00"
        },
        {
          serviceId: "s7",
          serviceName: "Manicure",
          employeeId: "e5",
          employeeName: "María González",
          duration: 45,
          startTime: "15:00"
        }
      ],
      totalDuration: 90,
      startTime: "14:00",
      endTime: "15:30",
      status: "pending"
    },
    {
      id: 3,
      clientName: "Sofia Torres",
      clientPhone: "+57 315 555 1234",
      date: new Date(2025, 10, 18),
      services: [
        {
          serviceId: "s2",
          serviceName: "Masaje Deportivo",
          employeeId: "e2",
          employeeName: "Carlos Rodríguez",
          duration: 90,
          startTime: "11:00"
        }
      ],
      totalDuration: 90,
      startTime: "11:00",
      endTime: "12:30",
      status: "completed"
    }
  ]);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date(2025, 10, 17);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    clientPhone: "",
    date: new Date(2025, 10, 17),
    startTime: "",
    notes: ""
  });

  const [selectedServices, setSelectedServices] = useState<AppointmentService[]>([]);
  const [currentService, setCurrentService] = useState({
    serviceId: "",
    employeeId: ""
  });

  // Funciones auxiliares
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30"
  ];

  const isToday = (date: Date) => {
    const today = new Date(2025, 10, 17);
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date(2025, 10, 17);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "pending": "bg-amber-100 text-amber-700",
      "cancelled": "bg-red-100 text-red-700",
      "completed": "bg-blue-100 text-blue-700"
    };
    return colors[status] || colors["pending"];
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "pending": "Pendiente",
      "cancelled": "Cancelada",
      "completed": "Completada"
    };
    return labels[status] || status;
  };

  const getEmployeesByCategory = (category: string) => {
    return employees.filter(emp => emp.specialty === category);
  };

  // Calcular tiempo final basado en tiempo de inicio y duración
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  // Agregar servicio a la cita
  const handleAddService = () => {
    if (!currentService.serviceId || !currentService.employeeId) {
      toast.error("Por favor selecciona un servicio y un empleado");
      return;
    }

    const service = services.find(s => s.id === currentService.serviceId);
    const employee = employees.find(e => e.id === currentService.employeeId);

    if (!service || !employee) return;

    // Calcular tiempo de inicio para este servicio
    let serviceStartTime = formData.startTime;
    if (selectedServices.length > 0) {
      const lastService = selectedServices[selectedServices.length - 1];
      serviceStartTime = calculateEndTime(lastService.startTime, lastService.duration);
    }

    const newService: AppointmentService = {
      serviceId: service.id,
      serviceName: service.name,
      employeeId: employee.id,
      employeeName: employee.name,
      duration: service.duration,
      startTime: serviceStartTime
    };

    setSelectedServices([...selectedServices, newService]);
    setCurrentService({ serviceId: "", employeeId: "" });
    toast.success("Servicio agregado a la cita");
  };

  // Remover servicio
  const handleRemoveService = (index: number) => {
    const newServices = selectedServices.filter((_, i) => i !== index);
    // Recalcular tiempos de inicio para los servicios restantes
    const updatedServices = newServices.map((service, i) => {
      if (i === 0) {
        return { ...service, startTime: formData.startTime };
      } else {
        const prevService = newServices[i - 1];
        return {
          ...service,
          startTime: calculateEndTime(prevService.startTime, prevService.duration)
        };
      }
    });
    setSelectedServices(updatedServices);
  };

  // Crear o actualizar cita
  const handleCreateOrUpdate = () => {
    if (!formData.clientId || !formData.startTime || selectedServices.length === 0) {
      toast.error("Por favor completa todos los campos y agrega al menos un servicio");
      return;
    }

    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const endTime = calculateEndTime(formData.startTime, totalDuration);

    if (editingAppointment) {
      setAppointments(appointments.map(apt =>
        apt.id === editingAppointment.id
          ? {
              ...apt,
              ...formData,
              services: selectedServices,
              totalDuration,
              endTime,
            }
          : apt
      ));
      toast.success("Cita actualizada exitosamente");
    } else {
      const newAppointment: Appointment = {
        id: Math.max(...appointments.map(a => a.id), 0) + 1,
        ...formData,
        services: selectedServices,
        totalDuration,
        endTime,
        status: "pending"
      };
      setAppointments([...appointments, newAppointment]);
      toast.success("Cita creada exitosamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingAppointment(null);
    setFormData({
      clientId: "",
      clientName: "",
      clientPhone: "",
      date: new Date(2025, 10, 17),
      startTime: "",
      notes: ""
    });
    setSelectedServices([]);
    setCurrentService({ serviceId: "", employeeId: "" });
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const client = clients.find(c => c.name === appointment.clientName);
    setFormData({
      clientId: client ? client.id.toString() : "",
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      date: appointment.date,
      startTime: appointment.startTime,
      notes: appointment.notes || ""
    });
    setSelectedServices(appointment.services);
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: number) => {
    setAppointmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (appointmentToDelete) {
      setAppointments(appointments.filter(apt => apt.id !== appointmentToDelete));
      toast.success("Cita cancelada exitosamente");
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const confirmCancel = (id: number) => {
    setAppointmentToCancel(id);
    setCancelDialogOpen(true);
  };

  const handleCancelAppointment = () => {
    if (appointmentToCancel) {
      setAppointments(appointments.map(apt =>
        apt.id === appointmentToCancel
          ? { ...apt, status: 'cancelled' as const }
          : apt
      ));
      toast.success("Cita cancelada exitosamente");
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
    }
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id.toString() === clientId);
    if (client) {
      setFormData({
        ...formData,
        clientId: clientId,
        clientName: client.name,
        clientPhone: client.phone
      });
    }
  };

  // Obtener citas para una celda específica del calendario
  const getAppointmentsForCell = (date: Date, time: string) => {
    return appointments.filter(apt => {
      if (apt.date.toDateString() !== date.toDateString()) return false;
      
      const [aptHour, aptMin] = apt.startTime.split(':').map(Number);
      const [endHour, endMin] = apt.endTime.split(':').map(Number);
      const [cellHour, cellMin] = time.split(':').map(Number);
      
      const aptStartMinutes = aptHour * 60 + aptMin;
      const aptEndMinutes = endHour * 60 + endMin;
      const cellMinutes = cellHour * 60 + cellMin;
      
      return cellMinutes >= aptStartMinutes && cellMinutes < aptEndMinutes;
    });
  };

  // Verificar si es la primera celda de una cita
  const isFirstCellOfAppointment = (apt: Appointment, time: string) => {
    return apt.startTime === time;
  };

  // Calcular cuántas celdas ocupa una cita
  const getAppointmentCellSpan = (apt: Appointment) => {
    const [startHour, startMin] = apt.startTime.split(':').map(Number);
    const [endHour, endMin] = apt.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;
    return Math.ceil(durationMinutes / 30); // Cada celda representa 30 minutos
  };

  // Filtrar citas para la vista de lista
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#78D1BD]" />
            <h1 className="text-gray-900">Gestión de Citas</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {viewMode === 'calendar' 
              ? 'Haz clic en cualquier hora disponible para crear una cita rápidamente'
              : 'Listado completo de todas las citas registradas'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center justify-center gap-1.5 rounded px-2.5 py-1 text-xs transition-all ${
                viewMode === 'calendar'
                  ? 'bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center justify-center gap-1.5 rounded px-2.5 py-1 text-xs transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
          </div>
          <button
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Filtros - Solo en vista de lista */}
      {viewMode === 'list' && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm rounded-lg border-gray-200"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="completed">Completadas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <>
          {/* Table Header - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-[80px_1.5fr_1.5fr_1.2fr_100px_1.8fr_120px_140px] gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
            <div>Código</div>
            <div>Cliente</div>
            <div>Empleado</div>
            <div>Fecha</div>
            <div>Hora</div>
            <div>Servicios</div>
            <div>Estado</div>
            <div className="text-right">Acciones</div>
          </div>

          {/* Appointments List */}
          <div className="space-y-1">
            {filteredAppointments.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No se encontraron citas</p>
                  <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
                  {/* Main Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-[80px_1.5fr_1.5fr_1.2fr_100px_1.8fr_120px_140px] gap-2 lg:gap-4 p-2.5 lg:p-4 items-start lg:items-center">
                    {/* Código */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs lg:hidden text-gray-500">Código:</span>
                      <span className="text-sm text-gray-900">#{appointment.id.toString().padStart(4, '0')}</span>
                    </div>

                    {/* Cliente */}
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 lg:hidden" />
                      <span className="text-xs lg:hidden text-gray-500">Cliente:</span>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900 truncate">{appointment.clientName}</p>
                        <p className="text-xs text-gray-500 truncate lg:hidden">{appointment.clientPhone}</p>
                      </div>
                    </div>

                    {/* Empleado */}
                    <div className="min-w-0">
                      <span className="text-xs lg:hidden text-gray-500">Empleado:</span>
                      <p className="text-sm text-gray-700 truncate">{appointment.services[0]?.employeeName || 'N/A'}</p>
                    </div>

                    {/* Fecha */}
                    <div className="min-w-0">
                      <span className="text-xs lg:hidden text-gray-500">Fecha:</span>
                      <p className="text-sm text-gray-700">
                        {appointment.date.toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>

                    {/* Hora */}
                    <div className="min-w-0">
                      <span className="text-xs lg:hidden text-gray-500">Hora:</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400 lg:hidden" />
                        <p className="text-sm text-gray-700">{appointment.startTime}</p>
                      </div>
                    </div>

                    {/* Servicios */}
                    <div className="min-w-0">
                      <span className="text-xs lg:hidden text-gray-500">Servicios:</span>
                      <div className="space-y-0.5">
                        {appointment.services.slice(0, 2).map((service, idx) => (
                          <p key={idx} className="text-sm text-gray-700 truncate">{service.serviceName}</p>
                        ))}
                        {appointment.services.length > 2 && (
                          <p className="text-xs text-gray-500">+{appointment.services.length - 2} más</p>
                        )}
                      </div>
                    </div>

                    {/* Estado */}
                    <div>
                      <Badge className={`${getStatusColor(appointment.status)} text-[11px] px-2 py-0.5 whitespace-nowrap`}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-start lg:justify-end gap-1.5">
                      <button
                        onClick={() => setViewingAppointment(appointment)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#60A5FA] hover:bg-[#60A5FA]/10 transition-all"
                        title="Ver detalles"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {userRole === 'admin' && (
                        <>
                          <button
                            onClick={() => handleEdit(appointment)}
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#FBBF24] hover:bg-[#FBBF24]/10 transition-all"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmCancel(appointment.id)}
                            disabled={appointment.status === 'cancelled'}
                            className={`inline-flex items-center justify-center rounded-lg p-1.5 transition-all ${
                              appointment.status === 'cancelled'
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-[#F87171] hover:bg-[#F87171]/10'
                            }`}
                            title={appointment.status === 'cancelled' ? 'Ya cancelada' : 'Cancelar'}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Vista de Calendario */}
      {viewMode === 'calendar' && (
        <>
          {/* Navegación de semana */}
          <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <h3 className="text-gray-900">
                {getWeekDates()[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} - {getWeekDates()[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <Button variant="outline" size="sm" onClick={goToToday} className="border-gray-300 rounded-lg h-8 text-sm">
                Hoy
              </Button>
            </div>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </CardContent>
      </Card>

          {/* Leyenda de Estados */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs text-gray-600">Estados de citas:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-l-4 border-[#10B981] bg-[#10B98120]"></div>
                  <span className="text-xs text-gray-700">Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-l-4 border-[#F59E0B] bg-[#F59E0B20]"></div>
                  <span className="text-xs text-gray-700">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-l-4 border-[#3B82F6] bg-[#3B82F620]"></div>
                  <span className="text-xs text-gray-700">Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-l-4 border-[#EF4444] bg-[#EF444420]"></div>
                  <span className="text-xs text-gray-700">Cancelada</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendario Semanal */}
          <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Encabezados de días */}
            <div className="grid grid-cols-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
              <div className="p-3 border-r border-gray-200">
                <span className="text-gray-900">Hora</span>
              </div>
              {getWeekDates().map((date, idx) => (
                <div
                  key={idx}
                  className={`p-3 border-r border-gray-200 last:border-r-0 text-center ${
                    isToday(date) ? 'bg-[#78D1BD]/10' : ''
                  }`}
                >
                  <div className="text-sm text-gray-600">{weekDays[idx]}</div>
                  <div className={`mt-0.5 ${isToday(date) ? 'text-[#78D1BD]' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Filas de tiempo */}
            {timeSlots.map((time, timeIdx) => (
              <div key={time} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                <div className="p-2 border-r border-gray-200 bg-gray-50/50 text-sm text-gray-600">
                  {time}
                </div>
                {getWeekDates().map((date, dateIdx) => {
                  const cellAppointments = getAppointmentsForCell(date, time);
                  const firstAppointment = cellAppointments.find(apt => isFirstCellOfAppointment(apt, time));
                  const isOccupied = cellAppointments.length > 0;

                  return (
                    <div
                      key={dateIdx}
                      className={`border-r border-gray-200 last:border-r-0 relative min-h-[50px] ${
                        isToday(date) ? 'bg-[#78D1BD]/5' : ''
                      } ${!isOccupied ? 'hover:bg-[#A78BFA]/10 cursor-pointer transition-colors group' : ''}`}
                      style={{ height: '50px' }}
                      onClick={() => {
                        if (!isOccupied) {
                          setFormData({ ...formData, date, startTime: time });
                          setEditingAppointment(null);
                          setSelectedServices([]);
                          setIsDialogOpen(true);
                        }
                      }}
                    >
                      {/* Indicador de celda vacía al hacer hover */}
                      {!isOccupied && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <Plus className="w-5 h-5 text-[#A78BFA]" />
                        </div>
                      )}

                      {firstAppointment && (
                        <div
                          className="absolute inset-x-1 rounded-lg p-2 shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all"
                          style={{
                            height: `${getAppointmentCellSpan(firstAppointment) * 50 - 4}px`,
                            backgroundColor: (() => {
                              const statusColors = {
                                confirmed: '#10B98120',
                                pending: '#F59E0B20',
                                cancelled: '#EF444420',
                                completed: '#3B82F620'
                              };
                              return statusColors[firstAppointment.status];
                            })(),
                            borderLeftColor: (() => {
                              const statusBorderColors = {
                                confirmed: '#10B981',
                                pending: '#F59E0B',
                                cancelled: '#EF4444',
                                completed: '#3B82F6'
                              };
                              return statusBorderColors[firstAppointment.status];
                            })()
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingAppointment(firstAppointment);
                          }}
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-900 truncate">{firstAppointment.clientName}</span>
                              <Badge className={`${getStatusColor(firstAppointment.status)} text-[10px] px-1.5 py-0 h-4`}>
                                {getStatusLabel(firstAppointment.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-1">
                              <Clock className="w-3 h-3" />
                              <span>{firstAppointment.startTime} - {firstAppointment.endTime}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-1">
                              {firstAppointment.services.map((service, idx) => (
                                <div key={idx} className="text-[10px] text-gray-700 flex items-start gap-1">
                                  <span className="w-1 h-1 rounded-full bg-gray-400 mt-1 flex-shrink-0"></span>
                                  <span className="truncate">{service.serviceName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
        </>
      )}

      {/* Dialog: Ver Detalles de Cita */}
      <Dialog open={!!viewingAppointment} onOpenChange={() => setViewingAppointment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#78D1BD]" />
              Detalles de la Cita
            </DialogTitle>
            <DialogDescription>
              Información completa de la cita programada
            </DialogDescription>
          </DialogHeader>
          {viewingAppointment && (
            <div className="space-y-4">
              {/* Info del cliente */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <h3 className="text-gray-900 mb-2">Cliente</h3>
                <p className="text-sm text-gray-700">{viewingAppointment.clientName}</p>
                <p className="text-xs text-gray-600 mt-1">{viewingAppointment.clientPhone}</p>
              </div>

              {/* Fecha y hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Fecha</p>
                  <p className="text-sm text-gray-900">
                    {viewingAppointment.date.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Horario</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#78D1BD]" />
                    <p className="text-sm text-gray-900">
                      {viewingAppointment.startTime} - {viewingAppointment.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div className="space-y-2">
                <p className="text-xs text-gray-600">Servicios Contratados</p>
                <div className="space-y-2">
                  {viewingAppointment.services.map((service, idx) => {
                    const employee = employees.find(e => e.id === service.employeeId);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border-l-4 bg-gray-50"
                        style={{ borderLeftColor: employee?.color }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-gray-900">{service.serviceName}</p>
                          <span className="text-xs text-gray-600">{service.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          <span>{service.employeeName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <p className="text-xs text-gray-600">Estado de la Cita</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['pending', 'completed', 'cancelled'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setAppointments(appointments.map(apt =>
                          apt.id === viewingAppointment.id
                            ? { ...apt, status }
                            : apt
                        ));
                        setViewingAppointment({ ...viewingAppointment, status });
                        toast.success(`Estado actualizado a ${getStatusLabel(status)}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        viewingAppointment.status === status
                          ? getStatusColor(status) + ' ring-2 ring-offset-2'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              {viewingAppointment.notes && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Notas</p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-900">{viewingAppointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                {userRole === 'admin' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      confirmDelete(viewingAppointment.id);
                      setViewingAppointment(null);
                    }}
                    className="border-[#F87171] text-[#F87171] hover:bg-[#F87171]/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleEdit(viewingAppointment);
                    setViewingAppointment(null);
                  }}
                  className="border-[#FBBF24] text-[#FBBF24] hover:bg-[#FBBF24]/10"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => setViewingAppointment(null)}
                  className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Crear/Editar Cita */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#A78BFA]" />
              {editingAppointment ? "Editar Cita" : "Nueva Cita"}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment ? "Actualiza la información de la cita" : "Programa una nueva cita para el cliente"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Información de fecha/hora seleccionada */}
            {formData.date && formData.startTime && !editingAppointment && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-[#A78BFA]/10 to-[#78D1BD]/10 border border-[#A78BFA]/30">
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <CalendarIcon className="w-4 h-4 text-[#A78BFA]" />
                  <span>
                    {formData.date.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                  <span className="text-gray-400">•</span>
                  <Clock className="w-4 h-4 text-[#78D1BD]" />
                  <span>{formData.startTime}</span>
                </div>
              </div>
            )}

            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={formData.clientId} onValueChange={handleClientChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-xs text-gray-500">{client.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de Inicio *</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value: string) => setFormData({ ...formData, startTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Agregar Servicios */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-gray-900">Agregar Servicios</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="service">Servicio</Label>
                  <Select 
                    value={currentService.serviceId} 
                    onValueChange={(value: string) => {
                      const service = services.find(s => s.id === value);
                      setCurrentService({ 
                        serviceId: value, 
                        employeeId: "" 
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex flex-col">
                            <span>{service.name}</span>
                            <span className="text-xs text-gray-500">{service.category} • {service.duration} min</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee">Empleado</Label>
                  <Select 
                    value={currentService.employeeId} 
                    onValueChange={(value: any) => setCurrentService({ ...currentService, employeeId: value })}
                    disabled={!currentService.serviceId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentService.serviceId && (() => {
                        const service = services.find(s => s.id === currentService.serviceId);
                        const availableEmployees = getEmployeesByCategory(service?.category || "");
                        return availableEmployees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: employee.color }}
                              ></div>
                              <span>{employee.name}</span>
                            </div>
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddService}
                variant="outline"
                className="w-full border-[#78D1BD] text-[#78D1BD] hover:bg-[#78D1BD]/10"
                disabled={!formData.startTime}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Servicio
              </Button>

              {/* Lista de servicios agregados */}
              {selectedServices.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-gray-600">Servicios Agregados:</p>
                  {selectedServices.map((service, idx) => {
                    const employee = employees.find(e => e.id === service.employeeId);
                    const endTime = calculateEndTime(service.startTime, service.duration);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border-l-4"
                        style={{ borderLeftColor: employee?.color }}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{service.serviceName}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {service.employeeName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {service.startTime} - {endTime} ({service.duration} min)
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveService(idx)}
                          className="p-1 hover:bg-red-50 rounded text-[#F87171] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      Duración total: {selectedServices.reduce((sum, s) => sum + s.duration, 0)} minutos
                      {formData.startTime && ` • Finaliza: ${calculateEndTime(formData.startTime, selectedServices.reduce((sum, s) => sum + s.duration, 0))}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Preferencias del cliente, alergias, etc."
                rows={3}
              />
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateOrUpdate}
                className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
              >
                {editingAppointment ? "Actualizar" : "Crear"} Cita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#F87171]" />
              ¿Eliminar Cita?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cita será eliminada permanentemente del sistema.
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

      {/* Dialog: Confirmar Cancelación */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[#F87171]" />
              ¿Cancelar Cita?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado de la cita a "Cancelada". El cliente será notificado de la cancelación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              className="bg-[#F87171] hover:bg-[#EF4444]"
            >
              Sí, cancelar cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}