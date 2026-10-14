import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, HelpCircle, Trophy, RotateCcw, Share2, 
  CheckCircle2, XCircle, Sparkles, KeyRound 
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PitCoinIcon } from '../common/F1Icons';

export interface HelmetQuestion {
  id: string;
  driverName: string;
  driverCode: string;
  driverNumber: number;
  country: string;
  team: string;
  year: number;
  event: string;
  isSpecialEdition?: boolean;
  image: string;
  helmetDescription: string;
  historicalContext: string;
  clues: string[];
  options: string[];
}

export const REAL_HELMETS: HelmetQuestion[] = [
  // --- SEBASTIAN VETTEL EDICIONES ESPECIALES ---
  {
    id: 'vettel-2011',
    driverName: 'Sebastian Vettel',
    driverCode: 'VET',
    driverNumber: 1,
    country: 'Alemania',
    team: 'Red Bull Racing',
    year: 2011,
    event: 'GP de Singapur & Temporada 2011 (Bicampeonato Histórico)',
    isSpecialEdition: true,
    image: '/helmets/vettel-2011.png',
    helmetDescription: 'Edición especial Arai con purpurina metálica nocturna, detalles de fibra de carbono visible y el toro dorado de Red Bull.',
    historicalContext: 'Usado durante su año más demoledor donde firmó 15 poles en una temporada (récord de todos los tiempos) y sentenció su segundo Mundial en Suzuka.',
    clues: [
      'Lleva el toro de Red Bull sobre una librea con purpurina plateada diseñada por Jens Munser (JMD).',
      'Temporada en la que batió el récord histórico de 15 pole positions en un solo año de Nigel Mansell.',
      'Piloto alemán que logró cuatro campeonatos consecutivos con Red Bull Racing.'
    ],
    options: ['Sebastian Vettel', 'Mark Webber', 'Nico Rosberg', 'Kimi Räikkönen']
  },
  {
    id: 'vettel-2012',
    driverName: 'Sebastian Vettel',
    driverCode: 'VET',
    driverNumber: 1,
    country: 'Alemania',
    team: 'Red Bull Racing',
    year: 2012,
    event: 'GP de Brasil (Interlagos) - La remontada del Tricampeonato',
    isSpecialEdition: true,
    image: '/helmets/vettel-2012.png',
    helmetDescription: 'Edición conmemorativa con acabado metálico oxidado y gráficos mecánicos de relojero en homenaje a los ingenieros de Milton Keynes.',
    historicalContext: 'El casco que sobrevivió al trompo de la curva 4 en Interlagos 2012 con el escape agujereado, remontando bajo el diluvio para coronarse tricampeón por 3 puntos sobre Alonso.',
    clues: [
      'Diseño exclusivo con textura industrial cobriza y engranajes mecánicos en la calota.',
      'Casco con el que disputó la dramática final de Interlagos 2012 bajo la lluvia.',
      'El tricampeón mundial más joven en coronarse en la historia de la categoría reina.'
    ],
    options: ['Sebastian Vettel', 'Fernando Alonso', 'Michael Schumacher', 'Felipe Massa']
  },
  {
    id: 'vettel-2013',
    driverName: 'Sebastian Vettel',
    driverCode: 'VET',
    driverNumber: 1,
    country: 'Alemania',
    team: 'Infiniti Red Bull Racing',
    year: 2013,
    event: 'GP de India & Racha histórica de 9 victorias consecutivas',
    isSpecialEdition: false,
    image: '/helmets/vettel-2013.png',
    helmetDescription: 'Franja tricolor alemana vertical (negro, rojo, oro) sobre base blanca pura con efectos holográficos y dorsal 1.',
    historicalContext: 'Con este diseño se arrodilló a hacerle una reverencia a su monoplaza "Hungry Heidi" en la recta de Buddh tras conquistar su 4º Mundial consecutivo.',
    clues: [
      'Franja tricolor alemana vertical que cruza longitudinalmente todo el casco Arai.',
      'Temporada mítica donde igualó el récord de Alberto Ascari ganando 9 Grandes Premios consecutivos.',
      'Tetracampeón del mundo con Red Bull que celebró haciendo donuts en la recta de meta.'
    ],
    options: ['Sebastian Vettel', 'Nico Rosberg', 'Lewis Hamilton', 'Valtteri Bottas']
  },

  // --- LEYENDAS Y ESPECIALES HISTÓRICOS ---
  {
    id: 'alonso-2005',
    driverName: 'Fernando Alonso',
    driverCode: 'ALO',
    driverNumber: 5,
    country: 'España',
    team: 'Mild Seven Renault F1 Team',
    year: 2005,
    event: 'GP de Brasil (Interlagos) - Primer Título Mundial',
    isSpecialEdition: true,
    image: '/helmets/alonso-2005.png',
    helmetDescription: 'El primer casco campeón de Fernando: azul asturiano y amarillo brillante con la franja de España y el trébol de la suerte.',
    historicalContext: 'Con solo 24 años se convirtió en el Campeón del Mundo más joven de la historia de la F1 en ese momento, destronando la era Schumacher.',
    clues: [
      'Azul Oviedo y amarillo Renault combinados con la bandera de España en la visera.',
      'El casco con el que defendió los ataques de Schumacher en las míticas vueltas de Imola 2005.',
      'El piloto asturiano de Renault que desató la "Alonsomanía".'
    ],
    options: ['Fernando Alonso', 'Giancarlo Fisichella', 'Juan Pablo Montoya', 'Kimi Räikkönen']
  },
  {
    id: 'alonso-2006',
    driverName: 'Fernando Alonso',
    driverCode: 'ALO',
    driverNumber: 1,
    country: 'España',
    team: 'Mild Seven Renault F1 Team',
    year: 2006,
    event: 'GP de Japón (Suzuka) & GP de Brasil - Bicampeonato Mundial',
    isSpecialEdition: false,
    image: '/helmets/alonso-2006.png',
    helmetDescription: 'El icónico casco con el dorsal 1 de Campeón del Mundo, las dos flechas plateadas asturianas y la bandera de España.',
    historicalContext: 'El casco de su segunda corona mundial consecutiva tras el legendario duelo motor a motor contra la Ferrari de Schumacher en Suzuka y São Paulo.',
    clues: [
      'Dos flechas plateadas en la parte superior del casco Arai apuntando a la gloria.',
      'Lleva el dorsal 1 de campeón defensor sobre los colores azul y amarillo.',
      'Bicampeón del mundo español de Fórmula 1.'
    ],
    options: ['Fernando Alonso', 'Carlos Sainz', 'Pedro de la Rosa', 'Jarno Trulli']
  },
  {
    id: 'raikkonen-2007',
    driverName: 'Kimi Räikkönen',
    driverCode: 'RAI',
    driverNumber: 6,
    country: 'Finlandia',
    team: 'Scuderia Ferrari Marlboro',
    year: 2007,
    event: 'GP de Brasil (Interlagos) - Campeonato Mundial con Ferrari',
    isSpecialEdition: true,
    image: '/helmets/raikkonen-2007.png',
    helmetDescription: 'Diseño agresivo tribal en blanco, negro y rojo Ferrari con la inscripción "Iceman" en la nuca.',
    historicalContext: 'El casco del último Campeón del Mundo de Pilotos de la Scuderia Ferrari, ganando el título por 1 solo punto frente a Hamilton y Alonso.',
    clues: [
      'Patrón tribal afilado con la palabra "Iceman" estampada en la parte trasera.',
      'Casco Bell con el que ganó en su debut con Ferrari en Australia y el título en Brasil 2007.',
      'Piloto finlandés famoso por su sangre fría y monosílabos en radio.'
    ],
    options: ['Kimi Räikkönen', 'Felipe Massa', 'Mika Häkkinen', 'Heikki Kovalainen']
  },
  {
    id: 'verstappen-2021',
    driverName: 'Max Verstappen',
    driverCode: 'VER',
    driverNumber: 33,
    country: 'Países Bajos',
    team: 'Red Bull Racing Honda',
    year: 2021,
    event: 'GP de Abu Dhabi (Yas Marina) - Última vuelta del Campeonato',
    isSpecialEdition: true,
    image: '/helmets/verstappen-2021.png',
    helmetDescription: 'Fondo blanco perlado mate con el león holandés en oro metálico y logotipos del toro de Red Bull.',
    historicalContext: 'El casco de una de las batallas más intensas de todos los tiempos, decidida en la última vuelta del GP de Abu Dhabi 2021.',
    clues: [
      'León de los Países Bajos en pan de oro en la cresta superior y toro rojo en laterales.',
      'Casco Schuberth con el que logró su primera corona mundial en 2021 con el dorsal 33.',
      'Piloto holandés de Red Bull Racing.'
    ],
    options: ['Max Verstappen', 'Sergio Pérez', 'Alexander Albon', 'Pierre Gasly']
  },
  {
    id: 'hamilton-2008',
    driverName: 'Lewis Hamilton',
    driverCode: 'HAM',
    driverNumber: 22,
    country: 'Reino Unido',
    team: 'Vodafone McLaren Mercedes',
    year: 2008,
    event: 'GP de Brasil (Interlagos) - "¿Is that Glock?!" Primer Mundial',
    isSpecialEdition: true,
    image: '/helmets/hamilton-2008.png',
    helmetDescription: 'Amarillo fluorescente brillante en homenaje a Ayrton Senna con ribetes en rojo y azul y la cinta tricolor.',
    historicalContext: 'Con este casco adelantó a Timo Glock en la última curva de la última vuelta en Interlagos 2008 para proclamarse campeón del mundo con McLaren a los 23 años.',
    clues: [
      'Amarillo canario brillante que usó en sus primeros años en F1 inspirado directamente en Ayrton Senna.',
      'Casco Arai del dramático final de Interlagos 2008 bajo la tormenta.',
      'Siete veces campeón del mundo británico.'
    ],
    options: ['Lewis Hamilton', 'Heikki Kovalainen', 'Jenson Button', 'David Coulthard']
  },
  {
    id: 'hamilton-2018',
    driverName: 'Lewis Hamilton',
    driverCode: 'HAM',
    driverNumber: 44,
    country: 'Reino Unido',
    team: 'Mercedes-AMG PETRONAS Motorsport',
    year: 2018,
    event: 'GP de Singapur & Temporada del Pentacampeonato',
    isSpecialEdition: false,
    image: '/helmets/hamilton-2018.png',
    helmetDescription: 'Blanco perla reluciente con detalles en rojo caramelo y las cuatro estrellas doradas de campeón en la nuca.',
    historicalContext: 'El casco de su vuelta de pole mágica en Singapur 2018, considerada por los ingenieros de Mercedes como una de las vueltas perfectas de la era híbrida.',
    clues: [
      'Blanco nacarado con franjas rojo manzana y las cuatro estrellas de sus títulos hasta 2017.',
      'Vuelta de clasificación antológica bajo los focos de Marina Bay en 2018.',
      'El piloto más laureado de la historia de la Fórmula 1.'
    ],
    options: ['Lewis Hamilton', 'Valtteri Bottas', 'Nico Rosberg', 'George Russell']
  },
  {
    id: 'hamilton-2020',
    driverName: 'Lewis Hamilton',
    driverCode: 'HAM',
    driverNumber: 44,
    country: 'Reino Unido',
    team: 'Mercedes-AMG PETRONAS F1 Team',
    year: 2020,
    event: 'GP de Turquía (Estambul Park) - Igualando a Schumacher con 7 Títulos',
    isSpecialEdition: true,
    image: '/helmets/hamilton-2020.png',
    helmetDescription: 'Esquema morado púrpura y negro con las 7 estrellas de campeón del mundo y el lema Still I Rise en la nuca.',
    historicalContext: 'Utilizado en el mojado circuito de Estambul donde remontó con neumáticos lisos gastados para igualar los 7 campeonatos de Michael Schumacher.',
    clues: [
      'Púrpura y negro brillante que introdujo junto al monoplaza Black Arrow en 2020.',
      'Siete estrellas de campeón grabadas en los laterales.',
      'Lleva el dorsal 44 y el lema personal "Still I Rise".'
    ],
    options: ['Lewis Hamilton', 'George Russell', 'Lando Norris', 'Esteban Ocon']
  },
  {
    id: 'schumacher-1994',
    driverName: 'Michael Schumacher',
    driverCode: 'MSC',
    driverNumber: 5,
    country: 'Alemania',
    team: 'Mild Seven Benetton Ford',
    year: 1994,
    event: 'GP de Adelaida (Australia) - Primer Campeonato del Mundo',
    isSpecialEdition: true,
    image: '/helmets/schumacher-1994.png',
    helmetDescription: 'Bandera alemana (negro, rojo, oro) sobre fondo azul oscuro metálico y estrellas blancas en la coronilla.',
    historicalContext: 'El casco de su primera corona mundial con Benetton tras la polémica colisión con Damon Hill en la curva de Adelaida.',
    clues: [
      'Bandera alemana lateral con base azul marino antes de cambiar al rojo Ferrari integral.',
      'El casco Bell con el que deslumbró al mundo ganando su primer Mundial en 1994.',
      'El Kaiser del automovilismo alemán.'
    ],
    options: ['Michael Schumacher', 'Damon Hill', 'Jos Verstappen', 'Gerhard Berger']
  },
  {
    id: 'schumacher-2000',
    driverName: 'Michael Schumacher',
    driverCode: 'MSC',
    driverNumber: 3,
    country: 'Alemania',
    team: 'Scuderia Ferrari Marlboro',
    year: 2000,
    event: 'GP de Japón (Suzuka) - Primer Mundial de Ferrari en 21 Años',
    isSpecialEdition: true,
    image: '/helmets/schumacher-2000.png',
    helmetDescription: 'Transición al rojo fluorescente completo con la bandera alemana y la cúpula superior estrellada.',
    historicalContext: 'El momento en que Ferrari rompió su sequía de 21 años sin ganar el Mundial de pilotos, superando a Mika Häkkinen en Suzuka bajo una lluvia intermitente.',
    clues: [
      'Estrenó la cúpula roja brillante en el GP de Mónaco 2000 para diferenciarse de Rubens Barrichello.',
      'Conquistó el ansiado Mundial de 2000 para Maranello tras dos décadas de espera.',
      'Siete veces campeón mundial de F1.'
    ],
    options: ['Michael Schumacher', 'Rubens Barrichello', 'Eddie Irvine', 'Mika Häkkinen']
  },
  {
    id: 'schumacher-2004',
    driverName: 'Michael Schumacher',
    driverCode: 'MSC',
    driverNumber: 1,
    country: 'Alemania',
    team: 'Scuderia Ferrari Marlboro',
    year: 2004,
    event: 'GP de Bélgica (Spa-Francorchamps) - Séptimo Título Mundial',
    isSpecialEdition: false,
    image: '/helmets/schumacher-2004.png',
    helmetDescription: 'Rojo Ferrari fluorescente completo con la bandera alemana y 7 estrellas doradas con el famoso Cavallino Rampante.',
    historicalContext: 'La temporada más dominante de su carrera: 13 victorias en 18 carreras a los mandos del legendario Ferrari F2004 V10.',
    clues: [
      'Rojo fuego total con 7 estrellas doradas en la coronilla representando cada corona mundial.',
      'Casco Schuberth RF1 de la temporada cumbre de la Scuderia Ferrari en 2004.',
      'El heptacampeón mundial alemán.'
    ],
    options: ['Michael Schumacher', 'Ralf Schumacher', 'Rubens Barrichello', 'Felipe Massa']
  },
  {
    id: 'senna-1988',
    driverName: 'Ayrton Senna',
    driverCode: 'SEN',
    driverNumber: 12,
    country: 'Brasil',
    team: 'Honda Marlboro McLaren',
    year: 1988,
    event: 'GP de Japón (Suzuka) - Primera Corona Mundial',
    isSpecialEdition: false,
    image: '/helmets/senna-1988.png',
    helmetDescription: 'El diseño más icónico de la historia del automovilismo: amarillo canario con franjas verde y azul marino creado por Sid Mosca.',
    historicalContext: 'El casco de su mítica pole en Mónaco donde le sacó 1.4 segundos a Prost y de su remontada del 14º al 1º en Suzuka 1988 tras calarse en la salida.',
    clues: [
      'Diseñado por Sid Mosca representando los colores patrios de la bandera de Brasil.',
      'Casco Bell del monoplaza McLaren MP4/4 con motor Honda Turbo.',
      'Tricampeón mundial legendario, rey de la lluvia y de las calles de Montecarlo.'
    ],
    options: ['Ayrton Senna', 'Alain Prost', 'Nelson Piquet', 'Emerson Fittipaldi']
  },
  {
    id: 'prost-1989',
    driverName: 'Alain Prost',
    driverCode: 'PRO',
    driverNumber: 2,
    country: 'Francia',
    team: 'Honda Marlboro McLaren',
    year: 1989,
    event: 'GP de Japón (Suzuka) - El choque de la chicane y 3er Mundial',
    isSpecialEdition: false,
    image: '/helmets/prost-1989.png',
    helmetDescription: 'Tricolor francés: blanco puro con patrones envolventes en azul marino y rojo a ambos lados de la visera.',
    historicalContext: 'El casco que protagonizó el choque más famoso de la F1 en la chicane del Triángulo de Suzuka 1989 contra su propio compañero Ayrton Senna.',
    clues: [
      'Patrón simétrico en azul, blanco y rojo que evoca la bandera de Francia.',
      'Apodado "El Profesor" por su prodigiosa inteligencia táctica en carrera.',
      'Cuatro veces campeón del mundo que venció a Lauda, Senna y Mansell.'
    ],
    options: ['Alain Prost', 'René Arnoux', 'Jean Alesi', 'Jacques Laffite']
  },
  {
    id: 'mansell-1992',
    driverName: 'Nigel Mansell',
    driverCode: 'MAN',
    driverNumber: 5,
    country: 'Reino Unido',
    team: 'Canon Williams Renault',
    year: 1992,
    event: 'GP de Hungría & GP de Gran Bretaña - El año del "Red 5"',
    isSpecialEdition: true,
    image: '/helmets/mansell-1992.png',
    helmetDescription: 'La bandera Union Jack en flechas estilizadas azul y roja con el número Red Five y la franja central blanca.',
    historicalContext: 'A los mandos del legendario Williams FW14B con suspensión activa arrasó en 1992 proclamándose campeón del mundo en Hungría con 5 carreras de antelación.',
    clues: [
      'La bandera británica estilizada y el famoso apodo "Red Five" (El 5 Rojo).',
      'El casco de "Il Leone", famoso por su valentía salvaje y adelantamientos al límite.',
      'Campeón del mundo de 1992 con Williams Renault.'
    ],
    options: ['Nigel Mansell', 'Damon Hill', 'Riccardo Patrese', 'Derek Warwick']
  },
  {
    id: 'stewart-1973',
    driverName: 'Jackie Stewart',
    driverCode: 'STE',
    driverNumber: 5,
    country: 'Reino Unido',
    team: 'Elf Team Tyrrell',
    year: 1973,
    event: 'GP de Italia (Monza) - Tercer Campeonato del Mundo',
    isSpecialEdition: false,
    image: '/helmets/stewart-1973.png',
    helmetDescription: 'Blanco puro con la cinta de tartán escocés Royal Stewart rodeando la corona del casco.',
    historicalContext: 'El tricampeón escocés que no solo dominó los circuitos de los 60 y 70 con Tyrrell, sino que lideró la cruzada que transformó la seguridad de la Fórmula 1 moderna.',
    clues: [
      'Cinta de tartán escocés tradicional rodeando un casco integral blanco impoluto.',
      'Tricampeón del mundo que compitió con Tyrrell y se retiró con 27 victorias récord.',
      'El "Escocés Volador" pionero de la seguridad en el automovilismo.'
    ],
    options: ['Jackie Stewart', 'Jim Clark', 'Graham Hill', 'James Hunt']
  },
  {
    id: 'hakkinen-1998',
    driverName: 'Mika Häkkinen',
    driverCode: 'HAK',
    driverNumber: 8,
    country: 'Finlandia',
    team: 'West McLaren Mercedes',
    year: 1998,
    event: 'GP de Japón (Suzuka) - Primer Mundial tras el accidente de Adelaida',
    isSpecialEdition: false,
    image: '/helmets/hakkinen-1998.png',
    helmetDescription: 'Blanco con tres franjas en degradado de azul marino a celeste inspiradas en los lagos helados de Finlandia.',
    historicalContext: 'El casco de su consagración ganando a Schumacher en Suzuka 1998, culminando su milagrosa recuperación del coma tras el grave accidente de 1995.',
    clues: [
      'Tres tonalidades de azul cruzando sobre blanco puro al más puro estilo nórdico.',
      'Bicampeón del mundo que protagonizó con Michael Schumacher la rivalidad más limpia de la F1.',
      'El "Finlandés Volador" de McLaren Mercedes.'
    ],
    options: ['Mika Häkkinen', 'Kimi Räikkönen', 'David Coulthard', 'Heikki Kovalainen']
  },
  {
    id: 'button-2009',
    driverName: 'Jenson Button',
    driverCode: 'BUT',
    driverNumber: 22,
    country: 'Reino Unido',
    team: 'Brawn GP F1 Team',
    year: 2009,
    event: 'GP de Brasil (Interlagos) - El cuento de hadas de Brawn GP',
    isSpecialEdition: true,
    image: '/helmets/button-2009.png',
    helmetDescription: 'Blanco con la bandera Union Jack y acentos en amarillo fluorescente reflectante característico del monoplaza Brawn GP.',
    historicalContext: 'El casco del milagro de Brawn GP: el equipo rescatado por 1 libra que ganó el Mundial de pilotos y constructores en su única temporada de existencia.',
    clues: [
      'Acentos en amarillo fluorescente de alta visibilidad Brawn GP flanqueando la Union Jack.',
      'Campeón del mundo de 2009 tras ganar 6 de las 7 primeras carreras de la temporada.',
      'Sus iniciales JB forman el dorsal 22 en los laterales.'
    ],
    options: ['Jenson Button', 'Rubens Barrichello', 'Lewis Hamilton', 'Mark Webber']
  },
  {
    id: 'rosberg-2016',
    driverName: 'Nico Rosberg',
    driverCode: 'ROS',
    driverNumber: 6,
    country: 'Alemania',
    team: 'Mercedes-AMG PETRONAS F1 Team',
    year: 2016,
    event: 'GP de Abu Dhabi (Yas Marina) - Campeón Mundial y Retirada Inmediata',
    isSpecialEdition: true,
    image: '/helmets/rosberg-2016.png',
    helmetDescription: 'Negro mate azabache con detalles en verde turquesa Petronas y el número romano VI en la cresta.',
    historicalContext: 'El casco con el que soportó la presión de Hamilton ralentizando el pelotón en Yas Marina para proclamarse campeón y retirarse 5 días después.',
    clues: [
      'Negro mate con acentos verde cian Petronas y el número 6 romano (VI) en la parte superior.',
      'Venció a Lewis Hamilton en una extenuante temporada de 21 carreras.',
      'Hijo del campeón Keke Rosberg; segundo doblete padre-hijo campeón de la historia.'
    ],
    options: ['Nico Rosberg', 'Lewis Hamilton', 'Valtteri Bottas', 'Michael Schumacher']
  },
  {
    id: 'lauda-1984',
    driverName: 'Niki Lauda',
    driverCode: 'LAU',
    driverNumber: 8,
    country: 'Austria',
    team: 'Marlboro McLaren International',
    year: 1984,
    event: 'GP de Portugal (Estoril) - Campeón por medio punto (0.5 pts)',
    isSpecialEdition: false,
    image: '/helmets/lauda-1984.png',
    helmetDescription: 'Rojo austríaco profundo con las letras LAUDA en mayúsculas blancas en ambos lados del casco Bell.',
    historicalContext: 'El casco de la diferencia más pequeña de la historia de la F1: batió a Alain Prost por tan solo 0.5 puntos remontando desde el 11º al 2º puesto en Estoril.',
    clues: [
      'Rojo fuego total con su propio apellido serigrafiado en tipografía deportiva blanca.',
      'Campeón del Mundo de 1984 ganando el título por medio punto (0.5 pts).',
      'Sobrevivió al fuego de Nürburgring 1976 y fue tres veces campeón mundial.'
    ],
    options: ['Niki Lauda', 'James Hunt', 'Gerhard Berger', 'Clay Regazzoni']
  },
  {
    id: 'massa-2008',
    driverName: 'Felipe Massa',
    driverCode: 'MAS',
    driverNumber: 2,
    country: 'Brasil',
    team: 'Scuderia Ferrari Marlboro',
    year: 2008,
    event: 'GP de Brasil (Interlagos) - Campeón durante 38 segundos',
    isSpecialEdition: true,
    image: '/helmets/massa-2008.png',
    helmetDescription: 'Colores verde y amarillo de la bandera brasileña con el tricolor italiano y acabado rojo Ferrari fluorescente.',
    historicalContext: 'Cruzó la meta ganando en su casa en Interlagos 2008 siendo virtual campeón del mundo durante 38 segundos antes de que Hamilton superase a Glock.',
    clues: [
      'Verde y amarillo brasileño sobre base rojo Ferrari con alas aerodinámicas.',
      'Ganador del GP de Brasil 2008 ante su público de São Paulo.',
      'Piloto brasileño de Ferrari subcampeón del mundo por 1 solo punto.'
    ],
    options: ['Felipe Massa', 'Rubens Barrichello', 'Kimi Räikkönen', 'Nelson Piquet Jr']
  },
  {
    id: 'ricciardo-2020',
    driverName: 'Daniel Ricciardo',
    driverCode: 'RIC',
    driverNumber: 3,
    country: 'Australia',
    team: 'Renault DP World F1 Team',
    year: 2020,
    event: 'GP de Eifel (Nürburgring) - El podio de la apuesta del tatuaje',
    isSpecialEdition: true,
    image: '/helmets/ricciardo-2020.png',
    helmetDescription: 'Diseño artístico asimétrico con lema "Stop Being Them" en tonos pastel rosa chicle, morado y turquesa.',
    historicalContext: 'El casco con el que devolvió a Renault al podio por primera vez en una década, obligando a Cyril Abiteboul a tatuarse.',
    clues: [
      'Lema "Stop Being Them" y número 3 estilizado en tonos pastel vanguardistas.',
      'Famoso por celebrar sus podios bebiendo champán de su propia bota ("Shoey").',
      'Australiano apodado el "Honey Badger" (Tejón de la Miel).'
    ],
    options: ['Daniel Ricciardo', 'Esteban Ocon', 'Oscar Piastri', 'Mark Webber']
  },

  // --- MÁS CASCOS MODERNOS Y EDICIONES HISTÓRICAS ---
  {
    id: 'vettel-2001',
    driverName: 'Sebastian Vettel',
    driverCode: 'VET',
    driverNumber: 5,
    country: 'Alemania',
    team: 'BMW Sauber / Red Bull Racing Origins',
    year: 2001,
    event: 'Orígenes y época formativa / Tributo karting',
    isSpecialEdition: true,
    image: '/helmets/vettel-2001.png',
    helmetDescription: 'Diseño original juvenil de Seb con cangrejos estilizados, llamas amarillas y fondo azul eléctrico.',
    historicalContext: 'Uno de los primeros diseños de casco emblemáticos del tetracampeón antes de adoptar su icónica franja alemana tricolor.',
    clues: [
      'Llamas amarillas deportivas sobre fondo azul cielo con el logo personal temprano de Vettel.',
      'Diseño formativo del que se convertiría en el tetracampeón más joven de la historia de la F1.',
      'Piloto alemán apodado "Baby Schumi" en sus primeros años.'
    ],
    options: ['Sebastian Vettel', 'Nico Rosberg', 'Timo Glock', 'Nick Heidfeld']
  },
  {
    id: 'hamilton-2014',
    driverName: 'Lewis Hamilton',
    driverCode: 'HAM',
    driverNumber: 44,
    country: 'Reino Unido',
    team: 'Mercedes-AMG PETRONAS F1 Team',
    year: 2014,
    event: 'GP de Abu Dhabi (Yas Marina) - Primer Mundial de la Era Híbrida',
    isSpecialEdition: false,
    image: '/helmets/hamilton-2014.png',
    helmetDescription: 'Blanco nacarado con franjas en rojo rubí y la silueta del Cristo Redentor y las alas con el dorsal 44.',
    historicalContext: 'El año de inflexión donde cambió del amarillo al blanco y conquistó su segundo título mundial batiendo a Rosberg en el duelo de Abu Dhabi de doble puntuación.',
    clues: [
      'Cambio radical al blanco con el dorsal 44 en tipografía alada y alas doradas.',
      'Casco Bell del comienzo de la apisonadora Mercedes en la era turbohíbrida V6.',
      'Piloto británico de Mercedes con el dorsal 44.'
    ],
    options: ['Lewis Hamilton', 'Nico Rosberg', 'Jenson Button', 'Valtteri Bottas']
  },
  {
    id: 'hamilton-2017',
    driverName: 'Lewis Hamilton',
    driverCode: 'HAM',
    driverNumber: 44,
    country: 'Reino Unido',
    team: 'Mercedes-AMG PETRONAS Motorsport',
    year: 2017,
    event: 'GP de México (Autódromo Hermanos Rodríguez) - El Tetracampeonato',
    isSpecialEdition: false,
    image: '/helmets/hamilton-2017.png',
    helmetDescription: 'Amarillo fluorescente metalizado con diseño elegido por concurso entre sus propios aficionados y tres estrellas.',
    historicalContext: 'Diseñado por un aficionado brasileño elegido por el propio Lewis entre más de 8.000 propuestas; con él ganó el Mundial 2017 tras superar a Vettel y Ferrari.',
    clues: [
      'Retorno temporal al amarillo flúor con la bandera Union Jack y las 3 estrellas de campeón.',
      'Diseñado a través de un concurso público mundial organizado por Hamilton y Monster.',
      'Conquistó su 4º Mundial de F1 en el GP de México de esa temporada.'
    ],
    options: ['Lewis Hamilton', 'Valtteri Bottas', 'Lando Norris', 'George Russell']
  },
  {
    id: 'hamilton-2019',
    driverName: 'Lewis Hamilton',
    driverCode: 'HAM',
    driverNumber: 44,
    country: 'Reino Unido',
    team: 'Mercedes-AMG PETRONAS Motorsport',
    year: 2019,
    event: 'GP de Estados Unidos (Austin) - Hexacampeón del Mundo',
    isSpecialEdition: false,
    image: '/helmets/hamilton-2019.png',
    helmetDescription: 'Blanco y rojo caramelo con las 5 estrellas de campeón mundial grabadas y visera Bell dorada iridiscente.',
    historicalContext: 'Concluyó en el podio de Austin 2019 asegurando su 6º Campeonato del Mundo para superar a Juan Manuel Fangio en el palmarés histórico.',
    clues: [
      'Cinco estrellas doradas laterales grabadas antes de sentenciar su 6ª corona en Austin.',
      'Monoplaza Mercedes W10 invencible en las primeras 8 carreras de 2019.',
      'El heptacampeón mundial británico.'
    ],
    options: ['Lewis Hamilton', 'Valtteri Bottas', 'Charles Leclerc', 'Max Verstappen']
  },
  {
    id: 'verstappen-2022',
    driverName: 'Max Verstappen',
    driverCode: 'VER',
    driverNumber: 1,
    country: 'Países Bajos',
    team: 'Oracle Red Bull Racing',
    year: 2022,
    event: 'GP de Japón (Suzuka) - Bicampeonato Mundial bajo el diluvio',
    isSpecialEdition: false,
    image: '/helmets/verstappen-2022.png',
    helmetDescription: 'Blanco y oro con el dorsal 1 de campeón defensor y león neerlandés texturizado en la coronilla.',
    historicalContext: 'Estrenó el dorsal 1 que ningún campeón usaba desde 2014 y pulverizó el récord de victorias en una temporada con 15 triunfos.',
    clues: [
      'Lleva el dorsal 1 de Campeón del Mundo por primera vez en su carrera sobre blanco y oro.',
      'Casco Schuberth con el que dominó con mano de hierro el cambio de reglamento del efecto suelo.',
      'Piloto holandés de Red Bull Racing.'
    ],
    options: ['Max Verstappen', 'Sergio Pérez', 'Charles Leclerc', 'Carlos Sainz']
  },
  {
    id: 'verstappen-2023',
    driverName: 'Max Verstappen',
    driverCode: 'VER',
    driverNumber: 1,
    country: 'Países Bajos',
    team: 'Oracle Red Bull Racing',
    year: 2023,
    event: 'GP de Qatar (Lusail) - El Tricampeonato del año de las 19 victorias',
    isSpecialEdition: true,
    image: '/helmets/verstappen-2023.png',
    helmetDescription: 'Librea retro en homenaje a su padre Jos Verstappen y el diseño holandés original con dos estrellas doradas de campeón.',
    historicalContext: 'El casco de la temporada más dominante en los 75 años de la F1: 19 victorias en 22 carreras y récord de 10 triunfos seguidos con el Red Bull RB19.',
    clues: [
      'Diseño especial retro con los colores de la bandera de los Países Bajos inspirado en los cascos de los 90.',
      'Temporada donde batió el récord de mayor porcentaje de victorias de la historia (86.4%).',
      'Tricampeón del mundo neerlandés de Fórmula 1.'
    ],
    options: ['Max Verstappen', 'Sergio Pérez', 'Lando Norris', 'Fernando Alonso']
  },
  {
    id: 'ricciardo-2021',
    driverName: 'Daniel Ricciardo',
    driverCode: 'RIC',
    driverNumber: 3,
    country: 'Australia',
    team: 'McLaren F1 Team',
    year: 2021,
    event: 'GP de Italia (Monza) - Victoria histórica de McLaren',
    isSpecialEdition: true,
    image: '/helmets/ricciardo-2021.png',
    helmetDescription: 'Diseño pop-art "All Good All Ways" en naranja papaya, turquesa menta y lila pastel.',
    historicalContext: 'Con este casco logró la primera victoria de McLaren en 9 años liderando el doblete de Monza 2021 tras aguantar a Verstappen y Hamilton.',
    clues: [
      'Lema optimista "All Good All Ways" con el naranja papaya característico de McLaren.',
      'El piloto que lideró el doblete de Monza 2021 brindando con el Shoey desde el podio más alto.',
      'Australiano conocido como el Honey Badger.'
    ],
    options: ['Daniel Ricciardo', 'Lando Norris', 'Oscar Piastri', 'Mark Webber']
  },
  {
    id: 'ericsson-2014',
    driverName: 'Marcus Ericsson',
    driverCode: 'ERI',
    driverNumber: 9,
    country: 'Suecia',
    team: 'Caterham F1 Team',
    year: 2014,
    event: 'GP de Mónaco & Temporada de debut en F1',
    isSpecialEdition: false,
    image: '/helmets/ericsson-2014.png',
    helmetDescription: 'Colores patrios de Suecia: azul rey y amarillo dorado con la cruz nórdica en los laterales.',
    historicalContext: 'Piloto sueco que debutó con Caterham y Sauber antes de marcharse a los Estados Unidos para ganar las míticas 500 Millas de Indianápolis.',
    clues: [
      'Bandera nacional de Suecia (cruz dorada sobre fondo azul marino profundo).',
      'Compañero de Charles Leclerc en Sauber en 2018 y ganador de las 500 Millas de Indianápolis.',
      'Piloto escandinavo de F1 dorsal 9.'
    ],
    options: ['Marcus Ericsson', 'Kevin Magnussen', 'Valtteri Bottas', 'Kimi Räikkönen']
  },
  {
    id: 'glock-2011',
    driverName: 'Timo Glock',
    driverCode: 'GLO',
    driverNumber: 24,
    country: 'Alemania',
    team: 'Marussia Virgin Racing',
    year: 2011,
    event: 'Temporada 2011 & GP de Singapur',
    isSpecialEdition: false,
    image: '/helmets/glock-2011.png',
    helmetDescription: 'Negro, rojo fuego y amarillo con el halcón plateado en los laterales y la bandera de Alemania.',
    historicalContext: 'Famoso por su podio en Hungría 2008 con Toyota y por el dramático desenlace de Interlagos 2008 con neumáticos lisos bajo el aguacero.',
    clues: [
      'Halcón estilizado y colores de la bandera de Alemania en los laterales.',
      'El piloto del mítico "¿Is that Glock?!" que decidió el Mundial de 2008.',
      'Piloto alemán que compitió para Jordan, Toyota y Marussia.'
    ],
    options: ['Timo Glock', 'Adrian Sutil', 'Nick Heidfeld', 'Nico Hülkenberg']
  }
];

