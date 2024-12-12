import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";
import { Button } from '../componentes/ui/button.tsx';
import { Input } from '../componentes/ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import axios from 'axios';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'formacion' | 'estudiante' | 'usuario' | 'competencia';
  onSave?: (data: any) => void;
}

interface Competencia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string; // Opcional
}

export default function AddModal({ isOpen, onClose, type, onSave }: AddModalProps) {
  const [formData, setFormData] = useState({});
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [selectedCompetencias, setSelectedCompetencias] = useState<number[]>([]); // Competencias seleccionadas
  const [showCompetencias, setShowCompetencias] = useState(false);
  useEffect(() => {
    if (type === 'competencia') {
      setFormData({ 
        codigo: '', 
        nombre: '', 
        descripcion: '' 
      });
    } else if (type === 'estudiante') {
      setFormData({
        rut: '',
        nombreCompleto: '',
        unidad: '',
        carrera: '',
        correo: '',
        sedeEstudiante: '',
        egresado: false,
      });
    } else if (type === 'usuario') {
      setFormData({ 
        nombre: '', 
        rut: '', 
        correo: '', 
        clave: '', 
        tipo: '' 
      });
    } else if (type === 'formacion') {
      setFormData({
        sedeFormacion: "",
        nombre: "",
        modalidad: "",
        semestre: "",
        profesorRelator: "",
        fechaInicio: "",
        fechaTermino: "",
        estado: "Activa", // Valor predeterminado
        competencias: [],
      });

      fetchCompetencias();
    }
  }, [type]);

  const fetchCompetencias = async () => {
    try {
      const response = await axios.get<Competencia[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/competencias`);
      setCompetencias(response.data);
    } catch (error) {
      console.error('Error al cargar competencias:', error);
    }
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompetenciaSelect = (codigo: string) => {
    const competencia = competencias.find(comp => comp.codigo === codigo);
    if (competencia && !selectedCompetencias.includes(competencia.id)) {
      setSelectedCompetencias((prev) => [...prev, competencia.id]);
    }
    setShowCompetencias(false); // Cerrar modal después de seleccionar
  };

  const handleCompetenciaRemove = (id: number) => {
    setSelectedCompetencias((prev) => prev.filter((compId) => compId !== id));
  };




  async function addData(endpoint: string, data: any) {
    try {
      const response = await axios.post(endpoint, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
    if (onSave) onSave(data);
    onClose();
    window.location.reload();
  }

  const handleSubmit = (e: React.FormEvent) => {
    
    console.log(`data usuario enviar ${process.env.NEXT_PUBLIC_API_BASE_URL}`)
    e.preventDefault();
    if (type === 'competencia') {
      addData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/competencias`, formData);
    } else if (type === 'estudiante') {
      addData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/estudiantes`, formData);
    } else if (type === 'usuario') {
      addData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/usuarios`, formData);
    } else if (type === 'formacion') {
      addData(`${process.env.NEXT_PUBLIC_API_BASE_URL}/formaciones`, formData);
      const formacionData = {
        ...formData,
        competencias: selectedCompetencias // Incluir competencias seleccionadas
      };
      console.log('Enviando datos de formación:', formacionData);
      addData('http://localhost:3001/formaciones', formacionData);
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'competencia':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" name="codigo" onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input id="descripcion" name="descripcion" onChange={handleInputChange} />
            </div>
            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Agregar Competencia</Button>
            </div>
          </form>
        );
      case 'estudiante':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input id="rut" name="rut" onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombreCompleto">Nombre Completo</Label>
              <Input id="nombreCompleto" name="nombreCompleto" onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad</Label>
              <Input id="unidad" name="unidad" onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carrera">Carrera</Label>
              <Input id="carrera" name="carrera" onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input type="email" id="correo" name="correo" onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sedeEstudiante">Sede</Label>
              <Select name="sedeEstudiante" onValueChange={(value) => handleSelectChange("sedeEstudiante", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sede del estudiante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coquimbo">Coquimbo</SelectItem>
                  <SelectItem value="Antofagasta">Antofagasta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="egresado">Egresado</Label>
              <Select name="egresado" onValueChange={(value) => handleSelectChange("egresado", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="¿El estudiante egresó?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Si</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Agregar Estudiante
              </Button>
            </div>
          </form> 
        )

      case 'usuario':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input id="rut" name="rut" onChange={handleInputChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input id="correo" name="correo" onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clave">Contraseña</Label>
              <Input type='password' id="clave" name="clave" onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select name="tipo" onValueChange={(value) => handleSelectChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Usuario">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Agregar Usuario
              </Button>
            </div>
          </form>
        );
      case 'formacion':
        return (
          <div className="max-h-screen overflow-y-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sedeFormacion">Sede</Label>
                <Select name="sedeFormacion" onValueChange={(value) => handleSelectChange("sedeFormacion", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sede" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Antofagasta">Antofagasta</SelectItem>
                    <SelectItem value="Coquimbo">Coquimbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
        
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Select
                  name="nombre"
                  onValueChange={(value) => handleSelectChange("nombre", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de formación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Formación Inicial">Formación Inicial</SelectItem>
                    <SelectItem value="Formación Avanzada">Formación Avanzada</SelectItem>
                    <SelectItem value="Formación Especializada">Formación Especializada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
        
              {/* Modalidad */}
              <div className="space-y-2">
                <Label htmlFor="modalidad">Modalidad</Label>
                <Select name="modalidad" onValueChange={(value) => handleSelectChange("modalidad", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="B-Learning">B-Learning</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
        
              {/* Periodo */}
              <div className="space-y-2">
                <Label htmlFor="semestre">Periodo</Label>
                <Input id="semestre" name="semestre" onChange={handleInputChange} />
              </div>
        
              {/* Relator */}
              <div className="space-y-2">
                <Label htmlFor="profesorRelator">Relator</Label>
                <Input id="profesorRelator" name="profesorRelator" onChange={handleInputChange} />
              </div>
        
              {/* Fecha inicio */}
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input type="date" id="fechaInicio" name="fechaInicio" onChange={handleInputChange} />
              </div>
        
              {/* Fecha termino */}
              <div className="space-y-2">
                <Label htmlFor="fechaTermino">Fecha de Término</Label>
                <Input type="date" id="fechaTermino" name="fechaTermino" onChange={handleInputChange} />
              </div>
        
              {/* Competencias */}
              {/* Nueva sección para gestionar competencias */}
              <div className="space-y-4">
                <Label>Competencias:</Label>
                <Button variant="outline" onClick= {(e) => { e.preventDefault();  setShowCompetencias(true)}}>
                  Añadir Competencia
                </Button>
                <div className="mt-2">
                  {selectedCompetencias.map((codigo) => (
                    <div key={codigo} className="flex justify-between items-center">
                      <span>{codigo}</span>
                      <Button
                        variant="outline"
                        onClick={() => handleCompetenciaRemove(codigo)}
                      >
                        Quitar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
        
              {/* Modal para seleccionar competencias */}
              {showCompetencias && (
                <Dialog open={showCompetencias} onOpenChange={() => setShowCompetencias(false)}>
                  <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                      <DialogTitle>Seleccionar Competencia</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-2">
                      {competencias.map((competencia) => (
                        <div key={competencia.codigo} className="flex justify-between items-center">
                          <span>{competencia.nombre}</span>
                          <Button
                            variant="outline"
                            onClick={() => handleCompetenciaSelect(competencia.codigo)}
                          >
                            Agregar
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCompetencias(false)}>
                        Cerrar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Agregar Formación
                </Button>
              </div>
              </form>
          </div>
        )
      default:
        return <p>Tipo de formulario no reconocido</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Agregar {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">{renderForm()}</div>
      </DialogContent>
    </Dialog>
  );
}
