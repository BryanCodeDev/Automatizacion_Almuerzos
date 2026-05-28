/**
 * Helper para validación de días hábiles en Colombia
 */

// Festivos fijos en Colombia (mes, día)
const FESTIVOS_FIJOS = [
  { mes: 1, dia: 1 },   // Año Nuevo
  { mes: 1, dia: 6 },   // Reyes Magos
  { mes: 3, dia: 19 },  // San José
  { mes: 3, dia: 28 },  // Festivo bancario (31 de marzo - 3 días)
  { mes: 5, dia: 1 },   // Día del Trabajo
  { mes: 5, dia: 28 },  // Festivo bancario (29-31 mayo)
  { mes: 6, dia: 25 },  // San Pedro y San Pablo (26-27) -> 25
  { mes: 7, dia: 20 },  // Festivo bancario
  { mes: 8, dia: 15 },  // Festivo bancario
  { mes: 10, dia: 12 }, // Festivo bancario
  { mes: 10, dia: 31 }, // Halloween / festivo bancario
  { mes: 11, dia: 7 },  // Todos los Santos
  { mes: 11, dia: 14 }, // Festivo bancario
  { mes: 12, dia: 8 },  // Inmaculada Concepción
  { mes: 12, dia: 25 }, // Navidad
];

// Festivos móviles (calculados según Ley Emiliani)
// Estos se calculan basados en el calendario gregoriano
function calcularFestivosMoviles(anio) {
  const festivos = [];
  
  // Semana Santa (martes y miércoles)
  const domingoPascua = obtenerDomingoPascua(anio);
  const martesSanto = restarDias(new Date(domingoPascua), 2);
  const miercolesSanto = restarDias(new Date(domingoPascua), 3);
  
  festivos.push({ mes: martesSanto.getMonth() + 1, dia: martesSanto.getDate() });
  festivos.push({ mes: miercolesSanto.getMonth() + 1, dia: miercolesSanto.getDate() });
  
  // Asunción (15 de agosto) - Festivo bancario viernes
  festivos.push({ mes: 8, dia: 15 });
  
  // Todo los Santos + festivo bancario (7 + 2 = 9 de noviembre)
  const todosSantos = new Date(anio, 10, 7);
  festivos.push({ mes: 11, dia: 7 });
  
  // Inmaculada Concepción (8 de diciembre) - ya está en festivos fijos
  
  // Navidad + festivo bancario
  festivos.push({ mes: 12, dia: 25 });
  
  return festivos;
}

// Calcular domingo de Pascua usando algoritmo de Meeus/Jones/Butcher
function obtenerDomingoPascua(anio) {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(anio, mes - 1, dia);
}

function restarDias(fecha, dias) {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setDate(nuevaFecha.getDate() - dias);
  return nuevaFecha;
}

// Obtener todos los festivos del año
function getFestivosColombiaAnio(anio) {
  const festivos = [...FESTIVOS_FIJOS];
  const moviles = calcularFestivosMoviles(anio);
  
  // Combinar y remover duplicados
  const todos = [...festivos, ...moviles];
  const unicos = [];
  const vistos = new Set();
  
  for (const f of todos) {
    const key = `${f.mes}-${f.dia}`;
    if (!vistos.has(key)) {
      vistos.add(key);
      unicos.push(f);
    }
  }
  
  return unicos;
}

// Verificar si una fecha es festivo
function esFestivo(fecha, festivos = null) {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  
  const festivosAnio = festivos || getFestivosColombiaAnio(anio);
  
  return festivosAnio.some(f => f.mes === mes && f.dia === dia);
}

// Verificar si una fecha es día hábil (lunes-viernes, no festivo)
function esDiaHabil(fecha) {
  const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ... 6 = sábado
  
  // Sábado (6) o domingo (0) no son hábiles
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }
  
  // Para el servicio de almuerzos, usamos días hábiles del calendario (no festivos)
  return true;
}

// Obtener el próximo día hábil desde hoy
function proximoDiaHabil(fechaDesde = new Date()) {
  let fecha = new Date(fechaDesde);
  fecha.setHours(0, 0, 0, 0);
  fecha.setDate(fecha.getDate() + 1);
  
  while (!esDiaHabil(fecha)) {
    fecha.setDate(fecha.getDate() + 1);
  }
  
  return fecha;
}

// Obtener el rango lunes-viernes de la semana actual
function semanaActual() {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0 = domingo, 1 = lunes, ...
  
  // Si es domingo, la semana empieza el lunes pasado
  // Si es sábado, la semana terminó el viernes
  const diferenciaLunes = dia === 0 ? -6 : (dia === 0 ? 0 : 1 - dia);
  
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + (diferenciaLunes || (dia === 0 ? -6 : 1 - dia)));
  lunes.setHours(0, 0, 0, 0);
  
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  
  return {
    desde: lunes.toISOString().slice(0, 10),
    hasta: viernes.toISOString().slice(0, 10)
  };
}

module.exports = {
  esDiaHabil,
  proximoDiaHabil,
  getFestivosColombiaAnio,
  esFestivo,
  semanaActual
};