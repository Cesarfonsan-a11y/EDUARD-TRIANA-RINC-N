
import { ActorNode, RelationLink } from './types';

export const SECTOR_MESSAGES: Record<string, string[]> = {
  mineros: [
    "Usted extrae el alma de la tierra para encender la luz de la nación. Su valentía en la profundidad es el faro indomable del progreso de Boyacá.",
    "Cada gota de sudor en el socavón es una semilla de libertad. Usted es el gigante que domina la montaña y forja el futuro con sus manos.",
    "Bajo la tierra se forja el carácter de los valientes. Su fuerza es el latido de un pueblo que no se rinde ante la oscuridad."
  ],
  madereros: [
    "Usted sostiene los techos de quienes sueñan. Su madera es la columna vertebral de nuestra industria y el escudo de nuestros mineros.",
    "Con nobleza y fuerza, usted construye el soporte de nuestra economía. Sus manos son las raíces que mantienen a Paipa firme ante todo.",
    "Arquitecto de la seguridad: gracias por trabajar con la piel de la tierra para protegernos a todos. ¡Usted es indispensable!"
  ],
  combustibles: [
    "Usted es la chispa que rompe el silencio del camino. Sin su energía, Boyacá se detendría; gracias por ser el latido incesante del progreso.",
    "En cada galón hay una promesa de llegada. Usted es el aliado de cada sueño que viaja por nuestras carreteras. ¡Paipa avanza por usted!",
    "Energía inagotable para un pueblo guerrero. Su labor es el combustible que alimenta la victoria que estamos construyendo juntos."
  ],
  supermercados: [
    "Usted es el guardián del sustento, garantizando que en la mesa de Boyacá nunca falte la bendición. Su comercio es el altar de la comunidad.",
    "Motor que abastece la esperanza. En cada estante se refleja el esfuerzo de un pueblo que progresa con calidad y honradez absoluta.",
    "Su negocio es el refugio de las familias. Gracias por ser el eslabón de oro que une la abundancia con el hogar paipano."
  ],
  tenderos: [
    "Paso a paso, cliente a cliente, usted construye país. Es el confesor, el amigo y el corazón que late en cada esquina de nuestros barrios.",
    "La tienda es el primer peldaño de la libertad. Gracias por ser ese vecino que nunca cierra la puerta a la necesidad de su gente.",
    "Usted sostiene la economía popular con la fuerza de su palabra. ¡Bienvenido al equipo que valora su liderazgo social!"
  ],
  ingenieros: [
    "Su mente es el plano del futuro. Gracias por poner la ciencia al servicio del desarrollo de nuestra amada y eterna Boyacá.",
    "Precisión y visión: usted diseña realidades donde otros ven imposibles. Juntos levantaremos las obras que nuestra historia reclama.",
    "Donde hay problemas, usted construye soluciones. Su intelecto es la herramienta más poderosa para transformar el destino de Paipa."
  ],
  arquitectos: [
    "Usted diseña la identidad de nuestro territorio. Su visión estética es la que moderniza el alma de nuestra cultura y progreso.",
    "Arquitecto de sueños: gracias por proyectar una tierra donde la estética y la grandeza caminan de la mano hacia la victoria.",
    "Con su talento, cada espacio se convierte en un monumento al progreso. Su respaldo es la base sólida de nuestra planificación."
  ],
  veterinarios: [
    "Ángel guardián de nuestra riqueza pecuaria. Su vocación protege el sustento de los campesinos que son la raíz de nuestra patria.",
    "Sanar la tierra a través de sus animales es su misión noble. Usted es el soporte técnico que garantiza la vida en nuestro campo.",
    "Su conocimiento es el escudo de nuestra soberanía alimentaria. Gracias por cuidar de quienes nos alimentan con amor y dedicación."
  ],
  agronomos: [
    "Usted hace hablar a la tierra. Su técnica es el milagro que convierte el campo en una despensa de prosperidad infinita para todos.",
    "Sembrador de ciencia en el surco de la esperanza. Usted es el guía que lleva a nuestros campesinos hacia la competitividad global.",
    "La tierra de Boyacá florece bajo su mando. Su sabiduría es la semilla que garantiza un futuro siempre verde y fértil para Paipa."
  ],
  transportadores: [
    "¡Gigante de las rutas! Cada kilómetro es una arteria que lleva la vida de Paipa al corazón de Colombia. Usted es el dueño de la distancia.",
    "Sobre sus hombros descansa el movimiento de la nación. Su camión es un barco de tierra que navega con el orgullo de ser boyacense.",
    "Firme al volante, protegiendo la carga y la esperanza. Usted es la columna vertebral que conecta nuestros sueños con el mundo."
  ],
  taxistas: [
    "Embajador de nuestras calles y primer saludo del visitante. Su taxi es el pulso de la ciudad y el oído de nuestro pueblo.",
    "Nadie conoce mejor el corazón de Paipa que usted. Gracias por mover a nuestra gente con la dignidad que este pueblo merece.",
    "Usted es el líder que escucha el clamor de la gente. Su voz es la verdad que necesitamos para transformar nuestro territorio hoy mismo."
  ],
  ferreterias: [
    "En cada herramienta entrega la posibilidad de un nuevo futuro. Su negocio es el arsenal del desarrollo y la construcción de Paipa.",
    "Cimientos fuertes para una Boyacá que se levanta. Gracias por proveer el hierro con el que forjamos nuestra independencia económica.",
    "Aliado estratégico de todo el que quiere mejorar su vida. Su ferretería es el punto de partida de toda gran victoria regional."
  ],
  carnicos: [
    "Maestro de la tradición que nutre a nuestro pueblo. Su labor garantiza salud y fuerza para las familias que son el motor de Boyacá.",
    "Orgullo de nuestra ganadería en sus manos. Gracias por honrar la mesa de Paipa con el fruto de nuestro bendito esfuerzo campesino.",
    "Calidad que se siente, servicio que enamora. Usted es el eslabón de oro en la cadena del bienestar y la nutrición de nuestra gente."
  ],
  belleza: [
    "Usted eleva el espíritu y la confianza de nuestra gente. Su salón es el santuario donde nace la seguridad y la luz personal.",
    "Líder de opinión y guardiana de la comunidad: su influencia es el tejido social que nos mantiene unidos. ¡Gracias por su luz!",
    "En sus manos la belleza se convierte en arte y el servicio en amistad. Gracias por embellecer el camino hacia la victoria final."
  ],
  empresarios: [
    "Usted es el valiente que genera el empleo que dignifica al trabajador boyacense. Su liderazgo es la brújula de nuestro progreso.",
    "Gracias por invertir sus sueños en Paipa. Juntos crearemos el entorno de seguridad y orden que su empresa necesita para vencer.",
    "Visionario del desarrollo: su capacidad de gestión es el motor que nos sacará adelante. Su respaldo nos da la firmeza para ganar."
  ],
  sin_actividad: [
    "Su fe es el motor que nos obliga a no descansar hasta que cada familia de Paipa tenga la oportunidad que siempre ha soñado.",
    "Usted es la razón de nuestra lucha. Trabajaremos sin descanso para que su voz sea el norte absoluto de nuestro gobierno.",
    "Gracias por confiar su esperanza en nuestras manos. Juntos construiremos una Boyacá donde el bienestar sea un derecho de todos."
  ]
};

