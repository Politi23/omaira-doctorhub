import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Save, Printer, Trash2, Plus, X, Pill } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { NEGOCIO, TERM } from '../config/negocio'
import { hoyVE } from '../lib/fecha'

// Logo de la app en azul, incrustado para que aparezca en la ventana de impresión
const LOGO_RECIPE = 'data:image/png;base64,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'

const MEDICAMENTO_VACIO = { nombre: '', indicaciones: '' }

function formatFecha(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── Récipe en PDF, con el mismo formato que usa la doctora ──
function imprimirRecipe(recipe, paciente) {
  const med = NEGOCIO.medico
  const sede = NEGOCIO.sedes.find(s => s.nombre === recipe.sede) || NEGOCIO.sedes[0]
  const meds = Array.isArray(recipe.medicamentos) ? recipe.medicamentos : []
  const generales = (recipe.indicaciones_generales || '').split('\n').filter(l => l.trim())

  const credenciales = [
    med.cedula ? `V: ${med.cedula}` : '',
    med.mpps ? `MPPS: ${med.mpps}` : '',
    med.cm ? `CM: ${med.cm}` : '',
  ].filter(Boolean).join(' &nbsp; ')

  const datosPaciente = [
    `<b>Fecha:</b> ${formatFecha(recipe.fecha)}`,
    `<b>Paciente:</b> ${recipe.paciente_nombre}`,
    recipe.paciente_cedula ? `<b>Cédula:</b> ${recipe.paciente_cedula}` : '',
    recipe.paciente_nacimiento ? `<b>F. Nac:</b> ${formatFecha(recipe.paciente_nacimiento)}` : '',
  ].filter(Boolean).join(' &nbsp;•&nbsp; ')

  const encabezado = `
    <div class="cab">
      <img class="logo" src="${LOGO_RECIPE}" alt="">
      <div class="doc">
        <h1>${med.nombre}</h1>
        <p class="esp">${med.especialidad}</p>
        <p class="cred">${credenciales}</p>
        ${med.correo ? `<p class="cred">Correo: ${med.correo}</p>` : ''}
      </div>
      <span class="equilibrio"></span>
    </div>
    <div class="regla"></div>
    <p class="datos">${datosPaciente}</p>`

  const pie = `
    <div class="pie">
      <div class="regla"></div>
      <p class="firma">${med.nombre}</p>
      <p class="sede">${sede ? `${sede.nombre}${sede.direccion ? ', ' + sede.direccion : ''}` : ''}</p>
    </div>`

  // Una sola hoja con las dos secciones: RP. (para la farmacia)
  // e Ind. (las indicaciones para el paciente).
  const hoja = `
    <section class="hoja">
      ${encabezado}

      <p class="titulo">RP.</p>
      <ol class="meds rp">
        ${meds.map(m => `<li><b>${m.nombre}</b></li>`).join('')}
      </ol>

      <p class="titulo">Ind.</p>
      <ol class="meds">
        ${meds.map(m => `
          <li>
            <b>${m.nombre}</b>
            ${m.indicaciones ? `<p class="ind">Indicaciones: ${m.indicaciones}</p>` : ''}
          </li>`).join('')}
      </ol>

      ${generales.length ? `
        <p class="generales-tit">INDICACIONES GENERALES:</p>
        <div class="generales">${generales.map(l => `<p>${l}</p>`).join('')}</div>` : ''}

      ${pie}
    </section>`

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Récipe — ${recipe.paciente_nombre}</title>
  <style>
    @page { margin: 12mm 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; color: #111; margin: 0; }
    .hoja { min-height: 96vh; display: flex; flex-direction: column; }
    .cab { display: flex; align-items: center; gap: 12px; }
    .cab .logo { width: 46px; height: 46px; flex-shrink: 0; }
    .cab .equilibrio { width: 46px; flex-shrink: 0; }
    .doc { flex: 1; text-align: center; }
    h1 { font-size: 13.5pt; margin: 0; color: #1d4ed8; }
    .esp { margin: 2px 0 0; font-size: 9.5pt; color: #2563eb; font-weight: bold; }
    .cred { margin: 2px 0 0; font-size: 8pt; color: #444; }
    .regla { border-top: 2px solid #2563eb; margin: 8px 0; }
    .datos { font-size: 8.5pt; margin: 0 0 12px; }
    .titulo {
      font-size: 10.5pt; font-weight: bold; color: #2563eb; margin: 0 0 8px;
      background: #eff6ff; border-left: 3px solid #2563eb; padding: 4px 10px;
    }
    ol.meds { margin: 0 0 14px; padding-left: 20px; }
    ol.meds li { margin-bottom: 7px; font-size: 10pt; }
    ol.meds.rp li { margin-bottom: 4px; }
    .ind { margin: 1px 0 0; font-size: 8.5pt; font-style: italic; color: #333; }
    .generales-tit { font-size: 9.5pt; font-weight: bold; margin: 6px 0 5px; }
    .generales p { margin: 0 0 2px; font-size: 9pt; }
    .pie { margin-top: auto; padding-top: 20px; }
    .firma { margin: 0; font-size: 9.5pt; font-weight: bold; color: #1d4ed8; }
    .sede { margin: 2px 0 0; font-size: 8.5pt; color: #444; }
    @media print { body { margin: 0; } }
  </style></head><body>
  ${hoja}
  <script>window.onload=()=>window.print()<\/script></body></html>`

  const w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
}

export default function Recipes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { pacientes, recipes, agregarRecipe, eliminarRecipe } = useApp()

  const paciente = pacientes.find(p => p.id === id)
  const mios = recipes.filter(r => r.paciente_id === id).sort((a, b) => b.fecha.localeCompare(a.fecha))

  const [creando, setCreando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [confirmar, setConfirmar] = useState(null)
  const [form, setForm] = useState({
    fecha: hoyVE(),
    sede: NEGOCIO.sedes[0]?.nombre || '',
    medicamentos: [{ ...MEDICAMENTO_VACIO }],
    indicaciones_generales: '',
  })

  if (!paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card text-center py-10">
          <p className="text-white/60 mb-4">{TERM.S} no encontrad{TERM.o}</p>
          <button onClick={() => navigate('/pacientes')} className="glass-btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Volver</button>
        </div>
      </div>
    )
  }

  const set = (c, v) => setForm(prev => ({ ...prev, [c]: v }))

  const setMed = (i, campo, valor) => {
    setForm(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.map((m, k) => k === i ? { ...m, [campo]: valor } : m),
    }))
  }
  const agregarMed = () => setForm(prev => ({ ...prev, medicamentos: [...prev.medicamentos, { ...MEDICAMENTO_VACIO }] }))
  const quitarMed = (i) => setForm(prev => ({
    ...prev,
    medicamentos: prev.medicamentos.length > 1 ? prev.medicamentos.filter((_, k) => k !== i) : prev.medicamentos,
  }))


  const abrirNuevo = () => {
    setForm({
      fecha: hoyVE(),
      sede: NEGOCIO.sedes[0]?.nombre || '',
      medicamentos: [{ ...MEDICAMENTO_VACIO }],
      indicaciones_generales: '',
    })
    setCreando(true)
  }

  const guardar = async () => {
    const meds = form.medicamentos.filter(m => m.nombre.trim())
    if (meds.length === 0) { toast('Agrega al menos un medicamento', 'error'); return }
    setGuardando(true)
    try {
      await agregarRecipe({
        paciente_id: id,
        paciente_nombre: `${paciente.nombre} ${paciente.apellido}`,
        paciente_cedula: paciente.cedula || null,
        paciente_nacimiento: paciente.fecha_nacimiento || null,
        fecha: form.fecha,
        sede: form.sede,
        medicamentos: meds,
        indicaciones_generales: form.indicaciones_generales.trim(),
      })
      toast('Récipe guardado', 'success')
      setCreando(false)
    } catch (e) {
      toast(e.message || 'Error al guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Récipes" back
        action={
          !creando ? (
            <button onClick={abrirNuevo} className="glass-btn-icon w-10 h-10 flex items-center justify-center">
              <Plus size={19} className="text-white" />
            </button>
          ) : (
            <button onClick={() => setCreando(false)} className="glass-btn-icon w-10 h-10 flex items-center justify-center">
              <X size={18} className="text-white/70" />
            </button>
          )
        }
      />

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Paciente */}
        <div className="glass-card text-center py-4 space-y-0.5">
          <h2 className="text-white text-lg font-bold">{paciente.nombre} {paciente.apellido}</h2>
          <p className="text-white/50 text-sm">
            {paciente.cedula || 'Sin cédula'}
            {paciente.fecha_nacimiento && ` · Nac. ${formatFecha(paciente.fecha_nacimiento)}`}
          </p>
          {!paciente.fecha_nacimiento && (
            <button onClick={() => navigate(`/pacientes/${id}/editar`)} className="text-amber-300/80 text-xs underline">
              Falta la fecha de nacimiento para el récipe
            </button>
          )}
        </div>

        {/* Nuevo récipe */}
        {creando && (
          <div className="glass-card space-y-4">
            <p className="text-white font-semibold text-sm">Nuevo récipe</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="glass-label">Fecha</label>
                <input type="date" className="glass-input" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
              </div>
              <div>
                <label className="glass-label">Sede</label>
                <select className="glass-input" value={form.sede} onChange={e => set('sede', e.target.value)}>
                  {NEGOCIO.sedes.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* Medicamentos */}
            <div className="space-y-3">
              <label className="glass-label mb-0">Medicamentos</label>
              {form.medicamentos.map((m, i) => (
                <div key={i} className="rounded-2xl px-3 py-3 space-y-2"
                     style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 text-xs font-bold w-4">{i + 1}.</span>
                    <input className="glass-input flex-1" placeholder="Nombre, dosis y presentación"
                           value={m.nombre} maxLength={160}
                           onChange={e => setMed(i, 'nombre', e.target.value)} />
                    {form.medicamentos.length > 1 && (
                      <button onClick={() => quitarMed(i)} className="text-red-400/60 active:text-red-400 flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <input className="glass-input" placeholder="Indicaciones: dosis, frecuencia y duración"
                         value={m.indicaciones} maxLength={240}
                         onChange={e => setMed(i, 'indicaciones', e.target.value)} />
                </div>
              ))}
              <button onClick={agregarMed}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold text-white/60 active:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.20)' }}>
                <Plus size={15} /> Agregar medicamento
              </button>
            </div>

            {/* Indicaciones generales */}
            <div>
              <label className="glass-label">Indicaciones generales</label>
              <textarea className="glass-input" rows={5}
                        placeholder="Una indicación por línea..."
                        value={form.indicaciones_generales}
                        onChange={e => set('indicaciones_generales', e.target.value)} />
            </div>

            <button onClick={guardar} disabled={guardando} className="glass-btn-primary" style={guardando ? { opacity: 0.6 } : {}}>
              <Save size={18} />
              {guardando ? 'Guardando…' : 'Guardar récipe'}
            </button>
          </div>
        )}

        {/* Listado */}
        {mios.length === 0 && !creando && (
          <div className="glass-card text-center py-12">
            <Pill size={32} className="text-white/25 mx-auto mb-3" />
            <p className="text-white/45 text-sm mb-4">Sin récipes emitidos</p>
            <div className="flex justify-center">
              <button onClick={abrirNuevo} className="glass-btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                Crear primer récipe
              </button>
            </div>
          </div>
        )}

        {mios.map(r => {
          const meds = Array.isArray(r.medicamentos) ? r.medicamentos : []
          return (
            <div key={r.id} className="glass-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold text-sm">{formatFecha(r.fecha)}</span>
                  {r.sede && <span className="text-white/35 text-xs"> · {r.sede}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => imprimirRecipe(r, paciente)}
                          className="flex items-center gap-1.5 text-blue-300 text-xs font-semibold">
                    <Printer size={13} /> PDF
                  </button>
                  <button onClick={() => setConfirmar(r)} className="text-red-400/55 active:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <ol className="space-y-1.5">
                {meds.map((m, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-white/90">{i + 1}. {m.nombre}</span>
                    {m.indicaciones && <p className="text-white/40 text-xs pl-4">{m.indicaciones}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>

      {/* Confirmar eliminación */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div className="glass-strong w-full max-w-sm rounded-3xl p-6 space-y-4">
            <h3 className="text-white font-bold text-lg text-center">¿Eliminar récipe?</h3>
            <p className="text-white/60 text-sm text-center">
              Récipe del {formatFecha(confirmar.fecha)}. Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmar(null)} className="py-3 rounded-2xl text-white/80 font-semibold text-sm"
                      style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
                Cancelar
              </button>
              <button onClick={async () => { await eliminarRecipe(confirmar.id); setConfirmar(null) }}
                      className="py-3 rounded-2xl text-white font-semibold text-sm"
                      style={{ background: 'rgba(239,68,68,0.55)', border: '1px solid rgba(239,68,68,0.50)' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
