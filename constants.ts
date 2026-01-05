
import { ActorNode, RelationLink } from './types';

export const SECTOR_MESSAGES: Record<string, string[]> = {
  mineros: [
    "¡Qué orgullo contar con un trabajador de la tierra! Eres la fuerza que brota del suelo para iluminar a todo Boyacá. ¡Gracias por tu valentía y compromiso!",
    "Tu labor es el motor de nuestra historia. Cada vez que entras a la mina, llevas contigo la esperanza de miles. ¡Bienvenido a este equipo que te valora!",
    "Eres el corazón de nuestra economía. Gracias por ponerle el pecho al progreso de Paipa con tanta dedicación."
  ],
  madereros: [
    "Eres el cimiento sobre el cual construimos el futuro. Tu trabajo con la madera es la estructura que sostiene los sueños de nuestra región. ¡Bienvenido!",
    "Con tus manos se construye el progreso. Gracias por ser esa pieza fundamental que protege y fortalece nuestro ecosistema productivo.",
    "La madera de Paipa tiene tu sello de calidad. Gracias por confiar en nosotros para construir juntos un Boyacá más fuerte."
  ],
  combustibles: [
    "Tú eres la chispa que mantiene a Paipa en movimiento. Gracias por ser la energía inagotable que impulsa cada vehículo y cada sueño en el territorio.",
    "Sin tu labor, el progreso se detendría. Gracias por ser el combustible de nuestra esperanza y el aliado estratégico de cada trabajador.",
    "Energía pura para nuestra gente. Tu servicio es vital para que Boyacá no deje de avanzar."
  ],
  supermercados: [
    "Más que abastecer, tú cuidas a las familias de nuestro pueblo. Eres ese punto de encuentro donde nace el bienestar de Paipa. ¡Gracias por sumarte!",
    "Gracias por alimentar los sueños de nuestra comunidad. Tu negocio es el reflejo del esfuerzo y la abundancia de nuestra tierra.",
    "Comercio con corazón. Eres quien garantiza que a ninguna mesa le falte el sustento. ¡Tu apoyo nos llena de fuerza!"
  ],
  tenderos: [
    "Eres el alma del barrio, ese amigo que siempre está cuando alguien lo necesita. Tu confianza es el tesoro más grande de este equipo.",
    "La tienda de la esquina es el corazón de nuestra economía cercana. Gracias por ser el vecino que siempre nos da una mano.",
    "Paso a paso, cliente a cliente, construyes país. ¡Bienvenido al equipo donde tu voz y tu negocio son nuestra prioridad!"
  ],
  ingenieros: [
    "¡Mente brillante y transformadora! Tu ingeniería es la que diseña el Boyacá del futuro. Gracias por poner tu técnica al servicio de este proyecto.",
    "Precisión y visión: eso es lo que aportas a nuestro equipo. Juntos construiremos las obras que Paipa necesita.",
    "La infraestructura de nuestra esperanza pasa por tus cálculos. ¡Bienvenido al equipo técnico de la victoria!"
  ],
  arquitectos: [
    "Diseñando espacios para la vida y el progreso. Tu visión estética y funcional es clave para modernizar nuestro territorio.",
    "Arquitecto de sueños boyacenses. Gracias por creer en una Paipa planeada y sostenible.",
    "Con tu talento, dibujamos el mapa de un departamento más fuerte. ¡Tu respaldo nos da altura!"
  ],
  veterinarios: [
    "Protector de nuestra riqueza animal y aliado del campo. Tu labor garantiza la salud de nuestra vocación agropecuaria.",
    "Gracias por cuidar de quienes no tienen voz pero son el sustento de miles de familias. ¡Bienvenido, doctor!",
    "Pasión por la vida y el campo. Tu conocimiento es vital para que nuestra Paipa rural sea ejemplo nacional."
  ],
  agronomos: [
    "Haciendo que la tierra produzca con ciencia y corazón. Eres el mejor aliado de nuestros campesinos.",
    "Sembrando futuro con técnica y dedicación. Gracias por ser el motor de la productividad en Boyacá.",
    "Tu conocimiento técnico es la semilla de la prosperidad que estamos cultivando. ¡Paipa florece con tu apoyo!"
  ],
  transportadores: [
    "¡Gigante de las vías! Tu labor conectando a Paipa con el país es la que mantiene viva nuestra economía. ¡Gracias por tu fuerza!",
    "Kilómetro a kilómetro, construyes la grandeza de Boyacá. Tu camión es el pulso del progreso nacional.",
    "Firme al volante y de gran corazón. Tu gremio es la columna vertebral de nuestra competitividad territorial."
  ],
  taxistas: [
    "¡Amigo del volante! Tú conoces cada rincón de Paipa y eres la cara amable para nuestra gente y turistas. ¡Bienvenido!",
    "Eres el pulso de la ciudad. Gracias por mover a nuestra comunidad con seguridad y compromiso diario.",
    "Nadie conoce mejor las necesidades del pueblo que tú. Tu voz es fundamental para este proyecto de transformación."
  ],
  ferreterias: [
    "¡Cimiento del progreso! Tu negocio provee las herramientas con las que Paipa se levanta y se fortalece cada día.",
    "En cada clavo y cada viga, está tu aporte al crecimiento de nuestro territorio. ¡Gracias por ser soporte técnico!",
    "Socio estratégico del desarrollo. Tu ferretería es el punto de partida de toda gran obra en Boyacá."
  ],
  carnicos: [
    "¡Maestro del sabor y la calidad! Tu labor garantiza que lo mejor de nuestra ganadería llegue con excelencia a la mesa.",
    "Orgullo de nuestra tradición cárnica. Gracias por tu esfuerzo diario manteniendo la soberanía alimentaria de Paipa.",
    "Calidad y servicio boyacense. Eres un eslabón crítico en la cadena de bienestar de nuestras familias."
  ],
  belleza: [
    "¡Embajadora de la confianza! Tu talento resalta la belleza de nuestra gente y tu salón es el corazón de la comunidad. ¡Bienvenida!",
    "Eres quien escucha y cuida a los vecinos cada día. Gracias por ser esa líder de opinión que Paipa necesita.",
    "Transformas vidas con tus manos. Gracias por sumar tu brillo y tu respaldo a este proyecto de victoria."
  ],
  empresarios: [
    "Visionario del desarrollo. Tu capacidad de generar empleo es el motor que mantiene fuerte a nuestra Paipa. ¡Bienvenido!",
    "Gracias por creer en el talento local y por invertir en nuestra tierra. Juntos garantizaremos un entorno seguro para tu empresa.",
    "Tu liderazgo empresarial es clave para que Boyacá sea potencia comercial. ¡Tu apoyo nos da la firmeza necesaria!"
  ],
  sin_actividad: [
    "¡Tu voz es nuestra mayor fuerza! Estamos aquí para trabajar por las oportunidades que tú y tu familia merecen en Paipa.",
    "Gracias por confiar en nosotros. Este proyecto es para que ningún paipano se sienta solo en su búsqueda de progreso.",
    "Tu respaldo nos motiva a construir una ciudad con más empleo y bienestar para todos. ¡Bienvenido al equipo!"
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
