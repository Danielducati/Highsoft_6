import { useState } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Label } from "../../shared/ui/label";
import { Input } from "../../shared/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { Checkbox } from "../../shared/ui/checkbox";
import { Plus, Clock, Calendar as CalendarIcon, User, Search, X, ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Tipos
interface Employee {
  id: string;
  name: string;
  specialty: string;
}

interface DaySchedule {
  dayIndex: number;
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  id: number;
  employeeId: string;
  employeeName: string;
  weekStartDate: Date; // Lunes de la semana
  daySchedules: DaySchedule[]; // Cada día con su horario específico
  isActive: boolean;
}

interface SchedulesModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function SchedulesModule({ userRole }: SchedulesModuleProps) {
  // Datos de empleados
  const employees: Employee[] = [
    { id: "e1", name: "Ana María García", specialty: "Masajes" },
    { id: "e2", name: "Carlos Rodríguez", specialty: "Faciales" },
    { id: "e3", name: "Laura Martínez", specialty: "Estética" },
    { id: "e4", name: "David López", specialty: "Terapias" },
    { id: "e5", name: "María González", specialty: "Masajes" },
    { id: "e6", name: "Roberto Silva", specialty: "Terapias" },
  ];

  const weekDaysLabels = [
    { id: 0, label: "Lunes", short: "L" },
    { id: 1, label: "Martes", short: "M" },
    { id: 2, label: "Miércoles", short: "X" },
    { id: 3, label: "Jueves", short: "J" },
    { id: 4, label: "Viernes", short: "V" },
    { id: 5, label: "Sábado", short: "S" },
    { id: 6, label: "Domingo", short: "D" },
  ];

  // Función para obtener el lunes de una fecha
  const getMondayOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para domingo
    return new Date(d.setDate(diff));
  };

  // Función para obtener los días de una semana
  const getWeekDays = (monday: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Estados
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([
    { 
      id: 1, 
      employeeId: "e1", 
      employeeName: "Ana María García", 
      weekStartDate: new Date(2025, 10, 17), // 17 Nov 2025 (Lunes)
      daySchedules: [
        { dayIndex: 0, startTime: "09:00", endTime: "17:00" }, // Lun
        { dayIndex: 2, startTime: "09:00", endTime: "17:00" }, // Mie
        { dayIndex: 4, startTime: "09:00", endTime: "14:00" }, // Vie
      ],
      isActive: true 
    },
    { 
      id: 2, 
      employeeId: "e2", 
      employeeName: "Carlos Rodríguez", 
      weekStartDate: new Date(2025, 10, 17),
      daySchedules: [
        { dayIndex: 1, startTime: "10:00", endTime: "18:00" }, // Mar
        { dayIndex: 3, startTime: "10:00", endTime: "19:00" }, // Jue
      ],
      isActive: true 
    },
    { 
      id: 3, 
      employeeId: "e3", 
      employeeName: "Laura Martínez", 
      weekStartDate: new Date(2025, 10, 17),
      daySchedules: [
        { dayIndex: 0, startTime: "08:00", endTime: "16:00" }, // Lun
        { dayIndex: 1, startTime: "08:00", endTime: "16:00" }, // Mar
        { dayIndex: 2, startTime: "08:00", endTime: "16:00" }, // Mie
        { dayIndex: 3, startTime: "08:00", endTime: "16:00" }, // Jue
        { dayIndex: 4, startTime: "08:00", endTime: "13:00" }, // Vie
      ],
      isActive: true 
    },
    { 
      id: 4, 
      employeeId: "e4", 
      employeeName: "David López", 
      weekStartDate: new Date(2025, 10, 24), // 24 Nov 2025
      daySchedules: [
        { dayIndex: 2, startTime: "11:00", endTime: "19:00" }, // Mie
        { dayIndex: 3, startTime: "11:00", endTime: "19:00" }, // Jue
        { dayIndex: 4, startTime: "11:00", endTime: "18:00" }, // Vie
      ],
      isActive: true 
    },
    { 
      id: 5, 
      employeeId: "e5", 
      employeeName: "María González", 
      weekStartDate: new Date(2025, 10, 17),
      daySchedules: [
        { dayIndex: 5, startTime: "09:00", endTime: "15:00" }, // Sab
        { dayIndex: 6, startTime: "09:00", endTime: "14:00" }, // Dom
      ],
      isActive: true 
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WeeklySchedule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<WeeklySchedule | null>(null);

  // Estado del formulario con semana navegable
  const [formWeekStart, setFormWeekStart] = useState(getMondayOfWeek(new Date(2025, 10, 17)));
  const [formData, setFormData] = useState({
    employeeId: "",
    daySchedules: [] as DaySchedule[]
  });

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  // Navegación de semana en el formulario
  const goToPreviousWeek = () => {
    const newDate = new Date(formWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setFormWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(formWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setFormWeekStart(newDate);
  };

  // Filtrar horarios
  const getFilteredSchedules = () => {
    let filtered = schedules.filter(s => s.isActive);

    // Filtrar por empleado
    if (filterEmployee !== "all") {
      filtered = filtered.filter(s => s.employeeId === filterEmployee);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.employeeName.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  // Handlers
  const handleCreateOrUpdate = () => {
    if (!formData.employeeId || formData.daySchedules.length === 0) {
      toast.error("Por favor completa todos los campos y selecciona al menos un día");
      return;
    }

    // Validar que todos los días tengan horarios
    for (const daySchedule of formData.daySchedules) {
      if (!daySchedule.startTime || !daySchedule.endTime) {
        toast.error("Por favor completa todos los horarios");
        return;
      }
      if (daySchedule.startTime >= daySchedule.endTime) {
        const dayLabel = weekDaysLabels[daySchedule.dayIndex].label;
        toast.error(`La hora de inicio debe ser menor a la hora de fin en ${dayLabel}`);
        return;
      }
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    if (editingSchedule) {
      setSchedules(schedules.map(schedule =>
        schedule.id === editingSchedule.id
          ? {
              ...schedule,
              employeeId: formData.employeeId,
              employeeName: employee.name,
              weekStartDate: formWeekStart,
              daySchedules: formData.daySchedules
            }
          : schedule
      ));
      toast.success("Horario actualizado exitosamente");
    } else {
      const newSchedule: WeeklySchedule = {
        id: Math.max(...schedules.map(s => s.id), 0) + 1,
        employeeId: formData.employeeId,
        employeeName: employee.name,
        weekStartDate: formWeekStart,
        daySchedules: formData.daySchedules,
        isActive: true
      };
      setSchedules([...schedules, newSchedule]);
      toast.success("Horario creado exitosamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormWeekStart(getMondayOfWeek(new Date(2025, 10, 17)));
    setFormData({
      employeeId: "",
      daySchedules: []
    });
  };

  const handleEdit = (schedule: WeeklySchedule) => {
    setEditingSchedule(schedule);
    setFormWeekStart(schedule.weekStartDate);
    setFormData({
      employeeId: schedule.employeeId,
      daySchedules: [...schedule.daySchedules]
    });
    setIsDialogOpen(true);
  };

  const handleViewDetail = (schedule: WeeklySchedule) => {
    setViewingSchedule(schedule);
    setDetailDialogOpen(true);
  };

  const confirmDelete = (id: number) => {
    setScheduleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (scheduleToDelete) {
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleToDelete));
      toast.success("Horario eliminado");
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterEmployee("all");
  };

  const toggleDay = (dayIndex: number) => {
    const existingIndex = formData.daySchedules.findIndex(ds => ds.dayIndex === dayIndex);
    
    if (existingIndex >= 0) {
      // Remover el día
      setFormData(prev => ({
        ...prev,
        daySchedules: prev.daySchedules.filter(ds => ds.dayIndex !== dayIndex)
      }));
    } else {
      // Agregar el día con horarios vacíos
      setFormData(prev => ({
        ...prev,
        daySchedules: [...prev.daySchedules, { dayIndex, startTime: "", endTime: "" }]
      }));
    }
  };

  const updateDaySchedule = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      daySchedules: prev.daySchedules.map(ds =>
        ds.dayIndex === dayIndex ? { ...ds, [field]: value } : ds
      )
    }));
  };

  const filteredSchedules = getFilteredSchedules();
  const formWeekDays = getWeekDays(formWeekStart);

  const getDayBadgeColor = (dayIndex: number) => {
    const colors = [
      "bg-[#78D1BD]/20 text-[#78D1BD] border-[#78D1BD]/30", // Lun
      "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30", // Mar
      "bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30", // Mie
      "bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30", // Jue
      "bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/30", // Vie
      "bg-[#78D1BD]/20 text-[#78D1BD] border-[#78D1BD]/30", // Sab
      "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30", // Dom
    ];
    return colors[dayIndex] || "bg-gray-200 text-gray-700";
  };

  const formatWeekRange = (weekStart: Date) => {
    const weekDays = getWeekDays(weekStart);
    const weekEnd = weekDays[6];
    return `${weekDays[0].getDate()} ${weekDays[0].toLocaleDateString('es-ES', { month: 'short' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const start = new Date(0, 0, 0, startHours, startMinutes);
    const end = new Date(0, 0, 0, endHours, endMinutes);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${duration} horas`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#78D1BD]" />
            <h1 className="text-gray-900">Horarios Semanales</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            Gestión de turnos y disponibilidad del personal
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Horario
          </button>
        )}
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Búsqueda */}
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-lg border-gray-200 focus:border-[#78D1BD] focus:ring-[#78D1BD]"
              />
            </div>

            {/* Filtro por empleado */}
            <div className="md:col-span-3">
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger className="h-9 rounded-lg border-gray-200">
                  <SelectValue placeholder="Todos los empleados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón limpiar filtros */}
            <div className="md:col-span-1">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-9 w-full rounded-lg border-gray-200 hover:bg-gray-50"
                disabled={!searchTerm && filterEmployee === "all"}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Indicadores de filtros activos */}
          {(searchTerm || filterEmployee !== "all") && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-600">Filtros activos:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs bg-[#78D1BD]/10 text-[#78D1BD] border-[#78D1BD]/30">
                  Búsqueda: {searchTerm}
                </Badge>
              )}
              {filterEmployee !== "all" && (
                <Badge variant="secondary" className="text-xs bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30">
                  Empleado: {employees.find(e => e.id === filterEmployee)?.name}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de horarios */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {filteredSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <CalendarIcon className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-center">
                {searchTerm || filterEmployee !== "all" 
                  ? "No se encontraron horarios con los filtros aplicados" 
                  : "No hay horarios registrados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-sm text-gray-700">Empleado</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-700">Semana</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-700">Horarios por Día</th>
                    {userRole === 'admin' && (
                      <th className="text-center px-4 py-3 text-sm text-gray-700 w-32">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSchedules.map((schedule) => {
                    const weekDays = getWeekDays(schedule.weekStartDate);
                    return (
                      <tr key={schedule.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Empleado */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#78D1BD] flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-900">{schedule.employeeName}</p>
                              <p className="text-xs text-gray-500">
                                {employees.find(e => e.id === schedule.employeeId)?.specialty}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Semana */}
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="text-gray-900">{formatWeekRange(schedule.weekStartDate)}</p>
                          </div>
                        </td>

                        {/* Horarios por Día */}
                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            {schedule.daySchedules
                              .sort((a, b) => a.dayIndex - b.dayIndex)
                              .map(daySchedule => {
                                const day = weekDaysLabels[daySchedule.dayIndex];
                                const date = weekDays[daySchedule.dayIndex];
                                return (
                                  <div key={daySchedule.dayIndex} className="flex items-center gap-2 text-sm">
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs ${getDayBadgeColor(daySchedule.dayIndex)}`}
                                    >
                                      {day.short}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {date.getDate()}/{date.getMonth() + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-[#60A5FA]" />
                                      <span className="text-gray-900">{daySchedule.startTime}</span>
                                      <span className="text-gray-400">→</span>
                                      <span className="text-gray-900">{daySchedule.endTime}</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </td>

                        {/* Acciones */}
                        {userRole === 'admin' && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetail(schedule)}
                                className="h-8 w-8 hover:bg-[#78D1BD]/10 hover:text-[#78D1BD]"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(schedule)}
                                className="h-8 w-8 hover:bg-[#60A5FA]/10 hover:text-[#60A5FA]"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(schedule.id)}
                                className="h-8 w-8 hover:bg-[#F87171]/10 hover:text-[#F87171]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Ver Detalle */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#78D1BD]" />
              Detalle del Horario
            </DialogTitle>
            <DialogDescription>
              Información completa del horario semanal
            </DialogDescription>
          </DialogHeader>
          {viewingSchedule && (
            <div className="space-y-4">
              {/* Información del empleado */}
              <Card className="border-gray-200 bg-gradient-to-br from-[#78D1BD]/5 via-white to-[#60A5FA]/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#60A5FA] flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900">{viewingSchedule.employeeName}</p>
                      <p className="text-sm text-gray-500">
                        {employees.find(e => e.id === viewingSchedule.employeeId)?.specialty}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de la semana */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-4 h-4 text-[#60A5FA]" />
                      <p className="text-xs text-gray-600">Semana</p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {formatWeekRange(viewingSchedule.weekStartDate)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[#FBBF24]" />
                      <p className="text-xs text-gray-600">Total de días</p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {viewingSchedule.daySchedules.length} {viewingSchedule.daySchedules.length === 1 ? 'día' : 'días'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Horarios detallados por día */}
              <div className="space-y-2">
                <Label>Horarios por Día</Label>
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {viewingSchedule.daySchedules
                        .sort((a, b) => a.dayIndex - b.dayIndex)
                        .map(daySchedule => {
                          const day = weekDaysLabels[daySchedule.dayIndex];
                          const weekDays = getWeekDays(viewingSchedule.weekStartDate);
                          const date = weekDays[daySchedule.dayIndex];
                          const duration = calculateDuration(daySchedule.startTime, daySchedule.endTime);
                          
                          return (
                            <div 
                              key={daySchedule.dayIndex}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="secondary" 
                                  className={`${getDayBadgeColor(daySchedule.dayIndex)}`}
                                >
                                  {day.label}
                                </Badge>
                                <div>
                                  <p className="text-sm text-gray-900">
                                    {date.toLocaleDateString('es-ES', { 
                                      weekday: 'long', 
                                      day: 'numeric', 
                                      month: 'long' 
                                    })}
                                  </p>
                                  <p className="text-xs text-gray-500">{duration}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-md border border-gray-200">
                                  <Clock className="w-3.5 h-3.5 text-[#60A5FA]" />
                                  <span className="text-sm text-gray-900">{daySchedule.startTime}</span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-sm text-gray-900">{daySchedule.endTime}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Botón cerrar */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setDetailDialogOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Crear/Editar Horario */}
      <Dialog open={isDialogOpen} onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Editar Horario" : "Nuevo Horario"}</DialogTitle>
            <DialogDescription>
              {editingSchedule ? "Actualiza la información del horario semanal" : "Define horarios personalizados para cada día de la semana"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Empleado */}
            <div className="space-y-2">
              <Label htmlFor="employee">Empleado *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value: any) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex flex-col">
                        <span>{employee.name}</span>
                        <span className="text-xs text-gray-500">{employee.specialty}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Semana */}
            <div className="space-y-2">
              <Label>Semana *</Label>
              <Card className="border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={goToPreviousWeek}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="text-center">
                      <p className="text-sm text-gray-900">
                        {formatWeekRange(formWeekStart)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={goToNextWeek}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Días de la semana con horarios individuales */}
            <div className="space-y-2">
              <Label>Días y Horarios *</Label>
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {weekDaysLabels.map((day, index) => {
                      const dateOfDay = formWeekDays[index];
                      const isSelected = formData.daySchedules.some(ds => ds.dayIndex === index);
                      const daySchedule = formData.daySchedules.find(ds => ds.dayIndex === index);

                      return (
                        <div key={day.id} className="space-y-2">
                          {/* Checkbox del día */}
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`day-${day.id}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleDay(index)}
                            />
                            <label 
                              htmlFor={`day-${day.id}`}
                              className="text-sm text-gray-900 cursor-pointer select-none flex items-center gap-2"
                            >
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getDayBadgeColor(index)}`}
                              >
                                {day.label}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {dateOfDay.getDate()}/{dateOfDay.getMonth() + 1}/{dateOfDay.getFullYear()}
                              </span>
                            </label>
                          </div>

                          {/* Horarios si está seleccionado */}
                          {isSelected && daySchedule && (
                            <div className="ml-6 grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-gray-600">Hora Inicio</Label>
                                <Select
                                  value={daySchedule.startTime}
                                  onValueChange={(value: string) => updateDaySchedule(index, 'startTime', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="--:--" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeSlots.map(time => (
                                      <SelectItem key={time} value={time}>{time}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs text-gray-600">Hora Fin</Label>
                                <Select
                                  value={daySchedule.endTime}
                                  onValueChange={(value: string) => updateDaySchedule(index, 'endTime', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="--:--" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeSlots.map(time => (
                                      <SelectItem key={time} value={time}>{time}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen de días seleccionados */}
            {formData.daySchedules.length > 0 && (
              <div className="p-3 bg-[#78D1BD]/5 border border-[#78D1BD]/20 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Resumen:</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.daySchedules
                    .sort((a, b) => a.dayIndex - b.dayIndex)
                    .map(ds => {
                      const day = weekDaysLabels[ds.dayIndex];
                      return (
                        <Badge 
                          key={ds.dayIndex}
                          variant="secondary" 
                          className="text-xs bg-white"
                        >
                          {day.short}: {ds.startTime || "--:--"} - {ds.endTime || "--:--"}
                        </Badge>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
                onClick={handleCreateOrUpdate}
              >
                {editingSchedule ? "Actualizar" : "Crear"}
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
              <Clock className="w-5 h-5 text-[#F87171]" />
              ¿Eliminar Horario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El horario será eliminado permanentemente del sistema.
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