// ═══════════════════════════════════════════════════════════════════
//  Membrete común de los documentos impresos (récipes e informes).
//  Vive aparte para que las dos hojas salgan idénticas: si cambia el
//  encabezado o el pie, cambia en las dos a la vez.
// ═══════════════════════════════════════════════════════════════════

// Logo de la app en azul, incrustado para que aparezca en la ventana de impresión
export const LOGO_MEMBRETE = 'data:image/png;base64,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'

// Se escriben igual que en su sello: CI: V-24.304.725 · MPPS: 134.225 · CM: 13926
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export function credenciales(med) {
  return [
    med.cedula ? `CI: V-${miles(med.cedula)}` : '',
    med.mpps ? `MPPS: ${miles(med.mpps)}` : '',
    med.cm ? `CM: ${med.cm}` : '',
  ].filter(Boolean).join(' &nbsp; ')
}

// Encabezado: logo a la izquierda, datos de la doctora centrados, regla debajo.
export function membrete(med, logo = LOGO_MEMBRETE) {
  return `
    <div class="cab">
      <img class="logo" src="${logo}" alt="">
      <div class="doc">
        <h1>${med.nombre}</h1>
        <p class="esp">${med.especialidad}</p>
        <p class="cred">${credenciales(med)}</p>
        ${med.correo ? `<p class="cred">Correo: ${med.correo}</p>` : ''}
      </div>
      <span class="equilibrio"></span>
    </div>
    <div class="regla"></div>`
}

// Pie: sello escaneado a la izquierda, código validador y QR a la derecha.
// Sin sello configurado deja el espacio para firmar a mano.
export function pieHoja({ med, sede, qrSvg = '', codigo = '', base = '', conSello = true }) {
  const sello = conSello && med.sello ? `${window.location.origin}${med.sello}` : ''
  const dominio = String(base).replace(/^https?:\/\//, '')

  const validador = codigo ? `
    <div class="validador">
      ${qrSvg ? `<div class="qr">${qrSvg}</div>` : ''}
      <p class="val-cod">Código Validador: <b>${codigo}</b></p>
      <p class="val-url">Verifícalo en ${dominio}/verificar</p>
    </div>` : ''

  return `
    <div class="pie">
      <div class="pie-fila">
        <div class="pie-firma">
          ${sello
            ? `<img class="sello" src="${sello}" alt="">`
            : `<div class="espacio-firma"></div><p class="firma">${med.nombre}</p>`}
        </div>
        ${validador}
      </div>
      <div class="regla"></div>
      <p class="sede">${sede ? `${sede.nombre}${sede.direccion ? ', ' + sede.direccion : ''}` : ''}</p>
    </div>`
}

// Estilos compartidos por las dos hojas.
export const estilosHoja = `
    .cab { display: flex; align-items: center; gap: 8px; }
    .cab .logo { width: 34px; height: 34px; flex-shrink: 0; }
    .cab .equilibrio { width: 34px; flex-shrink: 0; }
    .doc { flex: 1; text-align: center; }
    h1 { font-size: 11pt; margin: 0; color: #1d4ed8; }
    .esp { margin: 1px 0 0; font-size: 8.5pt; color: #2563eb; font-weight: bold; }
    .cred { margin: 1px 0 0; font-size: 7pt; color: #444; }
    .regla { border-top: 2px solid #2563eb; margin: 7px 0; }
    .pie { margin-top: auto; padding-top: 10px; }
    .pie-fila { display: flex; align-items: flex-end; justify-content: space-between; gap: 4mm; }
    .pie-firma { min-width: 0; flex: 1; }
    .validador { flex-shrink: 0; width: 34mm; text-align: center; }
    .validador .qr { width: 26mm; height: 26mm; margin: 0 auto; }
    .validador .qr svg { width: 100%; height: 100%; display: block; shape-rendering: crispEdges; }
    .val-cod { margin: 1mm 0 0; font-size: 6pt; color: #111; white-space: nowrap; }
    .val-url { margin: 0.5mm 0 0; font-size: 5pt; color: #666; line-height: 1.25; word-break: break-word; }
    .sello { display: block; width: 34mm; height: auto; margin: 0 0 2px; }
    .espacio-firma { height: 16mm; }
    .firma { margin: 0 0 2px; font-size: 8.5pt; font-weight: bold; color: #1d4ed8; }
    .sede { margin: 3px 0 0; font-size: 7.5pt; color: #444; }`
