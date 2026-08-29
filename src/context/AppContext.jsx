import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [pacientes, setPacientes] = useState([])
  const [ingresos,  setIngresos]  = useState([])
  const [citas,     setCitas]     = useState([])
  const [egresos,   setEgresos]   = useState([])
  const [recipes,   setRecipes]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // ── Carga inicial ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function cargarDatos() {
      // Solo cargar si hay sesión activa (BUG-30)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || cancelled) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const [resPacientes, resIngresos, resCitas, resEgresos, resRecipes] = await Promise.all([
          supabase.from('pacientes').select('*').order('created_at', { ascending: false }).limit(5000),
          supabase.from('ingresos').select('*').order('created_at',  { ascending: false }).limit(5000),
          supabase.from('citas').select('*').order('created_at',     { ascending: false }).limit(5000),
          supabase.from('egresos').select('*').order('created_at',   { ascending: false }).limit(5000),
          supabase.from('recipes').select('*').order('created_at',   { ascending: false }).limit(5000),
        ])

        if (cancelled) return

        if (resPacientes.error) throw resPacientes.error
        if (resIngresos.error)  throw resIngresos.error
        if (resCitas.error)     throw resCitas.error
        if (resEgresos.error)   throw resEgresos.error
        if (resRecipes.error)   throw resRecipes.error

        setPacientes(resPacientes.data || [])
        setIngresos(resIngresos.data   || [])
        setCitas(resCitas.data         || [])
        setEgresos(resEgresos.data     || [])
        setRecipes(resRecipes.data     || [])
      } catch (err) {
        if (!cancelled) {
          console.error('[Supabase] Error al cargar datos:', err.message)
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    cargarDatos()

    // Recargar datos al autenticarse, limpiar al cerrar sesión (BUG-30)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setLoading(true)
        setError(null)
        cargarDatos()
      } else if (event === 'SIGNED_OUT') {
        setPacientes([])
        setIngresos([])
        setCitas([])
        setEgresos([])
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // ── Pacientes ──────────────────────────────────────────────
  const agregarPaciente = async (datos) => {
    const { data, error } = await supabase
      .from('pacientes')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setPacientes(prev => [data, ...prev])
    return data
  }

  const actualizarPaciente = async (id, datos) => {
    const { data, error } = await supabase
      .from('pacientes')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setPacientes(prev => prev.map(p => p.id === id ? data : p))
  }

  const eliminarPaciente = async (id) => {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id)
    if (error) throw error
    setPacientes(prev => prev.filter(p => p.id !== id))
    setIngresos(prev  => prev.filter(i => i.paciente_id !== id))
    setCitas(prev     => prev.filter(c => c.paciente_id !== id))
    setRecipes(prev   => prev.filter(r => r.paciente_id !== id))
  }

  // ── Ingresos ───────────────────────────────────────────────
  const agregarIngreso = async (datos) => {
    const { data, error } = await supabase
      .from('ingresos')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setIngresos(prev => [data, ...prev])
    return data
  }

  const actualizarIngreso = async (id, datos) => {
    const { data, error } = await supabase
      .from('ingresos')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setIngresos(prev => prev.map(i => i.id === id ? data : i))
  }

  const eliminarIngreso = async (id) => {
    const { error } = await supabase
      .from('ingresos')
      .delete()
      .eq('id', id)
    if (error) throw error
    setIngresos(prev => prev.filter(i => i.id !== id))
  }

  // ── Citas ──────────────────────────────────────────────────
  const agregarCita = async (datos) => {
    const { data, error } = await supabase
      .from('citas')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setCitas(prev => [data, ...prev])
    return data
  }

  const actualizarCita = async (id, datos) => {
    const { data, error } = await supabase
      .from('citas')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setCitas(prev => prev.map(c => c.id === id ? data : c))
  }

  const eliminarCita = async (id) => {
    const { error } = await supabase
      .from('citas')
      .delete()
      .eq('id', id)
    if (error) throw error
    setCitas(prev => prev.filter(c => c.id !== id))
  }

  // ── Egresos ────────────────────────────────────────────────
  const agregarEgreso = async (datos) => {
    const { data, error } = await supabase
      .from('egresos')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setEgresos(prev => [data, ...prev])
    return data
  }

  const actualizarEgreso = async (id, datos) => {
    const { data, error } = await supabase
      .from('egresos')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setEgresos(prev => prev.map(e => e.id === id ? data : e))
  }

  const eliminarEgreso = async (id) => {
    const { error } = await supabase
      .from('egresos')
      .delete()
      .eq('id', id)
    if (error) throw error
    setEgresos(prev => prev.filter(e => e.id !== id))
  }

  // ── Récipes médicos ──────────────────────────────────────
  const agregarRecipe = async (datos) => {
    const { data, error } = await supabase
      .from('recipes')
      .insert(datos)
      .select()
      .single()
    if (error) throw error
    setRecipes(prev => [data, ...prev])
    return data
  }

  const actualizarRecipe = async (id, datos) => {
    const { data, error } = await supabase
      .from('recipes')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setRecipes(prev => prev.map(r => r.id === id ? data : r))
  }

  const eliminarRecipe = async (id) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
    if (error) throw error
    setRecipes(prev => prev.filter(r => r.id !== id))
  }

  return (
    <AppContext.Provider value={{
      pacientes, ingresos, citas, egresos, recipes,
      loading, error,
      agregarPaciente, actualizarPaciente, eliminarPaciente,
      agregarIngreso, actualizarIngreso, eliminarIngreso,
      agregarCita, actualizarCita, eliminarCita,
      agregarEgreso, actualizarEgreso, eliminarEgreso,
      agregarRecipe, actualizarRecipe, eliminarRecipe,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