export const ACTORS: ActorNode[] = [
  { id: 'mineros', name: '⛏️ Mineros principales', category: 'CORE', description: 'Núcleo del sistema. Actores directos de la actividad extractiva.', baseCount: 500 },
  { id: 'madereros', name: '🪵 Madereros', category: 'SUPPLIER', description: 'Soporte logístico. Proveedores de madera para infraestructura minera.', baseCount: 150 },
  { id: 'combustibles', name: '⛽ Combustibles', category: 'SUPPLIER', description: 'Insumo crítico. Estaciones de servicio y distribuidores.', baseCount: 80 },
  { id: 'transportadores', name: '🚛 Transportadores', category: 'SUPPLIER', description: 'Logística de carga pesada y transporte de carbón.', baseCount: 220 },
  { id: 'ferreterias', name: '🛠️ Ferreterías', category: 'SUPPLIER', description: 'Suministros para minería, construcción e industria.', baseCount: 95 },
  
  { id: 'supermercados', name: '🛒 Supermercados', category: 'CONSUMPTION', description: 'Abastecimiento general y comercio a gran escala.', baseCount: 300 },
  { id: 'tenderos', name: '🏪 Tenderos', category: 'CONSUMPTION', description: 'Comercio de barrio y economía popular de cercanía.', baseCount: 400 },
  { id: 'carnicos', name: '🥩 Especialistas Cárnicos', category: 'CONSUMPTION', description: 'Fruver, carnicerías y puntos de cadena alimentaria.', baseCount: 130 },
  { id: 'taxistas', name: '碰 Taxistas', category: 'PROFESSIONAL', description: 'Gremio de transporte público urbano y líderes sociales.', baseCount: 180 },
  
  { id: 'belleza', name: '✂️ Especialistas Belleza', category: 'PROFESSIONAL', description: 'Estilistas, barberos y centros de estética. Líderes de opinión barrial.', baseCount: 250 },
  { id: 'empresarios', name: '💼 Empresarios Locales', category: 'PROFESSIONAL', description: 'Generadores de empleo y líderes de inversión regional.', baseCount: 140 },
  { id: 'sin_actividad', name: '👥 Base Ciudadana', category: 'CONSUMPTION', description: 'Ciudadanos sin actividad económica específica, estudiantes y amas de casa.', baseCount: 600 },

  { id: 'ingenieros', name: '📐 Ingenieros', category: 'PROFESSIONAL', description: 'Cuerpo técnico y de infraestructura. Voto de opinión calificado.', baseCount: 200 },
  { id: 'arquitectos', name: '🏛️ Arquitectos', category: 'PROFESSIONAL', description: 'Planeación urbana y diseño regional.', baseCount: 120 },
  { id: 'veterinarios', name: '🐾 Veterinarios', category: 'PROFESSIONAL', description: 'Salud animal y soporte a la vocación rural.', baseCount: 85 },
  { id: 'agronomos', name: '🌱 Ing. Agrónomos', category: 'PROFESSIONAL', description: 'Productividad del campo y líderes de opinión rurales.', baseCount: 110 },
  
  { id: 'rep_camara', name: 'Eduar Triana - 102', category: 'POLITICAL', description: 'Candidato a la Cámara por Boyacá. Centro Democrático.', baseCount: 1 },
];

export const RELATIONS: RelationLink[] = [
  { source: 'mineros', target: 'madereros', type: 'PRIMARY_FLOW', label: 'Insumos Madera' },
  { source: 'mineros', target: 'combustibles', type: 'PRIMARY_FLOW', label: 'Logística Diésel' },
  { source: 'mineros', target: 'transportadores', type: 'PRIMARY_FLOW', label: 'Movimiento Carbón' },
  { source: 'mineros', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Voto Directo' },
  { source: 'transportadores', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Red Logística' },
  { source: 'taxistas', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Voto Urbano' },
  { source: 'ferreterias', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Sector Industria' },
  { source: 'carnicos', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Comercio Popular' },
  { source: 'ingenieros', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Respaldo Técnico' },
  { source: 'arquitectos', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Visión Ciudad' },
  { source: 'veterinarios', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Red Rural' },
  { source: 'agronomos', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Voto Agrario' },
  { source: 'tenderos', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Base Popular' },
  { source: 'belleza', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Voto Social' },
  { source: 'empresarios', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Respaldo Económico' },
  { source: 'sin_actividad', target: 'rep_camara', type: 'VOTING_INFLUENCE', label: 'Voto Opinión' },
];
