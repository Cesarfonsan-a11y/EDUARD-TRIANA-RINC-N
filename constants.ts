
import { ActorNode, RelationLink } from './types';

export const ACTORS: ActorNode[] = [
  { id: 'guild', name: 'Gremio Carbonero', category: 'CORE', description: 'Empresas y minas núcleo de la economía local.', baseCount: 500 },
  { id: 'dotaciones', name: 'Empresas de Dotaciones', category: 'SUPPLIER', description: 'Uniformes y seguridad industrial.', baseCount: 45 },
  { id: 'talleres', name: 'Talleres Mecánicos', category: 'SUPPLIER', description: 'Mantenimiento de maquinaria pesada.', baseCount: 80 },
  { id: 'transporte', name: 'Transporte y Logística', category: 'SUPPLIER', description: 'Flota de carga pesada para carbón.', baseCount: 120 },
  { id: 'empleados', name: 'Empleados y Familias', category: 'CONSUMPTION', description: 'El puente clave entre economía y votos.', baseCount: 1500 },
  { id: 'supermercados', name: 'Comercio Local', category: 'CONSUMPTION', description: 'Supermercados, carnicerías y tiendas.', baseCount: 300 },
  { id: 'gasolineras', name: 'Estaciones de Servicio', category: 'CONSUMPTION', description: 'Combustible para operación y movilidad.', baseCount: 60 },
  { id: 'rep_camara', name: 'Eduard Triana Rincón', category: 'POLITICAL', description: 'Representante a la Cámara por Boyacá.', baseCount: 1 },
  { id: 'alcaldia', name: 'Alcaldía Municipal', category: 'POLITICAL', description: 'Poder ejecutivo local.', baseCount: 150 },
  { id: 'concejales', name: 'Concejales', category: 'POLITICAL', description: 'Influencia normativa local.', baseCount: 13 },
];

export const RELATIONS: RelationLink[] = [
  { source: 'guild', target: 'empleados', type: 'PRIMARY_FLOW', label: 'Salarios' },
  { source: 'guild', target: 'dotaciones', type: 'PRIMARY_FLOW', label: 'Compras B2B' },
  { source: 'guild', target: 'talleres', type: 'PRIMARY_FLOW', label: 'Mantenimiento' },
  { source: 'guild', target: 'transporte', type: 'PRIMARY_FLOW', label: 'Logística' },
  { source: 'empleados', target: 'supermercados', type: 'SECONDARY_FLOW', label: 'Consumo Hogar' },
  { source: 'empleados', target: 'gasolineras', type: 'SECONDARY_FLOW', label: 'Movilidad' },
  { source: 'empleados', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Voto Directo' },
  { source: 'guild', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Lobby/Apoyo' },
  { source: 'rep_camara', target: 'guild', type: 'VOTING_INFLUENCE', label: 'Defensa Gremial' },
  { source: 'supermercados', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Voto Comercial' },
];
