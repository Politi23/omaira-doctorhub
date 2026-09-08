import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Save, Printer, Trash2, X, FileText } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { NEGOCIO, TERM } from '../config/negocio'
import { hoyVE } from '../lib/fecha'
import QRCode from 'qrcode'
import { LOGO_MEMBRETE, membrete, estilosHoja, pieHoja } from '../lib/membrete'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function formatFecha(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// "Puerto Cabello, 22 de Octubre del 2019", como en los informes que ella usa
function fechaLarga(iso, lugar) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${lugar}, ${Number(d)} de ${MESES[Number(m) - 1]} del ${y}`
}

export function edadDesde(nacimiento) {
  if (!nacimiento) return ''
  const [y, m, d] = nacimiento.split('-').map(Number)
  const hoy = new Date(hoyVE() + 'T00:00:00')
  let años = hoy.getFullYear() - y
  const cumplioEsteAnio =
    hoy.getMonth() + 1 > m || (hoy.getMonth() + 1 === m && hoy.getDate() >= d)
  if (!cumplioEsteAnio) años -= 1
  if (años < 0) return ''
  return `${años} ${años === 1 ? 'AÑO' : 'AÑOS'}`
}

// ── Secciones del informe, en el orden en que se imprimen ──
// Todas son opcionales: la que quede vacía no aparece en la hoja.
const SECCIONES = [
  { campo: 'antecedentes',        titulo: 'Antecedentes',         etiquetaLinea: 'Antecedentes:' },
  { campo: 'funciones_biologicas', titulo: 'Funciones biológicas', etiquetaLinea: 'Funciones biológicas:' },
]
const BLOQUES = [
  { campo: 'examen_fisico', titulo: 'EXAMEN FÍSICO:' },
  { campo: 'diagnostico',   titulo: 'DIAGNÓSTICO:', listado: true },
  { campo: 'tratamiento',   titulo: 'TRATAMIENTO:' },
  { campo: 'plan_trabajo',  titulo: 'PLAN DE TRABAJO:' },
]

const escapar = (t) => String(t ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const parrafos = (texto) => String(texto || '')
  .split('\n').filter(l => l.trim())
  .map(l => `<p>${escapar(l)}</p>`).join('')

// ── Informe en PDF, hoja A4 vertical con su membrete ──
async function imprimirInforme(informe, opciones = {}) {
  const enBlanco = !!opciones.enBlanco
  // La ventana se abre YA, antes de cualquier await, o el navegador la bloquea.
  const w = window.open('', '_blank')
  const med = NEGOCIO.medico
  const sede = NEGOCIO.sedes.find(s => s.nombre === informe.sede) || NEGOCIO.sedes[0]

  const base = (NEGOCIO.urlPublica || window.location.origin).replace(/\/+$/, '')
  const urlVerificar = !enBlanco && informe.codigo ? `${base}/verificar/${informe.codigo}` : ''
  let qrSvg = ''
  if (urlVerificar) {
    try {
      qrSvg = await QRCode.toString(urlVerificar, { type: 'svg', margin: 3, errorCorrectionLevel: 'M' })
    } catch { qrSvg = '' }
  }

  const filaDato = (etiqueta, valor) =>
    `<tr><th>${etiqueta}</th><td>: ${escapar(valor)}</td></tr>`

  const cabecera = enBlanco ? '' : `
    <table class="ficha">
      ${filaDato('PACIENTE', informe.paciente_nombre)}
      ${informe.paciente_cedula ? filaDato('CÉDULA', informe.paciente_cedula) : ''}
      ${informe.edad ? filaDato('EDAD', informe.edad) : ''}
      ${filaDato('FECHA DE ATENCIÓN', fechaLarga(informe.fecha, NEGOCIO.ciudad || 'Puerto Cabello'))}
    </table>
    <div class="regla-fina"></div>`

  const cuerpo = enBlanco ? '<div class="espacio-escritura"></div>' : `
    ${informe.relato ? `<div class="relato">${parrafos(informe.relato)}</div>` : ''}
    ${SECCIONES.map(s => informe[s.campo]
      ? `<p class="linea"><b>${s.etiquetaLinea}</b> ${escapar(informe[s.campo]).replace(/\n/g, ' ')}</p>`
      : '').join('')}
    ${BLOQUES.map(b => {
      const v = informe[b.campo]
      if (!v || !String(v).trim()) return ''
      const contenido = b.listado
        ? `<ul class="dx">${String(v).split('\n').filter(l => l.trim())
            .map(l => `<li>${escapar(l)}</li>`).join('')}</ul>`
        : `<div class="bloque-texto">${parrafos(v)}</div>`
      return `<p class="bloque-tit">${b.titulo}</p>${contenido}`
    }).join('')}`

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Informe médico${enBlanco ? '' : ' — ' + escapar(informe.paciente_nombre)}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm 16mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; }
    .hoja { display: flex; flex-direction: column; min-height: 258mm; }
    ${estilosHoja}
    .titulo-hoja {
      text-align: center; font-size: 13pt; font-weight: bold; letter-spacing: .5px;
      text-decoration: underline; margin: 6mm 0 5mm;
    }
    table.ficha { border-collapse: collapse; width: 100%; font-size: 10pt; }
    table.ficha th { text-align: left; font-weight: bold; width: 42mm; padding: 0.6mm 0; vertical-align: top; }
    table.ficha td { padding: 0.6mm 0; }
    .regla-fina { border-top: 1px solid #333; margin: 3mm 0 4mm; }
    .relato p { margin: 0 0 2mm; font-size: 10pt; text-align: justify; line-height: 1.45; }
    .linea { margin: 0 0 1.5mm; font-size: 10pt; text-align: justify; line-height: 1.45; }
    .bloque-tit { font-size: 10pt; font-weight: bold; margin: 4mm 0 1.5mm; }
    .bloque-texto p { margin: 0 0 1.5mm; font-size: 10pt; text-align: justify; line-height: 1.45; }
    ul.dx { margin: 0; padding: 0; list-style: none; }
    ul.dx li { font-size: 10pt; margin-bottom: 0.8mm; text-transform: uppercase; }
    .espacio-escritura { flex: 1; min-height: 150mm; }
    .cuerpo { flex: 1; }
    @media print { body { margin: 0; } }
  </style></head><body>
  <div class="hoja">
    ${membrete(med, LOGO_MEMBRETE)}
    <p class="titulo-hoja">INFORME MÉDICO</p>
    <div class="cuerpo">
      ${cabecera}
      ${cuerpo}
    </div>
    ${pieHoja({ med, sede, qrSvg, codigo: enBlanco ? '' : informe.codigo, base, conSello: !enBlanco })}
  </div>
  <script>window.onload=()=>window.print()<\/script></body></html>`

  w.document.write(html)
  w.document.close()
}

