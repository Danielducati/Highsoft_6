import { useState } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import { Badge } from "../../shared/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Plus, Search, Filter, ShoppingCart, DollarSign, Calendar, User, Receipt, XCircle, CreditCard, Eye, AlertCircle, Mail, Phone, FileText, Briefcase, IdCard, Download } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: number;
  name: string;
  document: string;
  email: string;
  phone: string;
}

interface Employee {
  id: number;
  name: string;
  document: string;
  email: string;
  phone: string;
  position: string;
}

interface SaleItem {
  serviceId: number;
  serviceName: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: number;
  clientId: number;
  employeeId: number;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'completed';
  appointmentId?: number;
}

interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  service: string;
  employee: string;
  date: Date;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'completed';
  notes?: string;
}

interface SalesModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function SalesModule({ userRole }: SalesModuleProps) {
  const [clients] = useState<Client[]>([ ]);

  const [employees] = useState<Employee[]>([ ]);

  const [appointments] = useState<Appointment[]>([ ]);

  const [sales, setSales] = useState<Sale[]>([ ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saleType, setSaleType] = useState<'appointment' | 'direct'>('direct');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    appointmentId: null as number | null,
    clientName: "",
    selectedServices: [] as SaleItem[],
    discount: "0",
    paymentMethod: "Efectivo",
  });

  const availableServices = [
    { id: 1, name: "Masaje Sueco Premium", price: 120 },
    { id: 2, name: "Tratamiento Facial Hidratante", price: 95 },
    { id: 3, name: "Aromaterapia Completa", price: 110 },
    { id: 4, name: "Manicure & Pedicure Deluxe", price: 75 },
    { id: 5, name: "Spa Bar Experience", price: 25 },
  ];

  const getClientById = (clientId: number) => {
    return clients.find(c => c.id === clientId);
  };

  const getEmployeeById = (employeeId: number) => {
    return employees.find(e => e.id === employeeId);
  };

  const filteredSales = sales.filter(sale => {
    const client = getClientById(sale.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || sale.status === filterStatus;
    const matchesPayment = filterPayment === "all" || sale.paymentMethod === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Paginación
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, endIndex);

  // Reset a página 1 cuando cambian los filtros
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handlePaymentFilterChange = (value: string) => {
    setFilterPayment(value);
    setCurrentPage(1);
  };

  const handleSaleTypeChange = (value: 'appointment' | 'direct') => {
    setSaleType(value);
    setFormData({
      appointmentId: null,
      clientName: "",
      selectedServices: [],
      discount: "0",
      paymentMethod: "Efectivo",
    });
  };

  const handleAppointmentSelect = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === parseInt(appointmentId));
    if (!appointment) return;

    const service = availableServices.find(s => 
      s.name === appointment.service || 
      appointment.service.includes(s.name) ||
      s.name.includes(appointment.service)
    );

    if (service) {
      setFormData(prev => ({
        ...prev,
        appointmentId: appointment.id,
        clientName: appointment.clientName,
        selectedServices: [{
          serviceId: service.id,
          serviceName: service.name,
          price: service.price,
          quantity: 1
        }]
      }));
      toast.success(`Cita seleccionada: ${appointment.clientName}`);
    }
  };

  const addService = (serviceId: number) => {
    const service = availableServices.find(s => s.id === serviceId);
    if (!service) return;

    const existingIndex = formData.selectedServices.findIndex(s => s.serviceId === serviceId);
    if (existingIndex >= 0) {
      const updated = [...formData.selectedServices];
      updated[existingIndex].quantity += 1;
      setFormData({ ...formData, selectedServices: updated });
    } else {
      setFormData({
        ...formData,
        selectedServices: [...formData.selectedServices, {
          serviceId: service.id,
          serviceName: service.name,
          price: service.price,
          quantity: 1
        }]
      });
    }
  };

  const updateQuantity = (serviceId: number, quantity: number) => {
    setFormData({
      ...formData,
      selectedServices: formData.selectedServices.map(s =>
        s.serviceId === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s
      )
    });
  };

  const removeService = (serviceId: number) => {
    setFormData({
      ...formData,
      selectedServices: formData.selectedServices.filter(s => s.serviceId !== serviceId)
    });
  };

  const calculateSubtotal = () => {
    return formData.selectedServices.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    return subtotal - discount;
  };

  const handleRegisterSale = () => {
    if (saleType === 'appointment' && !formData.appointmentId) {
      toast.error("Debes seleccionar una cita");
      return;
    }
    if (saleType === 'direct' && !formData.clientName.trim()) {
      toast.error("El nombre del cliente es obligatorio");
      return;
    }
    if (formData.selectedServices.length === 0) {
      toast.error("Debes agregar al menos un servicio");
      return;
    }

    const newSale: Sale = {
      id: Math.max(...sales.map(s => s.id), 0) + 1,
      clientId: 1, // Default client for demo
      employeeId: 1, // Default employee for demo
      date: new Date().toISOString().split('T')[0],
      items: formData.selectedServices,
      subtotal: calculateSubtotal(),
      discount: parseFloat(formData.discount) || 0,
      total: calculateTotal(),
      paymentMethod: formData.paymentMethod,
      status: "completed",
      appointmentId: saleType === 'appointment' ? formData.appointmentId ?? undefined : undefined
    };

    setSales([newSale, ...sales]);
    toast.success("Venta registrada exitosamente");
    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setFormData({
      appointmentId: null,
      clientName: "",
      selectedServices: [],
      discount: "0",
      paymentMethod: "Efectivo",
    });
    setSaleType('direct');
  };

  const confirmCancelSale = (id: number) => {
    setSaleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCancelSale = () => {
    if (saleToDelete) {
      setSales(sales.filter(sale => sale.id !== saleToDelete));
      toast.success("Venta eliminada exitosamente");
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  };

  const getStatusColor = (status: Sale['status']) => {
    const colors = {
      completed: "bg-emerald-100 text-emerald-700"
    };
    return colors[status];
  };

  const getStatusLabel = (status: Sale['status']) => {
    const labels = {
      completed: "Completada"
    };
    return labels[status];
  };

  const handleViewDetail = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailDialogOpen(true);
  };

  const handleDownloadPDF = (sale: Sale) => {
    const client = getClientById(sale.clientId);
    toast.success(`Generando PDF de la venta #${sale.id.toString().padStart(4, '0')} - ${client?.name || 'N/A'}`);
    // Aquí iría la lógica para generar el PDF
  };

  const totalRevenue = filteredSales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0);
  const completedSales = filteredSales.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#78D1BD]" />
            <h1 className="text-gray-900">Gestión de Ventas</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {completedSales} completadas • ${totalRevenue.toFixed(2)} total
          </p>
        </div>
        {userRole !== 'client' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button 
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Venta
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Venta</DialogTitle>
                <DialogDescription>
                  Completa la información de la venta
                </DialogDescription>
              </DialogHeader>
              
              <Tabs value={saleType} onValueChange={(value: string) => handleSaleTypeChange(value as 'appointment' | 'direct')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="direct" className="text-sm">Venta Directa</TabsTrigger>
                  <TabsTrigger value="appointment" className="text-sm">Desde Cita</TabsTrigger>
                </TabsList>

                <TabsContent value="direct" className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nombre del Cliente *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agregar Servicios *</Label>
                    <Select onValueChange={(value: string) => addService(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableServices.map(service => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name} - ${service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.selectedServices.length > 0 && (
                    <Card>
                      <CardContent className="p-3 space-y-2">
                        {formData.selectedServices.map((item) => (
                          <div key={item.serviceId} className="flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <p className="text-gray-900">{item.serviceName}</p>
                              <p className="text-xs text-gray-500">${item.price} c/u</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.serviceId, parseInt(e.target.value))}
                                className="w-16 h-7 text-sm"
                              />
                              <span className="text-gray-900 w-16 text-right">${item.price * item.quantity}</span>
                              <button
                                onClick={() => removeService(item.serviceId)}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount">Descuento ($)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Método de Pago *</Label>
                      <Select 
                        value={formData.paymentMethod}
                        onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {parseFloat(formData.discount) > 0 && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Descuento:</span>
                        <span className="text-red-600">-${parseFloat(formData.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appointment" className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="appointment">Seleccionar Cita *</Label>
                    <Select 
                      value={formData.appointmentId?.toString() || ""} 
                      onValueChange={handleAppointmentSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Buscar cita..." />
                      </SelectTrigger>
                      <SelectContent>
                        {appointments.filter(app => app.status === 'confirmed' || app.status === 'completed').map(appointment => (
                          <SelectItem key={appointment.id} value={appointment.id.toString()}>
                            <div className="flex flex-col py-1">
                              <span className="text-sm">{appointment.clientName} - {appointment.service}</span>
                              <span className="text-xs text-gray-500">{appointment.date.toLocaleDateString('es-ES')} - {appointment.time}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.selectedServices.length > 0 && (
                    <Card>
                      <CardContent className="p-3 space-y-2">
                        {formData.selectedServices.map((item) => (
                          <div key={item.serviceId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-900">{item.serviceName}</span>
                            <span className="text-gray-900">${item.price * item.quantity}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount2">Descuento ($)</Label>
                      <Input
                        id="discount2"
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod2">Método de Pago *</Label>
                      <Select 
                        value={formData.paymentMethod}
                        onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button 
                  className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
                  onClick={handleRegisterSale}
                >
                  Registrar Venta
                </Button>
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
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterStatus} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPayment} onValueChange={handlePaymentFilterChange}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Tarjeta de Crédito">Tarjeta</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Header - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-2">Número</div>
        <div className="col-span-3">Cliente</div>
        <div className="col-span-2">Total</div>
        <div className="col-span-2">Fecha</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-1 text-right">Acciones</div>
      </div>

      {/* Sales List - Table Rows */}
      <div className="space-y-1">
        {paginatedSales.map((sale) => {
          return (
            <div key={sale.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              {/* Main Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
                {/* Número */}
                <div className="lg:col-span-2 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-900">#{sale.id.toString().padStart(4, '0')}</span>
                </div>

                {/* Cliente */}
                <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 lg:hidden" />
                  <span className="text-sm text-gray-900 truncate">{getClientById(sale.clientId)?.name || 'N/A'}</span>
                </div>

                {/* Total */}
                <div className="lg:col-span-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-900">${sale.total.toFixed(2)}</span>
                    {sale.discount > 0 && (
                      <p className="text-xs text-green-600">-${sale.discount.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                {/* Fecha */}
                <div className="lg:col-span-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {new Date(sale.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Estado */}
                <div className="lg:col-span-2">
                  <Badge className={`${getStatusColor(sale.status)} text-xs px-2 py-0 h-5`}>
                    {getStatusLabel(sale.status)}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="lg:col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleViewDetail(sale)}
                    className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                    title="Ver detalle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(sale)}
                    className="p-1 hover:bg-green-50 rounded text-green-600 transition-colors"
                    title="Descargar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSales.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron ventas</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredSales.length)} de {filteredSales.length}
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

      {/* Sale Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Venta #{selectedSale?.id.toString().padStart(4, '0')}</DialogTitle>
            <DialogDescription>
              Información completa de la transacción
            </DialogDescription>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-4">
              {/* Estado y Fecha */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(selectedSale.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <Badge className={`${getStatusColor(selectedSale.status)} text-xs px-2 py-0 h-5`}>
                  {getStatusLabel(selectedSale.status)}
                </Badge>
              </div>

              {/* Información del Cliente y Empleado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Información del Cliente */}
                <Card className="border-[#78D1BD]/30 bg-gradient-to-br from-[#78D1BD]/5 to-transparent">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-[#78D1BD]" />
                      <h3 className="text-gray-900">Información del Cliente</h3>
                    </div>
                    {(() => {
                      const client = getClientById(selectedSale.clientId);
                      return client ? (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Nombre</p>
                              <p className="text-sm text-gray-900">{client.name}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <IdCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Documento</p>
                              <p className="text-sm text-gray-900">{client.document}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Correo</p>
                              <p className="text-sm text-gray-900">{client.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Teléfono</p>
                              <p className="text-sm text-gray-900">{client.phone}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Cliente no encontrado</p>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Información del Empleado */}
                <Card className="border-[#60A5FA]/30 bg-gradient-to-br from-[#60A5FA]/5 to-transparent">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-5 h-5 text-[#60A5FA]" />
                      <h3 className="text-gray-900">Información del Empleado</h3>
                    </div>
                    {(() => {
                      const employee = getEmployeeById(selectedSale.employeeId);
                      return employee ? (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Nombre</p>
                              <p className="text-sm text-gray-900">{employee.name}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <IdCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Documento</p>
                              <p className="text-sm text-gray-900">{employee.document}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Correo</p>
                              <p className="text-sm text-gray-900">{employee.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Teléfono</p>
                              <p className="text-sm text-gray-900">{employee.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Cargo</p>
                              <p className="text-sm text-gray-900">{employee.position}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Empleado no encontrado</p>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Servicios */}
              <div>
                <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-gray-400" />
                  Servicios
                </h3>
                <Card>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {selectedSale.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm text-gray-900">{item.serviceName}</p>
                            <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                          </div>
                          <p className="text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumen de Pago */}
              <div>
                <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  Resumen de Pago
                </h3>
                <Card>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">${selectedSale.subtotal.toFixed(2)}</span>
                      </div>
                      {selectedSale.discount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Descuento:</span>
                          <span className="text-green-600">-${selectedSale.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-gray-900">${selectedSale.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Método de pago:</span>
                        <Badge variant="outline" className="text-xs">{selectedSale.paymentMethod}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Sale Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F87171]" />
              ¿Anular Venta?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La venta será marcada como cancelada en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSale}
              className="bg-[#F87171] hover:bg-[#EF4444]"
            >
              Anular Venta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
