// ═══════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN DEL NEGOCIO — único archivo de código a editar
//  Cliente: Dra. Omaira Frontado S. · Medicina Interna
// ═══════════════════════════════════════════════════════════════════

export const NEGOCIO = {
  // ── Identidad de la app ──
  nombreApp: 'DoctorHub',
  descripcionApp: 'Sistema de gestión — Dra. Omaira Frontado',

  // ── Dueña del negocio ──
  nombreCorto: 'Dra. Omaira',                       // saludo del dashboard
  nombreCompleto: 'Dra. Omaira Frontado S.',        // reportes PDF y WhatsApp
  saludo: 'Bienvenida',
  descripcionProfesional: 'internista',

  // ── Lugar de trabajo (egresos, mensajes) ──
  ciudad: 'Puerto Cabello',   // encabeza la fecha del informe médico
  lugar: 'consultorio',
  Lugar: 'Consultorio',
  emojiLugar: '🏥',

  // ── Colores PWA ──
  colorTema: '#2563eb',
  colorFondo: '#eff6ff',

  // ── Catálogos: servicios de la Dra. Omaira ──
  motivosCita: ['Consulta', 'MAPA', 'Holter del ritmo', 'Valoración cardiovascular', 'Revaloración'],
  motivosRapidos: ['Consulta', 'MAPA', 'Holter del ritmo', 'Valoración cardiovascular', 'Revaloración'],
  motivoDefault: 'Consulta',
  conceptosIngreso: ['Consulta', 'MAPA', 'Holter del ritmo', 'Valoración cardiovascular', 'Revaloración'],
  // La primera categoría es la seleccionada por defecto al registrar un egreso
  categoriasEgreso: ['Alquiler consultorio','Electricidad / Agua / Internet','Suministros médicos','Equipos médicos','Personal / Honorarios','Publicidad','Impuestos','Mantenimiento','Transporte','Otro'],

  // ── Mensaje de WhatsApp para reactivar pacientes sin cita reciente ──
  msgSeguimiento: (nombre) =>
    `Hola ${nombre}, le saludamos del consultorio de la Dra. Omaira Frontado. Le recordamos que es importante continuar con sus controles. ¿Le gustaría agendar una cita? 😊`,

  // ── Módulos activos ──
  modulos: {
    recipes: true,   // récipes digitales con indicaciones, exportables en PDF
    informes: true,  // informes médicos en hoja con membrete
  },

  // ── Dominio que se imprime en el QR de verificación ──
  // El papel dura años: el QR debe apuntar SIEMPRE al mismo dominio,
  // aunque se imprima desde otra URL. Vacío = usa el dominio actual.
  // Si más adelante se le pone dominio propio, este de Vercel debe seguir
  // existiendo: los récipes ya impresos apuntan aquí para siempre.
  urlPublica: 'https://omaira-doctorhub.vercel.app',

  // ── Datos que encabezan el récipe médico ──
  // Nombre y credenciales tomados de su sello oficial.
  medico: {
    nombre: 'Dra. Omaira Frontado S.',
    especialidad: 'Medicina Interna',
    cedula: '24304725',
    mpps: '134225',
    cm: '13926',
    correo: '',
    // Firma y sello escaneados: se estampan al pie del récipe.
    // Dejar en '' si prefiere firmar cada hoja a mano.
    sello: '/sello.png',
  },

  // ── Sedes donde atiende (aparecen al pie del récipe) ──
  sedes: [
    { nombre: 'Prevaler',                 direccion: 'Puerto Cabello' },
    { nombre: 'Cruz Roja',                direccion: 'Puerto Cabello' },
    { nombre: 'Santo Tomás de Aquino',    direccion: 'Puerto Cabello' },
    { nombre: 'Clínica Venezuela',        direccion: 'Puerto Cabello' },
  ],


}

// ── Terminología: cómo se llama a las personas atendidas ──
// 'paciente' (género f para pacientes mujeres) | 'cliente' (género m genérico)
const persona = 'paciente'
const genero = 'm' // 'f' → "paciente registrada" · 'm' → "paciente registrado"

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export const TERM = {
  s: persona,             // paciente
  p: persona + 's',       // pacientes
  S: cap(persona),        // Paciente
  P: cap(persona) + 's',  // Pacientes
  o: genero === 'f' ? 'a' : 'o',        // sufijo: registrad{o}s, tod{o}s
  un: genero === 'f' ? 'una' : 'un',    // "Selecciona {un} {s}"
  Nueva: genero === 'f' ? 'Nueva' : 'Nuevo', // título "Nuevo Paciente"
}