type ObscureMode = 'blur' | 'zoom' | 'pixel';

interface ObscureConfig {
  mode: ObscureMode;
  label: string;
  zoomOrigin: string; // e.g., '25% 30%', '75% 70%'
}

const getRandomObscureConfig = (): ObscureConfig => {
  const modes: ObscureMode[] = ['blur', 'zoom', 'pixel'];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  const origins = ['20% 30%', '80% 35%', '50% 15%', '35% 75%', '65% 70%', '50% 50%'];
  const zoomOrigin = origins[Math.floor(Math.random() * origins.length)];
  const label = mode === 'blur' 
    ? 'DESENFOQUE ÓPTICO PROFUNDO' 
    : mode === 'zoom' 
    ? 'MACRO ZOOM // DETALLE ALEATORIO' 
    : 'PIXELACIÓN DIGITAL MOSAICO';
  return { mode, label, zoomOrigin };
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const HelmetGuessGameView: React.FC = () => {
  const [questions, setQuestions] = useState<HelmetQuestion[]>(() => shuffleArray(REAL_HELMETS));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [unlockedClues, setUnlockedClues] = useState<number>(1);
  const [obscureConfig, setObscureConfig] = useState<ObscureConfig>(() => getRandomObscureConfig());
  const [step, setStep] = useState<number>(0); // 0 = initial, 1 = clue 1 used, 2 = clue 2 used, 3 = revealed
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  const { addCoins } = useStore();
  const currentQ = questions[currentIndex] || REAL_HELMETS[0];

  // Randomly shuffle options so the correct answer is NEVER in a fixed position
  const shuffledOptions = React.useMemo(() => {
    return shuffleArray(currentQ.options);
  }, [currentQ.id]);

  const handleRevealClue = () => {
    if (unlockedClues < currentQ.clues.length) {
      setUnlockedClues(prev => prev + 1);
      setStep(prev => prev + 1);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(opt);
    const win = opt === currentQ.driverName;
    setIsCorrect(win);
    setStep(3); // Fully reveal helmet

    if (win) {
      const points = Math.max(20, 100 - (unlockedClues - 1) * 25);
      setScore(prev => prev + points);
      addCoins(points);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setUnlockedClues(1);
      setStep(0);
      setObscureConfig(getRandomObscureConfig());
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setGameFinished(true);
    }
  };

  const restart = () => {
    setQuestions(shuffleArray(REAL_HELMETS));
    setCurrentIndex(0);
    setUnlockedClues(1);
    setStep(0);
    setObscureConfig(getRandomObscureConfig());
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setGameFinished(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[9px] uppercase tracking-[0.25em] font-bold mb-1">
            AUTHENTIC F1 HELMET ARCHIVE // REAL GRAPHICS
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-syne tracking-tighter uppercase text-white">
            HELMET <span className="text-[#e10600]">GUESS</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-white/50">
            CASCO {currentIndex + 1} / {REAL_HELMETS.length}
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-white/10 rounded-sm">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-[10px] font-mono text-white/50 uppercase">PUNTOS:</span>
            <span className="text-lg font-mono font-black text-white">{score}</span>
          </div>
        </div>
      </div>

      {!gameFinished ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Visual Showcase: Real Transparent PNG Helmet */}
          <div className="p-8 bg-[#0c0c0c] border border-white/10 rounded-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
            {/* Subtle glow backdrop */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700"
              style={{
                background: `radial-gradient(circle at center, rgba(225, 6, 0, 0.25) 0%, transparent 70%)`
              }}
            />

            {/* Visual Mode Badge */}
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 border border-white/10 text-[9px] font-mono text-white/60 uppercase tracking-widest flex items-center gap-1.5 z-20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
              <span>{obscureConfig.label}</span>
            </div>

            {/* Real Helmet PNG with Progressive Distortion / Reveal */}
            <div className="relative w-full max-w-[280px] h-[240px] flex items-center justify-center overflow-hidden rounded-md">
              <motion.img
                key={currentQ.id + obscureConfig.mode}
                src={currentQ.image}
                alt="F1 Helmet"
                className="max-w-full max-h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] transition-all duration-700 select-none pointer-events-none"
                style={{
                  ...(step >= 3
                    ? {
                        filter: 'blur(0px) drop-shadow(0 15px 30px rgba(0,0,0,0.9))',
                        transform: 'scale(1) translate(0, 0)',
                        imageRendering: 'auto'
                      }
                    : obscureConfig.mode === 'blur'
                    ? {
                        filter: `blur(${step === 0 ? 22 : step === 1 ? 14 : 7}px) drop-shadow(0 15px 30px rgba(0,0,0,0.9))`,
                        transform: 'scale(1)',
                        imageRendering: 'auto'
                      }
                    : obscureConfig.mode === 'zoom'
                    ? {
                        filter: `blur(${step === 0 ? 3 : 0}px) drop-shadow(0 15px 30px rgba(0,0,0,0.9))`,
                        transform: `scale(${step === 0 ? 3.4 : step === 1 ? 2.3 : 1.5})`,
                        transformOrigin: obscureConfig.zoomOrigin,
                        imageRendering: 'auto'
                      }
                    : {
                        // Pixelated mosaic mode: Keep helmet full size in the frame, applying clean contrast and stepped SVG mosaic
                        filter: step === 0 
                          ? 'drop-shadow(0 15px 30px rgba(0,0,0,0.9)) contrast(160%) saturate(140%)' 
                          : step === 1 
                          ? 'drop-shadow(0 15px 30px rgba(0,0,0,0.9)) contrast(130%)' 
                          : 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))',
                        transform: 'scale(1)',
                        imageRendering: 'pixelated' as any
                      })
                }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />

              {/* Pixelation overlay grid when in pixel mode so it looks like authentic 8-bit / 16-bit arcade console */}
              {obscureConfig.mode === 'pixel' && step < 3 && (
                <div 
                  className="absolute inset-0 pointer-events-none rounded-md"
                  style={{
                    backdropFilter: step === 0 ? 'blur(16px)' : step === 1 ? 'blur(8px)' : 'blur(4px)',
                    backgroundImage: step === 0 
                      ? 'radial-gradient(#000 35%, transparent 35%), linear-gradient(0deg, rgba(0,0,0,0.6) 50%, transparent 50%), linear-gradient(90deg, rgba(0,0,0,0.6) 50%, transparent 50%)'
                      : step === 1
                      ? 'linear-gradient(0deg, rgba(0,0,0,0.3) 50%, transparent 50%), linear-gradient(90deg, rgba(0,0,0,0.3) 50%, transparent 50%)'
                      : 'none',
                    backgroundSize: step === 0 ? '16px 16px, 16px 16px, 16px 16px' : '8px 8px, 8px 8px',
                    opacity: step === 0 ? 0.95 : 0.7
                  }}
                />
              )}
            </div>

            {step < 3 && (
              <span className="mt-4 text-[9px] font-mono uppercase text-white/40 tracking-widest flex items-center gap-1.5">
                <Eye size={12} />
                <span>
                  {obscureConfig.mode === 'blur' && `DESENFOQUE ÓPTICO: ${step === 0 ? 'MÁXIMO (22px)' : step === 1 ? 'MEDIO (14px)' : 'LEVE (7px)'}`}
                  {obscureConfig.mode === 'zoom' && `MACRO ZOOM: ${step === 0 ? '340% (SECTOR OCULTO)' : step === 1 ? '230% AMPLITUD' : '150% AMPLITUD'}`}
                  {obscureConfig.mode === 'pixel' && `RESOLUCIÓN MOSAICO: ${step === 0 ? 'ULTRA BAJA (8-BIT)' : step === 1 ? '16-BIT PARCIAL' : '32-BIT DEFINICIÓN'}`}
                </span>
              </span>
            )}

            {/* Revealed Grand Prix, Season and Historical Detail Box */}
            {selectedAnswer && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xs text-left w-full space-y-2"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white uppercase">{currentQ.driverName}</span>
                    <span className="text-[10px] font-mono text-[#e10600] font-bold">({currentQ.team} • {currentQ.year})</span>
                  </div>
                  {isCorrect ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> ¡CORRECTO!
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-red-400 font-bold flex items-center gap-1">
                      <XCircle size={13} /> ERA {currentQ.driverName.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-yellow-400 font-bold flex items-center gap-1.5 flex-wrap">
                    <span>🏁 GRAN PREMIO / TEMPORADA:</span>
                    <span className="text-white/90 font-normal">{currentQ.event}</span>
                  </div>
                  <p className="text-[11px] font-mono text-white/70 leading-relaxed">
                    {currentQ.historicalContext}
                  </p>
                  <p className="text-[10px] font-mono text-white/40 italic">
                    Librea: {currentQ.helmetDescription}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Clues & Options Panel */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* Clues Box */}
            <div className="p-5 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <KeyRound size={12} className="text-yellow-400" />
                  <span>PISTAS CONFIDENCIALES ({unlockedClues} / {currentQ.clues.length})</span>
                </span>
                {unlockedClues < currentQ.clues.length && !selectedAnswer && (
                  <button
                    onClick={handleRevealClue}
                    className="text-[9px] font-mono text-yellow-400 hover:text-yellow-300 uppercase underline cursor-pointer"
                  >
                    Desvelar más (-25 pts)
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {currentQ.clues.slice(0, unlockedClues).map((clue, idx) => (
                  <div key={idx} className="p-2.5 bg-white/[0.02] border border-white/5 text-xs font-mono text-white/80 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">#{idx + 1}</span>
                    <span>{clue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Multi-Choice Option Buttons - SHUFFLED DYNAMICALLY (NEVER ALWAYS IN TOP-LEFT) */}
            <div className="space-y-2">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest block">
                SELECCIONA EL PILOTO AL QUE PERTENECE EL CASCO:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {shuffledOptions.map((opt) => {
                  const isChosen = selectedAnswer === opt;
                  const isRealCorrect = selectedAnswer && opt === currentQ.driverName;
                  const isWrong = isChosen && !isRealCorrect;

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={!!selectedAnswer}
                      className={`p-3.5 text-left border rounded-xs font-f1 font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-between cursor-pointer ${
                        isRealCorrect
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                          : isWrong
                          ? 'bg-red-950/80 border-red-500 text-red-300'
                          : selectedAnswer
                          ? 'bg-[#101010] border-white/5 text-white/30'
                          : 'bg-[#121212] hover:bg-white/10 border-white/10 text-white'
                      }`}
                    >
                      <span>{opt}</span>
                      {isRealCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
                      {isWrong && <XCircle size={16} className="text-red-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Round Button */}
            {selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2"
              >
                <button
                  onClick={nextQuestion}
                  className="w-full py-3.5 bg-white hover:bg-white/90 text-black font-syne font-black text-xs uppercase tracking-widest transition-all rounded-xs shadow-lg"
                >
                  {currentIndex + 1 < REAL_HELMETS.length ? 'SIGUIENTE CASCO' : 'VER RESULTADO FINAL'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        /* Final Results */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-[#0c0c0c] border border-white/15 rounded-sm text-center space-y-4"
        >
          <Trophy size={48} className="text-yellow-400 mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-black font-syne text-white uppercase tracking-tight">
            ¡DESAFÍO DE CASCOS REALES COMPLETADO!
          </h2>
          <p className="text-white/60 font-mono text-sm">
            Has conseguido <span className="text-emerald-400 font-bold">{score} puntos</span> reconociendo los cascos originales de la historia de la F1.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={restart}
              className="px-6 py-3 bg-white text-black font-syne font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span>JUGAR DE NUEVO</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
