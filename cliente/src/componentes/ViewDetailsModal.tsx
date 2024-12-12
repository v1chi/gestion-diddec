import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx"
import { Button } from './ui/button.tsx';
import { Table, TableBody, TableRow, TableHeader, TableHead, TableFooter, TableCaption, TableCell } from './ui/table.js';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'formacion' | 'estudiante' | 'usuario' | 'competencia';
}

export default function ViewDetailsModal({ isOpen, onClose, data, type }: ViewDetailsModalProps) {
  if (!data) return null

  const renderDetails = () => {
    switch (type) {
      case 'formacion':
        return (
          <div className="space-y-2">
            <p><strong>ID:</strong> {data.id}</p>
            <p><strong>Sede:</strong> {data.sede}</p>
            <p><strong>Nombre:</strong> {data.nombre}</p>
            <p><strong>Modalidad:</strong> {data.modalidad}</p>
            <p><strong>Periodo:</strong> {data.semestre}</p>
            <p><strong>Estado:</strong> {data.estado}</p>
            <p><strong>Relator:</strong> {data.profesorRelator}</p>
            <p><strong>Fecha de Inicio:</strong> {new Date(data.fechaInicio).toLocaleDateString()}</p>
            <p><strong>Fecha de Término:</strong> {new Date(data.fechaTermino).toLocaleDateString()}</p>
            <p><strong>Aprobados:</strong> {data.aprobados}</p>
            <p><strong>Reprobados:</strong> {data.reprobados}</p>
            <p><strong>Deserción:</strong> {data.desercion}</p>
            <p><strong>Total:</strong> {data.total}</p>
            <p><strong>Competencias:</strong></p>
            <ul>
              {data.competencias && data.competencias.length > 0 ? (
                data.competencias.map((comp: any, index: number) => (
                  <li key={index}>{comp.nombre}</li>
                ))
              ) : (
                <p>No hay competencias asociadas</p>
              )}
            </ul>
          </div>
        )
      case 'estudiante':
        return (
          <div className="space-y-2">
            <p><strong>RUT:</strong> {data.rut}</p>
            <p><strong>Nombre:</strong> {data.nombreCompleto}</p>
            <p><strong>Unidad:</strong> {data.unidad}</p>
            <p><strong>Carrera:</strong> {data.carrera}</p>
            <p><strong>Correo:</strong> {data.correo}</p>
            <p><strong>Sede:</strong> {data.sedeEstudiante}</p>
            <p><strong>Egresado:</strong> {data.egresado ? 'Sí' : 'No'}</p>
          </div>
        )
      case 'usuario':
        return (
          <div className="space-y-2">
            <p><strong>Tipo:</strong> {data.tipo}</p>
            <p><strong>RUT:</strong> {data.rut}</p>
            <p><strong>Nombre:</strong> {data.nombre}</p>
            <p><strong>Correo:</strong> {data.correo}</p>
          </div>
        )
      case 'competencia':
        return (
          <div className="space-y-2">
            <p><strong>Código:</strong> {data.codigo}</p>
            <p><strong>Nombre:</strong> {data.nombre}</p>
            <p><strong>Descripción:</strong> {data.descripcion}</p>
          </div>
        )
      default:
        return <p>Tipo de detalle no reconocido</p>
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      >
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            Detalles de {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader> 
        <div className="mt-4">
          {renderDetails()}
        </div>
      </DialogContent>
    </Dialog>
  )
}