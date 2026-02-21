import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../shared/ui/table";
import { Badge } from "../../shared/ui/badge";
import { Switch } from "../../shared/ui/switch";

import { Plus, Pencil, Trash2, Search, ArrowUpDown, Eye } from "lucide-react";
import { toast } from "sonner";


interface Category {
  id: number;
  name: string;
  description: string;
  servicesCount: number;
  isActive: boolean;
  color: string;
}

interface CategoriesModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function CategoriesModule({ userRole }: CategoriesModuleProps) {


  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'name' | 'servicesCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#78D1BD",
  });

  
const [categories, setCategories] = useState<any[]>([]);

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'name') {
      return a.name.localeCompare(b.name) * order;
    } else {
      return (a.servicesCount - b.servicesCount) * order;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handleCreateOrUpdate = () => {
    if (!formData.name) {
      toast.error("Por favor ingresa el nombre de la categoría");
      return;
    }

    if (editingCategory) {
      setCategories(categories.map(category => 
        category.id === editingCategory.id 
          ? { ...category, ...formData }
          : category
      ));
      toast.success("Categoría actualizada exitosamente");
    } else {
      const newCategory: Category = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        ...formData,
        servicesCount: 0,
        isActive: true
      };
      setCategories([...categories, newCategory]);
      toast.success("Categoría creada exitosamente");
    }

    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", color: "#78D1BD" });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
    });
    setIsDialogOpen(true);
  };

  const handleViewDetail = (category: Category) => {
    setViewingCategory(category);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingCategoryId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingCategoryId) {
      setCategories(categories.filter(category => category.id !== deletingCategoryId));
      toast.success("Categoría eliminada");
      setDeletingCategoryId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleToggleStatus = (id: number) => {
    setCategories(categories.map(category => 
      category.id === id ? { ...category, isActive: !category.isActive } : category
    ));
    toast.success("Estado actualizado");
  };

  const handleSort = (field: 'name' | 'servicesCount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalServices = categories.reduce((sum, cat) => sum + cat.servicesCount, 0);
  const activeCategories = categories.filter(c => c.isActive).length;

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-foreground">Categorías de Servicios</h1>
          <p className="text-muted-foreground">Organiza y clasifica tus servicios</p>
        </div>
        {userRole === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-primary hover:bg-primary/90 text-foreground transition-colors"
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ name: "", description: "", color: "#78D1BD" });
                }}
              >
                <Plus className="w-4 h-4" />
                Nueva Categoría
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Actualiza la información de la categoría" : "Crea una nueva categoría de servicios"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Masajes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe la categoría..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color de Identificación</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#78D1BD"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingCategory(null);
                      setFormData({ name: "", description: "", color: "#78D1BD" });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-foreground"
                    onClick={handleCreateOrUpdate}
                  >
                    {editingCategory ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
          <CardDescription>{filteredCategories.length} categoría(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Color</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 -ml-4"
                  >
                    Nombre
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('servicesCount')}
                    className="flex items-center gap-2 -ml-4"
                  >
                    Servicios
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>Estado</TableHead>
                {userRole === 'admin' && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="text-foreground">{category.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.servicesCount} servicios</Badge>
                  </TableCell>
                  <TableCell>
                    {userRole === 'admin' ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={() => handleToggleStatus(category.id)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {category.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    ) : (
                      <Badge className={category.isActive ? "bg-primary text-foreground" : "bg-gray-500"}>
                        {category.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    )}
                  </TableCell>
                  {userRole === 'admin' && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(category)}
                          className="h-8 w-8"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          className="h-8 w-8"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(category.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredCategories.length)} de {filteredCategories.length}
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Categoría</DialogTitle>
            <DialogDescription>
              Información completa de la categoría
            </DialogDescription>
          </DialogHeader>
          {viewingCategory && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-white shadow-md flex-shrink-0"
                  style={{ backgroundColor: viewingCategory.color }}
                />
                <div className="flex-1">
                  <p className="text-foreground">{viewingCategory.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {viewingCategory.id}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="text-foreground mt-1">{viewingCategory.description}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Color de Identificación</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-8 h-8 rounded border-2 border-white shadow-sm"
                      style={{ backgroundColor: viewingCategory.color }}
                    />
                    <p className="text-foreground">{viewingCategory.color}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Cantidad de Servicios</Label>
                  <p className="text-foreground mt-1">{viewingCategory.servicesCount} servicios</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="mt-1">
                    <Badge className={viewingCategory.isActive ? "bg-primary text-foreground" : "bg-gray-500"}>
                      {viewingCategory.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}