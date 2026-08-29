import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Save, Printer, Trash2, Plus, X, Pill } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { NEGOCIO, TERM } from '../config/negocio'
import { hoyVE } from '../lib/fecha'

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
      <div class="doc">
        <h1>${med.nombre}</h1>
        <p class="esp">${med.especialidad}</p>
        <p class="cred">${credenciales}</p>
        ${med.correo ? `<p class="cred">Correo: ${med.correo}</p>` : ''}
      </div>
    </div>
    <div class="regla"></div>
    <p class="datos">${datosPaciente}</p>`

  const pie = `
    <div class="pie">
      <div class="regla"></div>
      <p class="firma">${med.nombre}</p>
      <p class="sede">${sede ? `${sede.nombre}${sede.direccion ? ', ' + sede.direccion : ''}` : ''}</p>
    </div>`

  // Una sola hoja: cada medicamento con su indicación debajo, sin repetir
  const hoja = `
    <section class="hoja">
      ${encabezado}
      <p class="titulo">RP.</p>
      <ol class="meds">
        ${meds.map(m => `
          <li>
            <b>${m.nombre}</b>
            ${m.indicaciones ? `<p class="ind">${m.indicaciones}</p>` : ''}
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
    @page { margin: 14mm 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #111; margin: 0; }
    .hoja { min-height: 96vh; display: flex; flex-direction: column; }
    .cab { text-align: center; }
    h1 { font-size: 14pt; margin: 0; color: #1d4ed8; }
    .esp { margin: 2px 0 0; font-size: 10pt; color: #2563eb; font-weight: bold; }
    .cred { margin: 2px 0 0; font-size: 8.5pt; color: #444; }
    .regla { border-top: 2px solid #2563eb; margin: 10px 0; }
    .datos { font-size: 9pt; margin: 0 0 14px; }
    .titulo {
      font-size: 11pt; font-weight: bold; color: #2563eb; margin: 0 0 10px;
      background: #eff6ff; border-left: 3px solid #2563eb; padding: 5px 10px;
    }
    ol.meds { margin: 0; padding-left: 20px; }
    ol.meds li { margin-bottom: 10px; font-size: 10.5pt; }
    .ind { margin: 2px 0 0; font-size: 9pt; font-style: italic; color: #333; }
    .generales-tit { font-size: 10pt; font-weight: bold; margin: 18px 0 6px; }
    .generales p { margin: 0 0 3px; font-size: 9.5pt; }
    .pie { margin-top: auto; padding-top: 24px; }
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
