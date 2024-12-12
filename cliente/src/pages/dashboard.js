  import React, { useState, useEffect } from 'react'
  import axios from 'axios'
  import { Home, Book, Users, UserPlus, FileText, BarChart2, Award, Trash2, Eye, Edit, MoreVertical, Plus, Download, Filter } from 'lucide-react'
  import { Button } from '../componentes/ui/button.tsx'
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../componentes/ui/table.js'
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../componentes/ui/select.tsx'
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../componentes/ui/dropdown-menu.js'
  import AddModal from '../componentes/AddModal.tsx'
  import ViewDetailsModal from '../componentes/ViewDetailsModal.tsx'
  import EditDetailsModal from '../componentes/EditDetailsModal.tsx'
  import { Input } from '../componentes/ui/input.tsx'
  import { format } from 'date-fns';
  import * as XLSX from "xlsx";

  const reporteParticipantes = [
    { rutEstudiante: "12345678-9", nombre: "Juan Pérez", correo: "juan.perez@example.com", carrera: "Ingeniería Civil", nombreFormacion: "Formación avanzada", periodo: "2024-II", estado: "Aprobado", fechaInicio: "2024-08-21", fechaTermino: "2024-09-15" },
    { rutEstudiante: "98765432-1", nombre: "María González", correo: "maria.gonzalez@example.com", carrera: "Psicología", nombreFormacion: "Formación inicial", periodo: "2024-II", estado: "Aprobado", fechaInicio: "2024-09-27", fechaTermino: "2024-10-08" },
  ]

  export default function MainLayout() {
    const [activeSection, setActiveSection] = useState('home')
    const [formaciones, setFormaciones] = useState([])
    const [filteredFormaciones, setFilteredFormaciones] = useState(formaciones)
    const [filteredParticipantes, setFilteredParticipantes] = useState(reporteParticipantes)
    const [filters, setFilters] = useState({})
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [modalType, setModalType] = useState('')
    const [usuarios, setUsuarios] = useState([])
    const [estudiantes, setEstudiantes] = useState([])
    const [competencias, setCompetencias] = useState([]);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [selectedFormacion, setSelectedFormacion] = useState(null);
    const [participantes, setParticipantes] = useState([]);
    const [activeView, setActiveView] = useState(null); // Vista activa: asistencias, participantes, constancias
    const [activeData, setActiveData] = useState([]); // Datos dinámicos de la vista activa
    
    async function fetchEstudiantes() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/estudiantes`);

        setEstudiantes(response.data);
        setFilteredParticipantes(response.data);
      } catch (error) {
        console.error('Error al obtener los estudiantes:', error);
        return [];
      }
    }

    async function fetchUsuarios() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/usuarios`);
        setUsuarios(response.data);
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        return [];
      }
    }

    async function fetchCompetencias() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/competencias`);
        setCompetencias(response.data);
      } catch (error) {
        console.error('Error al obtener las competencias:', error);
        return [];
      }
    }

    async function fetchFormaciones() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/formaciones`);
        setFormaciones(response.data);
        setFilteredFormaciones(response.data);
      } catch (error) {
        console.error('Error al obtener las formaciones:', error);
        return [];
      }
    }

    async function fetchParticipantes() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/estudiantes-formaciones`);
        setParticipantes(response.data);
        setFilteredParticipantes(response.data); // Por defecto, mostrar todos los datos
      } catch (error) {
        console.error('Error al obtener los participantes:', error);
      }
    }
    

    useEffect(() => {
      fetchUsuarios();
      fetchEstudiantes();
      fetchCompetencias();
      fetchFormaciones();
      fetchParticipantes();
    }, []);

    const handleAsociar = async () => {
      if (!selectedEstudiante || !selectedFormacion) {
        alert('Por favor, selecciona un estudiante y una formación.');
        return;
      }
    
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/estudiantes-formaciones`, {
          estudianteId: selectedEstudiante,
          formacionId: selectedFormacion,
          estado: 'en curso', // Puedes cambiar el estado inicial si lo deseas
        });
    
        alert('Estudiante asociado exitosamente con la formación.');
        console.log('Respuesta del servidor:', response.data);
      } catch (error) {
        console.error('Error al asociar el estudiante con la formación:', error);
        alert('Hubo un error al realizar la asociación. Por favor, inténtalo de nuevo.');
      }
    };

    const handleFilterChange = (key, value, dataType) => {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      
      if (dataType === 'formaciones') {
        const filtered = formaciones.filter(formacion => 
          Object.entries(newFilters).every(([k, v]) => 
            v === '' || formacion[k].toString().toLowerCase().includes(v.toLowerCase())
          )
        )
        setFilteredFormaciones(filtered)
      } else if (dataType === 'participantes') {
        const filtered = participantes.filter((participante) => {
          const { estudiante, formacion } = participante;
    
          return Object.entries(newFilters).every(([k, v]) => {
            if (v === "") return true;
    
            // Filtrar por campos de estudiante
            if (k.startsWith("estudiante.") && estudiante) {
              const field = k.replace("estudiante.", "");
              return (
                estudiante[field] &&
                estudiante[field].toString().toLowerCase().includes(v.toLowerCase())
              );
            }
    
            // Filtrar por campos de formacion
            if (k.startsWith("formacion.") && formacion) {
              const field = k.replace("formacion.", "");
              return (
                formacion[field] &&
                formacion[field].toString().toLowerCase().includes(v.toLowerCase())
              );
            }
    
            return false;
          });
        });
    
        setFilteredParticipantes(filtered);
      }
    }

    const exportToExcelFormaciones = () => {
      const worksheet = XLSX.utils.json_to_sheet(filteredFormaciones);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ReporteFormaciones');
      XLSX.writeFile(workbook, 'ReporteFormaciones.xlsx');
    }

    const exportToExcelEstudiante = () => {
      const worksheet = XLSX.utils.json_to_sheet(filteredParticipantes);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ReporteParticipantes');
      XLSX.writeFile(workbook, 'ReporteParticipantes.xlsx');
    };

    const handleAdd = (type) => {
      setModalType(type)
      setIsAddModalOpen(true)
    }

    const handleView = (item, type) => {
      setSelectedItem(item)
      setModalType(type)
      setIsViewModalOpen(true)
    }

    const handleEdit = (item, type) => {
      setSelectedItem(item)
      setModalType(type)
      setIsEditModalOpen(true)
    }
  };

  const renderActiveView = () => {
    if (activeView === 'asistencias') {
      return (
        <div>
          <h2>Asistencias para {selectedFormacion?.nombre}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Asistió</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeData.map((asistencia) => (
                <TableRow key={asistencia.id}>
                  <TableCell>{asistencia.estudiante.nombreCompleto}</TableCell>
                  <TableCell>{asistencia.fechaSesion}</TableCell>
                  <TableCell>{asistencia.asistio ? 'Sí' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={() => window.location.reload()}>Volver</Button>
        </div>
      );
    }
  
    if (activeView === 'participantesFormacion') {
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2>Participantes para {selectedFormacion?.nombre}</h2>
            <Button onClick={() => window.location.reload()}>Volver</Button> {/* Asegúrate de que 'formaciones' esté entre comillas */}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeData.map((participante) => (
                <TableRow key={participante.id}>
                  <TableCell>{participante.estudiante.nombreCompleto}</TableCell>
                  <TableCell>{participante.estado}</TableCell>
                  <TableCell>
                    <Button onClick={() => updateEstado(participante.id, 'aprobado')}>Aprobó</Button>
                    <Button onClick={() => updateEstado(participante.id, 'reprobado')}>Reprobó</Button>
                    <Button onClick={() => updateEstado(participante.id, 'desertor')}>Desertó</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
  
    return null;
  };
  

  const renderContent = () => {
    switch (activeSection) {
      case 'formaciones':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Formaciones</h2>
              <Button onClick={() => handleAdd('formacion')}>+ Agregar Formación</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Sede</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Relator</TableHead>
                  <TableHead>Fecha de Inicio</TableHead>
                  <TableHead>Fecha de Término</TableHead>
                  <TableHead>Aprobados</TableHead>
                  <TableHead>Reprobados</TableHead>
                  <TableHead>Deserción</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formaciones.map((formacion) => (
                  <TableRow key={formacion.id}>
                    <TableCell>{formacion.id}</TableCell>
                    <TableCell>{formacion.sedeFormacion}</TableCell>
                    <TableCell>{formacion.nombre}</TableCell>
                    <TableCell>{formacion.modalidad}</TableCell>
                    <TableCell>{formacion.semestre}</TableCell>
                    <TableCell>{formacion.estado}</TableCell>
                    <TableCell>{formacion.profesorRelator}</TableCell>
                    <TableCell>{format(new Date(formacion.fechaInicio), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{format(new Date(formacion.fechaTermino), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{formacion.aprobados}</TableCell>
                    <TableCell>{formacion.reprobados}</TableCell>
                    <TableCell>{formacion.desercion}</TableCell>
                    <TableCell>{formacion.total}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(formacion, 'formacion')}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(formacion, 'formacion')}><Edit className="h-4 w-4" /></Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleViewAsistencias(formacion)}>
                              Mostrar Asistencias
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleViewParticipantes(formacion)}>
                              Mostrar Participantes
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleCloseFormacion(formacion.id)}>
                              Cerrar Formación
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
        case 'asistencias':
          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2>Asistencias para {selectedFormacion?.nombre}</h2>
                <Button onClick={() => setActiveView(null)}>Volver</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Asistió</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeData.map((asistencia) => (
                    <TableRow key={asistencia.id}>
                      <TableCell>{asistencia.estudiante.nombreCompleto}</TableCell>
                      <TableCell>{asistencia.fechaSesion}</TableCell>
                      <TableCell>{asistencia.asistio ? 'Sí' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )

    const handleViewAsistencias = async (formacion) => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/asistencias?formacionId=${formacion.id}`);
        console.log('Asistencias:', response.data);
        setActiveData(response.data || []); // Guardar las asistencias
        setSelectedFormacion(formacion); // Guardar la formación seleccionada
        setActiveView('asistencias'); // Cambiar a la vista de asistencias
      } catch (error) {
        console.error('Error al cargar las asistencias:', error);
        alert('No se pudieron cargar las asistencias.');
      }
    };
    
    const handleViewParticipantes = async (formacion) => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/estudiantes-formaciones/formacion/${formacion.id}`);
        console.log('Participantes:', response.data);
        setActiveData(response.data || []); // Guardar los participantes
        setSelectedFormacion(formacion); // Guardar la formación seleccionada
        setActiveView('participantesFormacion'); // Cambiar a la vista de participantes
      } catch (error) {
        console.error('Error al cargar los participantes:', error);
        alert('No se pudieron cargar los participantes.');
      }
    };
    

    const handleViewConstancias = async (formacion) => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/formaciones/${formacion.id}/constancias`);
        setActiveData(response.data); // Guardar constancias
        setSelectedFormacion(formacion); // Guardar formación seleccionada
        setActiveView('constancias'); // Activar vista de constancias
      } catch (error) {
        console.error('Error al obtener las constancias:', error);
      }
    };

    const handleCloseFormacion = async (formacionId) => {
      try {
        // Solicitar al backend que cierre la formación
        const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/formaciones/${formacionId}`, {
          estado: 'cerrada',
        });
    
        // Opcional: Actualizar estadísticas locales
        const updatedFormaciones = formaciones.map((formacion) =>
          formacion.id === formacionId ? { ...formacion, estado: 'cerrada' } : formacion
        );
        setFormaciones(updatedFormaciones);
    
        // Generar constancias para los aprobados
        //await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/formaciones/${formacionId}/constancias`);
    
        alert(`La formación con ID ${formacionId} ha sido cerrada y las constancias se han generado.`);
        fetchFormaciones(); // Refrescar lista de formaciones
      } catch (error) {
        console.error('Error al cerrar la formación:', error);
        alert('No se pudo cerrar la formación. Inténtalo de nuevo.');
      }
    };

    const updateEstado = async (id, nuevoEstado) => {
      try {
        await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/estudiantes-formaciones/${id}`, {
          estado: nuevoEstado,
        });
        alert(`Estado actualizado a ${nuevoEstado}`);
        fetchParticipantes(); // Refrescar la lista de participantes
      } catch (error) {
        console.error('Error al actualizar el estado:', error);
        alert('No se pudo actualizar el estado. Inténtalo de nuevo.');
      }
    };

    const renderActiveView = () => {
      if (activeView === 'asistencias') {
        return (
          <div>
            <h2>Asistencias para {selectedFormacion?.nombre}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Asistió</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeData.map((asistencia) => (
                  <TableRow key={asistencia.id}>
                    <TableCell>{asistencia.estudiante.nombreCompleto}</TableCell>
                    <TableCell>{asistencia.fechaSesion}</TableCell>
                    <TableCell>{asistencia.asistio ? 'Sí' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }
    
      if (activeView === 'participantesFormacion') {
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2>Participantes para {selectedFormacion?.nombre}</h2>
              <Button onClick={() => setActiveView('formaciones')}>Volver</Button> {/* Asegúrate de que 'formaciones' esté entre comillas */}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeData.map((participante) => (
                  <TableRow key={participante.id}>
                    <TableCell>{participante.estudiante.nombreCompleto}</TableCell>
                    <TableCell>{participante.estado}</TableCell>
                    <TableCell>
                      <Button onClick={() => updateEstado(participante.id, 'aprobado')}>Aprobó</Button>
                      <Button onClick={() => updateEstado(participante.id, 'reprobado')}>Reprobó</Button>
                      <Button onClick={() => updateEstado(participante.id, 'desertor')}>Desertó</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }
    
      return null;
    };
    

    const renderContent = () => {
      switch (activeSection) {
        case 'formaciones':
          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Formaciones</h2>
                <Button onClick={() => handleAdd('formacion')}>+ Agregar Formación</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead>Sede</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Modalidad</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Relator</TableHead>
                    <TableHead>Fecha de Inicio</TableHead>
                    <TableHead>Fecha de Término</TableHead>
                    <TableHead>Aprobados</TableHead>
                    <TableHead>Reprobados</TableHead>
                    <TableHead>Deserción</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formaciones.map((formacion) => (
                    <TableRow key={formacion.id}>
                      <TableCell>{formacion.id}</TableCell>
                      <TableCell>{formacion.sedeFormacion}</TableCell>
                      <TableCell>{formacion.nombre}</TableCell>
                      <TableCell>{formacion.modalidad}</TableCell>
                      <TableCell>{formacion.semestre}</TableCell>
                      <TableCell>{formacion.estado}</TableCell>
                      <TableCell>{formacion.profesorRelator}</TableCell>
                      <TableCell>{format(new Date(formacion.fechaInicio), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{format(new Date(formacion.fechaTermino), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{formacion.aprobados}</TableCell>
                      <TableCell>{formacion.reprobados}</TableCell>
                      <TableCell>{formacion.desercion}</TableCell>
                      <TableCell>{formacion.total}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(formacion, 'formacion')}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(formacion, 'formacion')}><Edit className="h-4 w-4" /></Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => handleViewAsistencias(formacion)}>
                                Mostrar Asistencias
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleViewParticipantes(formacion)}>
                                Mostrar Participantes
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleViewConstancias(formacion)}>
                                Ver Constancias
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleCloseFormacion(formacion.id)}>
                                Cerrar Formación
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
          case 'asistencias':
            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2>Asistencias para {selectedFormacion?.nombre}</h2>
                  <Button onClick={() => setActiveView(null)}>Volver</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Asistió</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeData.map((asistencia) => (
                      <TableRow key={asistencia.id}>
                        <TableCell>{asistencia.estudiante.nombreCompleto}</TableCell>
                        <TableCell>{asistencia.fechaSesion}</TableCell>
                        <TableCell>{asistencia.asistio ? 'Sí' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )

      


        case 'estudiantes':
          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Estudiantes</h2>
                <Button onClick={() => handleAdd('estudiante')}>+ Agregar Estudiante</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RUT</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Carrera</TableHead>
                    <TableHead>Correo Electrónico</TableHead>
                    <TableHead>Sede</TableHead>
                    <TableHead>Egresado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiantes.map((estudiante) => (
                    <TableRow key={estudiante.rut}>
                      <TableCell>{estudiante.rut}</TableCell>
                      <TableCell>{estudiante.nombreCompleto}</TableCell>
                      <TableCell>{estudiante.unidad}</TableCell>
                      <TableCell>{estudiante.carrera}</TableCell>
                      <TableCell>{estudiante.correo}</TableCell>
                      <TableCell>{estudiante.sedeEstudiante}</TableCell>
                      <TableCell>{estudiante.egresado ? 'Sí' : 'No'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(estudiante, 'estudiante')}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(estudiante, 'estudiante')}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(estudiante.rut, 'estudiante')}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
          case 'asociar':
            return (
              <div>
                <h2 className="text-2xl font-bold mb-4">Asociar Estudiante con Formación</h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Seleccionar estudiante por RUT */}
                  <div>
                    <label className="block mb-2">RUT del Estudiante</label>
                    <Select onValueChange={(value) => setSelectedEstudiante(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estudiante" />
                      </SelectTrigger>
                      <SelectContent>
                        {estudiantes.map((estudiante) => (
                          <SelectItem key={estudiante.rut} value={estudiante.id}>
                            {estudiante.rut} - {estudiante.nombreCompleto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
          
                  {/* Seleccionar formación por ID */}
                  <div>
                    <label className="block mb-2">ID de la Formación</label>
                    <Select onValueChange={(value) => setSelectedFormacion(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar formación" />
                      </SelectTrigger>
                      <SelectContent>
                        {formaciones.map((formacion) => (
                          <SelectItem key={formacion.id} value={formacion.id}>
                            {formacion.id} - {formacion.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
          
                {/* Botón para asociar */}
                <Button className="mt-4" onClick={handleAsociar}>
                  Asociar
                </Button>
              </div>
            )
        case 'usuarios':
          return (
            <div>
              <div className="flex  justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Usuarios</h2>
                <Button onClick={() => handleAdd('usuario')}>+ Agregar Usuario</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Usuario</TableHead>
                    <TableHead>RUT</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.rut}>
                      <TableCell>{usuario.tipo}</TableCell>
                      <TableCell>{usuario.rut}</TableCell>
                      <TableCell>{usuario.nombre}</TableCell>
                      <TableCell>{usuario.correo}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(usuario, 'usuario')}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(usuario, 'usuario')}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(usuario.rut, 'usuario')}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        case 'competencias':
          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Competencias</h2>
                <Button onClick={() => handleAdd('competencia')}>+ Agregar Competencia</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cód.</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competencias.map((competencia) => (
                    <TableRow key={competencia.codigo}>
                      <TableCell>{competencia.codigo}</TableCell>
                      <TableCell>{competencia.nombre}</TableCell>
                      <TableCell>{competencia.descripcion}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(competencia, 'competencia')}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(competencia, 'competencia')}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(competencia.codigo, 'competencia')}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
          case 'reporte-formaciones':
            return (
              <div>
                {/* Encabezado con título y botón de exportar */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Reporte de Formaciones</h2>
                  <Button onClick={exportToExcelFormaciones}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a Excel
                  </Button>
                </div>
          
                {/* Tabla con encabezados y filtros */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        { key: 'semestre', label: 'Semestre' },
                        { key: 'nombre', label: 'Nombre' },
                        { key: 'modalidad', label: 'Modalidad' },
                        { key: 'profesorRelator', label: 'Relator' },
                        { key: 'estado', label: 'Estado' },
                      ].map((column, index) => (
                        <TableHead key={index}>
                          <div className="flex items-center space-x-2">
                            <span>{column.label}</span>
                            {/* Filtro */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                                  <Filter className="h-4 w-4" />
                                  <span className="sr-only">Filtrar {column.label}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Input
                                  placeholder={`Filtrar ${column.label}`}
                                  value={filters[column.key] || ''}
                                  onChange={(e) =>
                                    handleFilterChange(column.key, e.target.value, 'formaciones')
                                  }
                                  className="px-3 py-2"
                                />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead>Id</TableHead>
                      <TableHead>Sede</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Fecha de Inicio</TableHead>
                      <TableHead>Fecha de Término</TableHead>
                      <TableHead>Aprobados</TableHead>
                      <TableHead>Reprobados</TableHead>
                      <TableHead>Deserción</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
          
                  {/* Cuerpo de la tabla */}
                  <TableBody>
                    {filteredFormaciones.map((formacion) => (
                      <TableRow key={formacion.id}>
                        <TableCell>{formacion.semestre}</TableCell>
                        <TableCell>{formacion.nombre}</TableCell>
                        <TableCell>{formacion.modalidad}</TableCell>
                        <TableCell>{formacion.profesorRelator}</TableCell>
                        <TableCell>{formacion.estado}</TableCell>
                        <TableCell>{formacion.id}</TableCell>
                        <TableCell>{formacion.sedeFormacion}</TableCell>
                        <TableCell>{formacion.semestre}</TableCell>
                        <TableCell>{new Date(formacion.fechaInicio).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(formacion.fechaTermino).toLocaleDateString()}</TableCell>
                        <TableCell>{formacion.aprobados}</TableCell>
                        <TableCell>{formacion.reprobados}</TableCell>
                        <TableCell>{formacion.desercion}</TableCell>
                        <TableCell>{formacion.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
            case 'reporte-participantes':
              return (
                <div>
                  {/* Encabezado con título y botón de exportar */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Reporte de Participantes</h2>
                    <Button onClick={exportToExcelEstudiante}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar a Excel
                    </Button>
                  </div>

                  {/* Tabla con encabezados y filtros */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {[
                          { header: "RUT", key: "estudiante.rut" },
                          { header: "Carrera", key: "estudiante.carrera" },
                          { header: "Semestre", key: "formacion.semestre" },
                          { header: "Nombre", key: "estudiante.nombreCompleto" },
                          { header: "Correo", key: "estudiante.correo" },
                          { header: "Nombre Formación", key: "formacion.nombre" },
                          { header: "Estado", key: "estado" },
                          { header: "Fecha de Inicio", key: "formacion.fechaInicio" },
                          { header: "Fecha de Término", key: "formacion.fechaTermino" },
                        ].map(({ header, key }) => (
                          <TableHead key={key}>
                            <div className="flex items-center">
                              {header}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0 ml-2">
                                    <Filter className="h-4 w-4" />
                                    <span className="sr-only">Filtrar {header}</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <Input
                                    placeholder={`Filtrar ${header}`}
                                    value={filters[key] || ""}
                                    onChange={(e) => handleFilterChange(key, e.target.value, "participantes")}
                                    className="px-3 py-2"
                                  />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    {/* Cuerpo de la tabla */}
                    <TableBody>
                      {filteredParticipantes.map((participante, index) => {
                        const { estudiante, formacion, estado } = participante;

                        if (!estudiante || !formacion) {
                          console.error("Datos incompletos:", participante);
                          return null;
                        }

                        return (
                          <TableRow key={index}>
                            <TableCell>{estudiante.rut}</TableCell>
                            <TableCell>{estudiante.carrera}</TableCell>
                            <TableCell>{formacion.semestre}</TableCell>
                            <TableCell>{estudiante.nombreCompleto}</TableCell>
                            <TableCell>{estudiante.correo}</TableCell>
                            <TableCell>{formacion.nombre}</TableCell>
                            <TableCell>{estado}</TableCell>
                            <TableCell>
                              {formacion.fechaInicio
                                ? new Date(formacion.fechaInicio).toLocaleDateString()
                                : "Sin fecha"}
                            </TableCell>
                            <TableCell>
                              {formacion.fechaTermino
                                ? new Date(formacion.fechaTermino).toLocaleDateString()
                                : "Sin fecha"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )
        default:
          return <h2 className="text-2xl font-bold">Bienvenido a la Escuela de Ayudantes y Tutores</h2>
      }
    }

    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-blue-900 text-white">
          <div className="p-4">
            <h1 className="text-xl font-bold">Escuela de Ayudantes y Tutores</h1>
          </div>
          <nav className="mt-8">
            <button onClick={() => setActiveSection('home')} className="block w-full text-left py-2 px-4 hover:bg-blue-800">
              <Home className="inline-block mr-2" size={20} />
              Inicio
            </button>
            <button onClick={() => setActiveSection('formaciones')} className="block w-full text-left py-2 px-4 hover:bg-blue-800">
              <Book className="inline-block mr-2" size={20} />
              Formaciones
            </button>
            <button onClick={() => setActiveSection('estudiantes')} className="block w-full text-left py-2 px-4 hover:bg-blue-800">
              <Users className="inline-block mr-2" size={20} />
              Estudiantes
            </button>
            <button onClick={() => setActiveSection('asociar')} className="block w-full text-left py-2 px-4 hover:bg-blue-800">
              <UserPlus className="inline-block mr-2" size={20} />
              Asociar Estudiante con Formación
            </button>
            <button onClick={() => setActiveSection('usuarios')} className="block w-full text-left py-2 px-4 hover:bg-blue-800">
              <Users className="inline-block mr-2" size={20} />
              Usuarios
            </button>
            <button onClick={() => setActiveSection('reporte-formaciones')} className="block w-full text-left py-2 px-4 hover:bg-blue-800">
              <FileText className="inline-block mr-2" size={20} />
              Reporte de Formaciones
            </button>
            <button onClick={() => setActiveSection('reporte-participantes')} className="block w-full text-left py-2 px-4 hover:bg-blue-800">
              <BarChart2 className="inline-block mr-2" size={20} />
              Reporte de Participantes
            </button>
            <button onClick={() => setActiveSection('competencias')} className="block w-full text-left py-2 px-4 hover:bg-blue-800">
              <Award className="inline-block mr-2" size={20} />
              Competencias
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          {activeView ? renderActiveView() : renderContent()}
        </main>

        {/* Modals */}
        <AddModal
          isOpen={isAddModalOpen}
          onClose={() => { 
            setIsAddModalOpen(false);
            fetchEstudiantes();
            fetchUsuarios();
          }}
          type={modalType}
        />
        <ViewDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          data={selectedItem}
          type={modalType}
        />
        <EditDetailsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          data={selectedItem}
          type={modalType}
          onSave={handleSave}
        />
      </div>
    )
  }