import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Users, Calendar, ArrowUp, Download, Sparkles, Filter, CheckCircle } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { toast } from "sonner";


export function Dashboard() {
  const [periodFilter, setPeriodFilter] = useState("30days");
  const [isFiltering, setIsFiltering] = useState(false);

  // Mock data for charts
  const salesData = [
    { month: 'Ene', ventas: 12000, servicios: 45 },
    { month: 'Feb', ventas: 15000, servicios: 52 },
    { month: 'Mar', ventas: 18000, servicios: 61 },
    { month: 'Abr', ventas: 16500, servicios: 58 },
    { month: 'May', ventas: 22000, servicios: 75 },
    { month: 'Jun', ventas: 25000, servicios: 82 },
  ];

  const servicesData = [
    { name: 'Masajes', value: 35, revenue: 15000 },
    { name: 'Faciales', value: 25, revenue: 10000 },
    { name: 'Manicure', value: 20, revenue: 7000 },
    { name: 'Spa Bar', value: 15, revenue: 5000 },
    { name: 'Otros', value: 5, revenue: 3000 },
  ];

  const COLORS = ['#78D1BD', '#A78BFA', '#60A5FA', '#FBBF24', '#F87171'];

  const statsCards = [
    {
      title: 'Ventas Totales',
      value: '$108,500',
      change: '+12.5%',
      icon: DollarSign,
      trend: 'up',
      color: 'from-emerald-400 to-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Clientes Activos',
      value: '1,245',
      change: '+8.2%',
      icon: Users,
      trend: 'up',
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Citas del Mes',
      value: '373',
      change: '+15.3%',
      icon: Calendar,
      trend: 'up',
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Servicios Completados',
      value: '328',
      change: '+18.7%',
      icon: CheckCircle,
      trend: 'up',
      color: 'from-amber-400 to-amber-500',
      bgColor: 'bg-amber-50'
    },
  ];

  // Función para filtrar datos según el período
  const getFilteredData = () => {
    // Aquí podrías ajustar los datos según el filtro
    // Por ahora retornamos los datos mock, pero podrías filtrarlos según periodFilter
    switch (periodFilter) {
      case "7days":
        return salesData.slice(-2); // Últimos 2 meses como ejemplo
      case "30days":
        return salesData.slice(-3); // Últimos 3 meses
      case "90days":
        return salesData.slice(-4); // Últimos 4 meses
      case "year":
        return salesData; // Todos los datos
      default:
        return salesData;
    }
  };

  // Función para obtener el label del período
  const getPeriodLabel = () => {
    switch (periodFilter) {
      case "7days":
        return "Últimos 7 días";
      case "30days":
        return "Últimos 30 días";
      case "90days":
        return "Últimos 90 días";
      case "year":
        return "Este año";
      default:
        return "Período seleccionado";
    }
  };

  // Función para ajustar estadísticas según el filtro
  const getAdjustedStats = () => {
    const multipliers = {
      "7days": 0.25,
      "30days": 1,
      "90days": 3,
      "year": 12
    };
    
    const multiplier = multipliers[periodFilter as keyof typeof multipliers] || 1;

    
    return statsCards.map(stat => {
      if (stat.title === "Ventas Totales") {
        const baseValue = 108500;
        const newValue = Math.round(baseValue * multiplier);
        return { ...stat, value: `$${newValue.toLocaleString()}` };
      }
      if (stat.title === "Citas del Mes") {
        const baseValue = 373;
        const newValue = Math.round(baseValue * multiplier);
        return { ...stat, value: newValue.toString() };
      }
      if (stat.title === "Servicios Completados") {
        const baseValue = 328;
        const newValue = Math.round(baseValue * multiplier);
        return { ...stat, value: newValue.toString() };
      }
      return stat;
    });
  };

  const filteredSalesData = getFilteredData();
  const adjustedStats = getAdjustedStats();

  // Función para manejar cambio de filtro
  const handleFilterChange = (value: string) => {
    setPeriodFilter(value);
    setIsFiltering(true);
  };

  // Efecto para mostrar notificación al cambiar filtro
  useEffect(() => {
    if (isFiltering) {
      toast.success(`Filtro aplicado: ${getPeriodLabel()}`, {
        duration: 2000,
      });
      setIsFiltering(false);
    }
  }, [isFiltering, periodFilter]);

  // Función para generar PDF
  const handleExportPDF = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          // Generar contenido HTML para el PDF
          const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reporte Dashboard - HIGHLIFE SPA & BAR</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  padding: 40px; 
                  color: #1f2937;
                  line-height: 1.6;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 40px; 
                  border-bottom: 3px solid #78D1BD;
                  padding-bottom: 20px;
                }
                .header h1 { 
                  color: #78D1BD; 
                  font-size: 32px; 
                  margin-bottom: 10px;
                  font-weight: 700;
                }
                .header p { 
                  color: #6b7280; 
                  font-size: 16px;
                }
                .meta-info {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 30px;
                  padding: 20px;
                  background: #f9fafb;
                  border-radius: 12px;
                }
                .meta-item {
                  text-align: center;
                }
                .meta-label {
                  font-size: 12px;
                  color: #6b7280;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  margin-bottom: 5px;
                }
                .meta-value {
                  font-size: 18px;
                  font-weight: 700;
                  color: #1f2937;
                }
                .stats-grid { 
                  display: grid; 
                  grid-template-columns: repeat(2, 1fr); 
                  gap: 20px; 
                  margin-bottom: 40px; 
                }
                .stat-card { 
                  padding: 25px; 
                  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); 
                  border-radius: 12px; 
                  border-left: 4px solid #78D1BD;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .stat-title { 
                  font-size: 14px; 
                  color: #6b7280; 
                  margin-bottom: 10px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .stat-value { 
                  font-size: 32px; 
                  font-weight: 700; 
                  color: #1f2937;
                  margin-bottom: 8px;
                }
                .stat-change {
                  font-size: 14px;
                  color: #10b981;
                  font-weight: 600;
                }
                .section { 
                  margin-bottom: 40px; 
                }
                .section-title { 
                  font-size: 24px; 
                  color: #1f2937; 
                  margin-bottom: 20px; 
                  font-weight: 700;
                  padding-left: 15px;
                  border-left: 4px solid #A78BFA;
                }
                .table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  background: white;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .table th { 
                  background: linear-gradient(135deg, #78D1BD 0%, #5FBFAA 100%); 
                  color: white; 
                  padding: 15px; 
                  text-align: left; 
                  font-weight: 600;
                  font-size: 14px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .table td { 
                  padding: 15px; 
                  border-bottom: 1px solid #f3f4f6;
                  color: #4b5563;
                }
                .table tr:last-child td { 
                  border-bottom: none; 
                }
                .table tr:nth-child(even) {
                  background: #f9fafb;
                }
                .footer { 
                  text-align: center; 
                  margin-top: 50px; 
                  padding-top: 20px; 
                  border-top: 2px solid #e5e7eb; 
                  color: #6b7280; 
                  font-size: 12px;
                }
                .highlight {
                  display: inline-block;
                  padding: 4px 12px;
                  background: #dbeafe;
                  color: #1e40af;
                  border-radius: 6px;
                  font-weight: 600;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🌟 HIGHLIFE SPA & BAR</h1>
                <p>Reporte Analítico de Dashboard</p>
              </div>
              
              <div class="meta-info">
                <div class="meta-item">
                  <div class="meta-label">Período</div>
                  <div class="meta-value">${getPeriodLabel()}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Fecha de Generación</div>
                  <div class="meta-value">${new Date().toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Hora</div>
                  <div class="meta-value">${new Date().toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
              </div>

              <div class="stats-grid">
                ${adjustedStats.map(stat => `
                  <div class="stat-card">
                    <div class="stat-title">${stat.title}</div>
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-change">↗ ${stat.change} vs período anterior</div>
                  </div>
                `).join('')}
              </div>

              <div class="section">
                <h2 class="section-title">📊 Evolución de Ventas</h2>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Ventas ($)</th>
                      <th>Servicios</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredSalesData.map(item => `
                      <tr>
                        <td>${item.month}</td>
                        <td>${item.ventas.toLocaleString()}</td>
                        <td>${item.servicios} servicios</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="section">
                <h2 class="section-title">🏆 Ranking de Servicios</h2>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Posición</th>
                      <th>Servicio</th>
                      <th>Cantidad</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${servicesData.map((service, index) => `
                      <tr>
                        <td><span class="highlight">#${index + 1}</span></td>
                        <td>${service.name}</td>
                        <td>${service.value} servicios</td>
                        <td>${service.revenue.toLocaleString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="footer">
                <p>Este reporte ha sido generado automáticamente por el sistema HIGHLIFE SPA & BAR</p>
                <p>© ${new Date().getFullYear()} HIGHLIFE SPA & BAR - Todos los derechos reservados</p>
              </div>
            </body>
            </html>
          `;
          
          resolve(htmlContent);
        }, 1500);
      }),
      {
        loading: 'Generando reporte PDF...',
        success: (htmlContent) => {
          // Crear y descargar el archivo HTML (que se puede convertir a PDF)
          const blob = new Blob([htmlContent as string], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-dashboard-highlife-spa-${new Date().toISOString().split('T')[0]}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          return '¡Reporte generado exitosamente! Se puede imprimir como PDF desde el navegador.';
        },
        error: 'Error al generar el reporte',
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-[#78D1BD]" />
            <h1 className="text-gray-900">Dashboard Analítico</h1>
          </div>
          <p className="text-gray-600">Vista general del rendimiento del spa</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Select value={periodFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-40 rounded-lg border-gray-200 bg-white">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 días</SelectItem>
                <SelectItem value="30days">Últimos 30 días</SelectItem>
                <SelectItem value="90days">Últimos 90 días</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {adjustedStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-xs px-2 py-0.5">
                    <ArrowUp className="w-3 h-3" />
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{getPeriodLabel()}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="w-1 h-6 bg-[#78D1BD] rounded-full"></div>
              Análisis de Ventas
            </CardTitle>
            <CardDescription className="text-gray-600">Evolución de ventas mensuales en USD</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {getPeriodLabel()}
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '0.75rem', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontWeight: '500'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#78D1BD" 
                  strokeWidth={3}
                  name="Ventas ($)"
                  dot={{ fill: '#78D1BD', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Services Distribution */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="w-1 h-6 bg-[#A78BFA] rounded-full"></div>
              Distribución de Servicios
            </CardTitle>
            <CardDescription className="text-gray-600">Servicios más solicitados - {getPeriodLabel()}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={servicesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {servicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '0.75rem', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontWeight: '500'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Services Revenue Bar Chart */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            Ingresos por Servicio
          </CardTitle>
          <CardDescription className="text-gray-600">Análisis de rentabilidad - {getPeriodLabel()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={servicesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px', fontWeight: '500' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: '12px', fontWeight: '500' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '0.75rem', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontWeight: '500'
                }} 
              />
              <Bar 
                dataKey="revenue" 
                fill="#78D1BD" 
                name="Ingresos ($)" 
                radius={[8, 8, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
            Ranking de Servicios
          </CardTitle>
          <CardDescription className="text-gray-600">Top 5 servicios más rentables - {getPeriodLabel()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {servicesData.map((service, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-sm transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.value} servicios realizados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">${service.revenue.toLocaleString()}</p>
                  <Badge variant="outline" className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5">
                    Ingresos
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}