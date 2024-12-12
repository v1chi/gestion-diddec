import React, { useState, useEffect } from "react";
import { Button } from "../componentes/ui/button.tsx";
import { Input } from "../componentes/ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../componentes/ui/select.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";
import axios from "axios";

interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'formacion' | 'estudiante' | 'usuario' | 'competencia';
  onSave: (data: any) => void;
}

export default function EditDetailsModal({ isOpen, onClose, data, type, onSave }: EditDetailsModalProps) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      let updatedData: Record<string, any> = {};
      let endpoint = "";
  
      if (type === "estudiante") {
        updatedData = {
          nombreCompleto: formData.nombreCompleto,
          unidad: formData.unidad,
          carrera: formData.carrera,
          sedeEstudiante: formData.sedeEstudiante,
          egresado: formData.egresado === "true",
        };
        endpoint = "estudiantes";
      } else if (type === "usuario") {
        updatedData = {
          rut: formData.rut,
          nombre: formData.nombre,
          correo: formData.correo,
          clave: formData.clave,
          tipo: formData.tipo,
        };
        endpoint = "usuarios";
      } else if (type === "competencia") {
        updatedData = {
          codigo: formData.codigo,
          nombre: formData.nombre,
          descripcion: formData.descripcion
        };
        endpoint = "competencias";
      } else if (type === "formacion") {
        updatedData = {
          sedeFormacion: formData.sedeFormacion,
          nombre: formData.nombre,
          modalidad: formData.modalidad,
          semestre: formData.semestre,
          profesorRelator: formData.profesorRelator,
          fechaInicio: formData.fechaInicio,
          fechaTermino: formData.fechaTermino,
          competencias: formData.competencias.map((c: any) => c.id), // Aquí agregamos las competencias como IDs
        };
        endpoint = "formaciones";
      } else {
        throw new Error("Tipo de recurso no reconocido");
      }
  
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}/${formData.id}`;
      console.log("URL utilizada:", url);
      console.log("Datos actualizados enviados:", updatedData);
  
      const response = await axios.patch(url, updatedData);
      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} actualizado con éxito:`, response.data);
  
      onSave(response.data);
      window.location.reload();
    } catch (error) {
      console.error(`Error al actualizar ${type}:`, error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  const renderForm = () => {
    if (type === "estudiante") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreCompleto">Nombre Completo</Label>
            <Input
              id="nombreCompleto"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidad">Unidad</Label>
            <Input
              id="unidad"
              name="unidad"
              value={formData.unidad}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrera">Carrera</Label>
            <Input
              id="carrera"
              name="carrera"
              value={formData.carrera}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sedeEstudiante">Sede</Label>
            <Select
              name="sedeEstudiante"
              defaultValue={formData.sedeEstudiante}
              onValueChange={(value) =>
                handleSelectChange("sedeEstudiante", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sede" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Antofagasta">Antofagasta</SelectItem>
                <SelectItem value="Coquimbo">Coquimbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="egresado">Egresado</Label>
            <Select
              name="egresado"
              defaultValue={formData.egresado ? "true" : "false"}
              onValueChange={(value) => handleSelectChange("egresado", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="¿El estudiante egresó?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      );
    } else if(type === "usuario"){
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rut">RUT</Label>
            <Input id="rut" name="rut" value={formData.rut} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo</Label>
            <Input id="correo" name="correo" value={formData.correo} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clave">Clave</Label>
            <Input id="clave" name="clave" value={formData.clave} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select name="tipo" defaultValue={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
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
              Guardar Cambios
            </Button>
          </div>
        </form>
      )
    } else if(type === "competencia"){
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" name="codigo" value={formData.codigo} onChange={handleInputChange} />
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} />
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} />
          </div>
  
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cambios
            </Button>
          </div>
        </form>
      )
    } else if (type === "formacion"){
      return (
        <div className="max-h-screen overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sedeFormacion">Sede</Label>
                <Select name="sedeFormacion" defaultValue={formData.sede} onValueChange={(value) =>   handleSelectChange("sedeFormacion", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sede" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Antofagasta">Antofagasta</SelectItem>
                    <SelectItem value="Coquimbo">Coquimbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="modalidad">Modalidad</Label>
                <Select name="modalidad" defaultValue={formData.modalidad} onValueChange={(value) => handleSelectChange("modalidad", value)}>
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

              <div className="space-y-2">
                <Label htmlFor="semestre">Periodo</Label>
                <Input id="semestre" name="semestre" value={formData.periodo} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profesorRelator">Relator</Label>
                <Input id="profesorRelator" name="profesorRelator" value={formData.relator} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input type="date" id="fechaInicio" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaTermino">Fecha de Término</Label>
                <Input type="date" id="fechaTermino" name="fechaTermino" value={formData.fechaTermino} onChange={handleInputChange} />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        )
    }
    return <p>Tipo de formulario no reconocido</p>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
        <DialogTitle>
            Editar {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">{renderForm()}</div>
      </DialogContent>
    </Dialog>
  );
}
