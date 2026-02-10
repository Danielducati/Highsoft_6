import { useState } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Plus, Search, Filter, Clock, AlertCircle, FileText, CheckCircle, XCircle, User, Calendar as CalendarIcon, AlertTriangle, UserX, Edit, Trash2, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  employeeId: string;
  specialty: string;
  isActive: boolean;
}

interface EmployeeNews {
  id: number;
  employeeName: string;
  employeeId: string;
  type: 'incapacidad' | 'retraso' | 'permiso' | 'percance' | 'ausencia' | 'otro';
  date: string;
  startTime?: string;
  endTime?: string;
  description: string;
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'resuelta';
  createdAt: string;
}

interface NewsModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function NewsModule({ userRole }: NewsModuleProps) {
  // Lista de empleados disponibles
  const [employees] = useState<Employee[]>([
    { id: 1, name: "Ana María García", employeeId: "EMP-001", specialty: "Masajes Terapéuticos", isActive: true },
    { id: 2, name: "Carlos Rodríguez", employeeId: "EMP-002", specialty: "Tratamientos Faciales", isActive: true },
    { id: 3, name: "Laura Martínez", employeeId: "EMP-003", specialty: "Manicure & Pedicure", isActive: true },
    { id: 4, name: "David López", employeeId: "EMP-004", specialty: "Aromaterapia", isActive: false },
    { id: 5, name: "María González", employeeId: "EMP-005", specialty: "Masajes Deportivos", isActive: true },
    { id: 6, name: "Roberto Silva", employeeId: "EMP-006", specialty: "Tratamientos Corporales", isActive: true },
    { id: 7, name: "Ana Martínez", employeeId: "EMP-007", specialty: "Faciales", isActive: true },
    { id: 8, name: "Laura Pérez", employeeId: "EMP-008", specialty: "Depilación", isActive: true },
  ]);