export default function Informes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { pacientes, informes, agregarInforme, eliminarInforme } = useApp()

  const paciente = pacientes.find(p => p.id === id)
  const mios = (informes || [])
    .filter(r => r.paciente_id === id)
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))

  const [creando, setCreando]     = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [confirmar, setConfirmar] = useState(null)
  const [form, setForm] = useState(null)

  if (!paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card text-center py-10">
          <p className="text-white/60 mb-4">{TERM.S} no encontrad{TERM.o}</p>
          <button onClick={() => navigate('/pacientes')} className="glass-btn-primary"
                  style={{ width: 'auto', padding: '10px 24px' }}>Volver</button>
        </div>
      </div>
    )
  }

  const nombreCompleto = `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim()

  const abrirNuevo = () => {
    setForm({
      fecha: hoyVE(),
      sede: NEGOCIO.sedes[0]?.nombre || '',
      edad: edadDesde(paciente.fecha_nacimiento),
      relato: '',
      antecedentes: '',
      funciones_biologicas: '',
      examen_fisico: '',
      diagnostico: '',
      tratamiento: '',
      plan_trabajo: '',
    })
    setCreando(true)
  }

  const set = (c, v) => setForm(prev => ({ ...prev, [c]: v }))

  const guardar = async () => {
    if (!form.diagnostico.trim() && !form.relato.trim()) {
      toast.error('Escribe al menos el relato o el diagnóstico')
      return
    }
    setGuardando(true)
    try {
      await agregarInforme({
        paciente_id: paciente.id,
        paciente_nombre: nombreCompleto,
        paciente_cedula: paciente.cedula || null,
        edad: form.edad || null,
        fecha: form.fecha,
        sede: form.sede,
        relato: form.relato || null,
        antecedentes: form.antecedentes || null,
        funciones_biologicas: form.funciones_biologicas || null,
        examen_fisico: form.examen_fisico || null,
        diagnostico: form.diagnostico || null,
        tratamiento: form.tratamiento || null,
        plan_trabajo: form.plan_trabajo || null,
      })
      toast.exito('Informe guardado')
      setCreando(false)
      setForm(null)
    } catch (e) {
      toast.error('No se pudo guardar el informe')
    }
    setGuardando(false)
  }

  const campos = [
    { c: 'relato',               l: 'Motivo y cuadro actual', ph: 'Paciente de … que acude a consulta por …', filas: 5 },
    { c: 'antecedentes',         l: 'Antecedentes',           ph: 'Hipertensión arterial, alergias…',        filas: 2 },
    { c: 'funciones_biologicas', l: 'Funciones biológicas',   ph: 'Apetito conservado; sueño conservado…',    filas: 2 },
    { c: 'examen_fisico',        l: 'Examen físico',          ph: 'PA: 120/80 mmHg, FC: 78 lpm…',            filas: 5 },
    { c: 'diagnostico',          l: 'Diagnóstico',            ph: 'Uno por línea',                            filas: 4 },
    { c: 'tratamiento',          l: 'Tratamiento',            ph: 'Opcional',                                 filas: 3 },
    { c: 'plan_trabajo',         l: 'Plan de trabajo',        ph: 'Opcional',                                 filas: 3 },
  ]

  return (
    <>
      <PageHeader title="Informes médicos" back={`/pacientes/${id}`} />

      <div className="px-4 pb-28 space-y-4">

        <div className="glass-card">
          <p className="text-white font-semibold text-sm">{nombreCompleto}</p>
          {paciente.cedula && <p className="text-white/40 text-xs mt-0.5">{paciente.cedula}</p>}
        </div>

        {/* Acciones */}
        {!creando && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={abrirNuevo} className="glass-btn-primary flex items-center justify-center gap-2">
              <FileText size={15} /> Nuevo informe
            </button>
            <button onClick={() => imprimirInforme({ sede: NEGOCIO.sedes[0]?.nombre }, { enBlanco: true })}
                    className="glass-card flex items-center justify-center gap-2 text-white/70 text-sm font-semibold py-3">
              <Printer size={15} /> Hoja en blanco
            </button>
          </div>
        )}

        {/* Formulario */}
        {creando && form && (
          <div className="glass-card space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Nuevo informe</p>
              <button onClick={() => { setCreando(false); setForm(null) }} className="text-white/40">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="glass-label">Fecha</label>
                <input type="date" className="glass-input" value={form.fecha}
                       onChange={e => set('fecha', e.target.value)} />
              </div>
              <div>
                <label className="glass-label">Edad</label>
                <input className="glass-input" value={form.edad} placeholder="32 AÑOS"
                       onChange={e => set('edad', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="glass-label">Sede</label>
              <select className="glass-input" value={form.sede} onChange={e => set('sede', e.target.value)}>
                {NEGOCIO.sedes.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
              </select>
            </div>

            {campos.map(({ c, l, ph, filas }) => (
              <div key={c}>
                <label className="glass-label">{l}</label>
                <textarea className="glass-input" rows={filas} placeholder={ph}
                          value={form[c]} onChange={e => set(c, e.target.value)}
                          style={{ resize: 'vertical', lineHeight: 1.5 }} />
              </div>
            ))}

            <button onClick={guardar} disabled={guardando}
                    className="glass-btn-primary w-full flex items-center justify-center gap-2">
              <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar informe'}
            </button>
          </div>
        )}

        {/* Listado */}
        {mios.length === 0 && !creando && (
          <div className="glass-card text-center py-12">
            <FileText size={32} className="text-white/25 mx-auto mb-3" />
            <p className="text-white/45 text-sm">Sin informes emitidos</p>
          </div>
        )}

        {mios.map(r => (
          <div key={r.id} className="glass-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-white font-semibold text-sm">{formatFecha(r.fecha)}</span>
                {r.sede && <span className="text-white/35 text-xs"> · {r.sede}</span>}
                {r.codigo && (
                  <p className="text-white/30 text-[11px] font-mono tracking-wider mt-0.5">Cód. {r.codigo}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => imprimirInforme(r)}
                        className="flex items-center gap-1.5 text-blue-300 text-xs font-semibold">
                  <Printer size={13} /> PDF
                </button>
                <button onClick={() => setConfirmar(r)} className="text-red-400/55 active:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {r.diagnostico && (
              <p className="text-white/55 text-xs leading-relaxed">
                {String(r.diagnostico).split('\n').filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Confirmar eliminación */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
             style={{ background: 'rgba(0,0,0,0.55)' }} onClick={() => setConfirmar(null)}>
          <div className="glass-card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-white font-semibold">¿Eliminar informe?</p>
            <p className="text-white/45 text-sm">
              Informe del {formatFecha(confirmar.fecha)}. Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmar(null)}
                      className="py-3 rounded-2xl text-white/80 font-semibold text-sm"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>Cancelar</button>
              <button onClick={async () => { await eliminarInforme(confirmar.id); setConfirmar(null) }}
                      className="py-3 rounded-2xl text-white font-semibold text-sm"
                      style={{ background: 'rgba(239,68,68,0.8)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