  const [newsList, setNewsList] = useState<EmployeeNews[]>([
    {
      id: 1,
      employeeName: "María González",
      employeeId: "EMP-005",
      type: "incapacidad",
      date: "2025-10-18",
      description: "Incapacidad médica por gripe. Se adjunta certificado del doctor. Fecha estimada de retorno: 22 de octubre.",
      status: "aprobada",
      createdAt: "2025-10-16"
    },
    {
      id: 2,
      employeeName: "Carlos Rodríguez",
      employeeId: "EMP-002",
      type: "retraso",
      date: "2025-10-16",
      description: "Llegó 30 minutos tarde debido a problemas en el transporte público.",
      status: "resuelta",
      createdAt: "2025-10-16"
    },
    {
      id: 3,
      employeeName: "Ana Martínez",
      employeeId: "EMP-007",
      type: "permiso",
      date: "2025-10-20",
      startTime: "14:00",
      endTime: "16:00",
      description: "Solicita permiso para cita médica especializada de 2:00 PM a 4:00 PM.",
      status: "pendiente",
      createdAt: "2025-10-15"
    },
    {
      id: 4,
      employeeName: "Roberto Silva",
      employeeId: "EMP-006",
      type: "percance",
      date: "2025-10-14",
      description: "Derramó producto de limpieza en el área de masajes. Se realizó limpieza inmediata sin consecuencias mayores.",
      status: "resuelta",
      createdAt: "2025-10-14"
    },
    {
      id: 5,
      employeeName: "Laura Pérez",
      employeeId: "EMP-008",
      type: "ausencia",
      date: "2025-10-15",
      description: "Ausencia no programada por emergencia familiar. Notificó por teléfono.",
      status: "aprobada",
      createdAt: "2025-10-15"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<EmployeeNews | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);
  const [viewingNews, setViewingNews] = useState<EmployeeNews | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newsToChangeStatus, setNewsToChangeStatus] = useState<EmployeeNews | null>(null);
  const [newStatus, setNewStatus] = useState<EmployeeNews['status']>('pendiente');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    type: "retraso" as EmployeeNews['type'],
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    status: "pendiente" as EmployeeNews['status']
  });

  const newsTypes = [
    { value: 'incapacidad', label: 'Incapacidad', icon: UserX, color: 'text-red-600' },
    { value: 'retraso', label: 'Retraso', icon: Clock, color: 'text-yellow-600' },
    { value: 'permiso', label: 'Permiso', icon: FileText, color: 'text-blue-600' },
    { value: 'percance', label: 'Percance', icon: AlertTriangle, color: 'text-orange-600' },
    { value: 'ausencia', label: 'Ausencia', icon: AlertCircle, color: 'text-purple-600' },
    { value: 'otro', label: 'Otro', icon: FileText, color: 'text-gray-600' }
  ];

  const filteredNews = newsList.filter(item => {
    const matchesSearch = 
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  // Reset a página 1 cuando cambian los filtros
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleEmployeeChange = (employeeId: string) => {
    const selectedEmployee = employees.find(emp => emp.employeeId === employeeId);
    if (selectedEmployee) {
      setFormData({
        ...formData,
        employeeId: selectedEmployee.employeeId,
        employeeName: selectedEmployee.name
      });
    }
  };

  const handleCreateOrUpdate = () => {
    if (!formData.employeeName || !formData.employeeId || !formData.date || !formData.description) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (editingNews) {
      setNewsList(newsList.map(item => 
        item.id === editingNews.id 
          ? { ...item, ...formData, createdAt: item.createdAt }
          : item
      ));
      toast.success("Novedad actualizada exitosamente");
    } else {
      const newNews: EmployeeNews = {
        id: Math.max(...newsList.map(n => n.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setNewsList([newNews, ...newsList]);
      toast.success("Novedad creada exitosamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingNews(null);
    setFormData({
      employeeName: "",
      employeeId: "",
      type: "retraso",
      date: "",
      startTime: "",
      endTime: "",
      description: "",
      status: "pendiente"
    });
  };

  const handleEdit = (item: EmployeeNews) => {
    setEditingNews(item);
    setFormData({
      employeeName: item.employeeName,
      employeeId: item.employeeId,
      type: item.type,
      date: item.date,
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      description: item.description,
      status: item.status
    });
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: number) => {
    setNewsToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (newsToDelete) {
      setNewsList(newsList.filter(item => item.id !== newsToDelete));
      toast.success("Novedad eliminada exitosamente");
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
    }
  };

  const handleStatusChange = (id: number, newStatus: EmployeeNews['status']) => {
    setNewsList(newsList.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
    toast.success("Estado actualizado exitosamente");
  };

  const getTypeConfig = (type: string) => {
    return newsTypes.find(t => t.value === type) || newsTypes[5];
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "incapacidad": "bg-red-100 text-red-700 border-red-200",
      "retraso": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "permiso": "bg-blue-100 text-blue-700 border-blue-200",
      "percance": "bg-orange-100 text-orange-700 border-orange-200",
      "ausencia": "bg-purple-100 text-purple-700 border-purple-200",
      "otro": "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[type] || colors["otro"];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "pendiente": "bg-amber-100 text-amber-700",
      "aprobada": "bg-emerald-100 text-emerald-700",
      "rechazada": "bg-red-100 text-red-700",
      "resuelta": "bg-blue-100 text-blue-700"
    };
    return colors[status] || colors["pendiente"];
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "pendiente": "Pendiente",
      "aprobada": "Aprobada",
      "rechazada": "Rechazada",
      "resuelta": "Resuelta"
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#F87171]" />
            <h1 className="text-gray-900">Novedades de Empleados</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">Gestión de incapacidades, retrasos, permisos y percances</p>
        </div>
        {(userRole === 'admin' || userRole === 'employee') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
                onClick={() => {
                  setEditingNews(null);
                  setFormData({
                    employeeName: "",
                    employeeId: "",
                    type: "retraso",
                    date: "",
                    startTime: "",
                    endTime: "",
                    description: "",
                    status: "pendiente"
                  });
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva Novedad
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNews ? "Editar Novedad" : "Registrar Nueva Novedad"}</DialogTitle>
                <DialogDescription>
                  {editingNews ? "Actualiza la información de la novedad del empleado" : "Completa los detalles de la novedad"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Seleccionar Empleado *</Label>
                  <Select 
                    value={formData.employeeId}
                    onValueChange={handleEmployeeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees
                        .filter(emp => emp.isActive)
                        .map(employee => (
                          <SelectItem key={employee.id} value={employee.employeeId}>
                            <div className="flex items-center gap-2">
                              <span>{employee.name}</span>
                              <span className="text-gray-500 text-xs">({employee.employeeId})</span>
                              <span className="text-gray-400 text-xs">- {employee.specialty}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {formData.employeeName && (
                    <p className="text-sm text-gray-600">
                      Empleado seleccionado: <span className="text-gray-900">{formData.employeeName}</span> - {formData.employeeId}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Novedad *</Label>
                    <Select 
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {newsTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha del Evento *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora de Inicio</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      placeholder="HH:MM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora Final</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      placeholder="HH:MM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Detallada *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe la situación con el mayor detalle posible..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="aprobada">Aprobada</SelectItem>
                      <SelectItem value="rechazada">Rechazada</SelectItem>
                      <SelectItem value="resuelta">Resuelta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
                    onClick={handleCreateOrUpdate}
                  >
                    {editingNews ? "Actualizar" : "Crear"} Novedad
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, ID o descripción..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterType} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {newsTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                  <SelectItem value="resuelta">Resuelta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-900">Empleado</th>
                <th className="px-4 py-3 text-left text-gray-900">Tipo</th>
                <th className="px-4 py-3 text-left text-gray-900">Hora</th>
                <th className="px-4 py-3 text-left text-gray-900">Fecha Inicio</th>
                <th className="px-4 py-3 text-left text-gray-900">Fecha Final</th>
                <th className="px-4 py-3 text-left text-gray-900">Estado</th>
                <th className="px-4 py-3 text-center text-gray-900">Acciones</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100">
              {paginatedNews.map((item) => {
                const typeConfig = getTypeConfig(item.type);
                const TypeIcon = typeConfig.icon;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Empleado */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 flex-shrink-0 ${typeConfig.color}`} />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 truncate">{item.employeeName}</p>
                          <p className="text-xs text-gray-500">{item.employeeId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`${getTypeColor(item.type)} text-xs px-2.5 py-0.5`}>
                        {newsTypes.find(t => t.value === item.type)?.label || item.type}
                      </Badge>
                    </td>

                    {/* Hora */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {item.startTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#78D1BD]" />
                            <span className="text-sm text-gray-900">{item.startTime}</span>
                          </div>
                        )}
                        {item.endTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#60A5FA]" />
                            <span className="text-sm text-gray-900">{item.endTime}</span>
                          </div>
                        )}
                        {!item.startTime && !item.endTime && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Fecha Inicio */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {new Date(item.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Fecha Final */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {new Date(item.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <Badge className={`${getStatusColor(item.status)} text-xs px-2.5 py-0.5`}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingNews(item)}
                          className="p-1.5 hover:bg-[#60A5FA]/10 rounded-lg text-[#60A5FA] transition-all hover:scale-105"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(userRole === 'admin' || userRole === 'employee') && (
                          <>
                            <button
                              onClick={() => {
                                setNewsToChangeStatus(item);
                                setNewStatus(item.status);
                                setStatusDialogOpen(true);
                              }}
                              className="p-1.5 hover:bg-[#A78BFA]/10 rounded-lg text-[#A78BFA] transition-all hover:scale-105"
                              title="Cambiar estado"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 hover:bg-[#FBBF24]/10 rounded-lg text-[#FBBF24] transition-all hover:scale-105"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {userRole === 'admin' && (
                              <button
                                onClick={() => confirmDelete(item.id)}
                                className="p-1.5 hover:bg-[#F87171]/10 rounded-lg text-[#F87171] transition-all hover:scale-105"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredNews.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron novedades</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredNews.length)} de {filteredNews.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 text-sm"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 text-sm"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewingNews} onOpenChange={() => setViewingNews(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#A78BFA]" />
              Detalles de la Novedad
            </DialogTitle>
            <DialogDescription>
              Información completa de la novedad registrada
            </DialogDescription>
          </DialogHeader>
          {viewingNews && (
            <div className="space-y-4">
              {/* Employee Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  {(() => {
                    const typeConfig = getTypeConfig(viewingNews.type);
                    const TypeIcon = typeConfig.icon;
                    return <TypeIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${typeConfig.color}`} />;
                  })()}
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-0.5">{viewingNews.employeeName}</h3>
                    <p className="text-sm text-gray-600">ID: {viewingNews.employeeId}</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Tipo de Novedad</p>
                  <Badge variant="outline" className={`${getTypeColor(viewingNews.type)} text-xs px-2 py-1 w-fit`}>
                    {newsTypes.find(t => t.value === viewingNews.type)?.label || viewingNews.type}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Estado</p>
                  <Badge className={`${getStatusColor(viewingNews.status)} text-xs px-2 py-1 w-fit`}>
                    {getStatusLabel(viewingNews.status)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Fecha del Evento</p>
                  <p className="text-sm text-gray-900">
                    {new Date(viewingNews.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Fecha de Registro</p>
                  <p className="text-sm text-gray-900">
                    {new Date(viewingNews.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {(viewingNews.startTime || viewingNews.endTime) && (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Hora de Inicio</p>
                      <p className="text-sm text-gray-900">
                        {viewingNews.startTime || 'No especificada'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Hora Final</p>
                      <p className="text-sm text-gray-900">
                        {viewingNews.endTime || 'No especificada'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs text-gray-600">Descripción Detallada</p>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingNews.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setViewingNews(null)}
                  className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg"
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
              ¿Eliminar Novedad?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La novedad será eliminada permanentemente del sistema.
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

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#A78BFA]" />
              Cambiar Estado de Novedad
            </AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona el nuevo estado para esta novedad. Esta acción se registrará en el historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {newsToChangeStatus && (
            <div className="space-y-4 py-4">
              {/* Información de la novedad */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  {(() => {
                    const typeConfig = getTypeConfig(newsToChangeStatus.type);
                    const TypeIcon = typeConfig.icon;
                    return <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />;
                  })()}
                  <p className="text-sm text-gray-900">{newsToChangeStatus.employeeName}</p>
                </div>
                <p className="text-xs text-gray-600">
                  {newsTypes.find(t => t.value === newsToChangeStatus.type)?.label} - {new Date(newsToChangeStatus.date).toLocaleDateString('es-ES')}
                </p>
              </div>

              {/* Estado actual y nuevo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Estado Actual</Label>
                  <Badge className={`${getStatusColor(newsToChangeStatus.status)} text-xs px-2.5 py-1 w-fit`}>
                    {getStatusLabel(newsToChangeStatus.status)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-status" className="text-xs text-gray-600">Nuevo Estado</Label>
                  <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                    <SelectTrigger id="new-status" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="aprobada">Aprobada</SelectItem>
                      <SelectItem value="rechazada">Rechazada</SelectItem>
                      <SelectItem value="resuelta">Resuelta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (newsToChangeStatus) {
                  handleStatusChange(newsToChangeStatus.id, newStatus);
                }
                setStatusDialogOpen(false);
                setNewsToChangeStatus(null);
              }}
              className="bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB]"
            >
              Cambiar Estado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}