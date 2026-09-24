import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function AdminImportarKayako() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Estado general
  const [activeTab, setActiveTab] = useState('db'); // 'db' o 'sql'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  // Estadísticas detectadas antes del procesamiento
  const [detectedStats, setDetectedStats] = useState(null);

  // Parámetros de la Base de Datos
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: '',
    prefix: 'sw'
  });

  // Archivo SQL subido
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Manejadores de cambios de Base de Datos
  const handleDbChange = (e) => {
    const { name, value } = e.target;
    setDbConfig(prev => ({ ...prev, [name]: value }));
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.sql')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Por favor, selecciona un archivo con extensión .sql");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  // Simular barra de progreso dinámica durante la importación
  const runProgressSimulation = (finalMessage, callback) => {
    setImportProgress(10);
    setProgressStatus('Conectando e iniciando la migración...');
    
    const intervals = [
      { t: 1500, p: 35, s: 'Importando Departamentos y mapeando flujos de trabajo...' },
      { t: 3000, p: 55, s: 'Creando cuentas de agentes y asignando permisos...' },
      { t: 5000, p: 80, s: 'Migrando tickets de soporte e historiales de estado...' },
      { t: 7000, p: 95, s: 'Indexando hilo de notas y conversaciones internas...' },
      { t: 8500, p: 100, s: 'Finalizando importación y limpiando caché...' }
    ];

    intervals.forEach(step => {
      setTimeout(() => {
        setImportProgress(step.p);
        setProgressStatus(step.s);
        if (step.p === 100) {
          setTimeout(() => {
            callback();
          }, 800);
        }
      }, step.t);
    });
  };

  // Validar y conectar a la base de datos de Kayako
  const handleTestConnection = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setDetectedStats(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/importar-kayako/conectar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Error al conectar con la base de datos de Kayako');

      setDetectedStats(data.estadisticas);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Procesar importación desde la Base de Datos
  const handleImportFromDb = async () => {
    setError(null);
    setLoading(true);
    setImportProgress(5);
    setProgressStatus('Iniciando handshake con Kayako...');

    try {
      runProgressSimulation('Mapeo de DB exitoso', async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/importar-kayako/procesar-conexion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbConfig)
          });
          const data = await response.json();

          if (!response.ok) throw new Error(data.error || 'Error procesando la importación');

          setSuccessData(data.estadisticas);
        } catch (err) {
          setError(err.message);
          setImportProgress(0);
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setImportProgress(0);
    }
  };

  // Procesar importación desde Archivo SQL subido
  const handleImportSqlFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Por favor, selecciona un archivo SQL.");
      return;
    }

    setError(null);
    setLoading(true);
    setImportProgress(5);
    setProgressStatus('Subiendo y leyendo archivo SQL...');

    const formData = new FormData();
    formData.append('sqlFile', selectedFile);

    try {
      runProgressSimulation('Lectura de SQL exitosa', async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/importar-kayako/subir-sql`, {
            method: 'POST',
            body: formData
          });
          const data = await response.json();

          if (!response.ok) throw new Error(data.error || 'Error procesando el archivo SQL');

          setSuccessData(data.estadisticas);
        } catch (err) {
          setError(err.message);
          setImportProgress(0);
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setImportProgress(0);
    }
  };

  return (
    <div className="crm-container">
      {/* Botón de retorno rápido */}
      <header className="crm-header" style={{ marginBottom: '30px' }}>
        <div className="header-top">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '1.4rem',
                letterSpacing: '-0.02em',
                padding: '8px 16px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(15, 164, 222, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>DACAS</span>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Importar desde Kayako
                </h1>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Migración estructurada de departamentos, agentes, tickets y conversaciones
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'var(--pill-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '999px',
                padding: '6px 14px',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <span>🇦🇷</span>
                <span>DACAS Argentina</span>
              </div>

              <div className="user-controls">
                <button className="nav-btn" onClick={() => navigate('/')}>
                  🔙 Volver al Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {successData ? (
        /* PANTALLA DE ÉXITO */
        <section className="form-section" style={{ textAlign: 'center', padding: '50px 30px', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2.2rem', color: 'var(--success)' }}>
            ¡Importación Finalizada con Éxito!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '15px auto 40px auto' }}>
            Los datos históricos se han mapeado e insertado correctamente en el sistema. Los agentes importados ya pueden iniciar sesión y los tickets históricos están asignados y disponibles en el panel.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            maxWidth: '700px',
            margin: '0 auto 40px auto'
          }}>
            <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', flex: '1 1 140px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{successData.departamentos}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '5px' }}>🏢 Departamentos</div>
            </div>
            <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', flex: '1 1 140px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{successData.agentes}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '5px' }}>👤 Agentes</div>
            </div>
            <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', flex: '1 1 140px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{successData.tickets}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '5px' }}>📋 Tickets</div>
            </div>
            <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', flex: '1 1 140px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{successData.notas}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '5px' }}>💬 Mensajes/Notas</div>
            </div>
          </div>

          <button className="btn-submit" onClick={() => navigate('/')} style={{ maxWidth: '280px', margin: '0 auto' }}>
            Ir al Dashboard
          </button>
        </section>
      ) : importProgress > 0 ? (
        /* PANTALLA DE PROGRESO DE LA MIGRACIÓN */
        <section className="form-section" style={{ textAlign: 'center', padding: '60px 40px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Procesando Importación...</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Por favor, mantén esta ventana abierta. No recargues la página.</p>
          
          <div style={{
            width: '100%',
            maxWidth: '600px',
            background: 'var(--input-bg)',
            height: '24px',
            borderRadius: '12px',
            margin: '0 auto 20px auto',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: `${importProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary) 0%, #1e5fe3 100%)',
              transition: 'width 0.4s ease-out',
              borderRadius: '12px'
            }} />
          </div>

          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)', minHeight: '30px' }}>
            {importProgress}% - {progressStatus}
          </div>
        </section>
      ) : (
        /* FORMULARIOS DE SELECCIÓN DE MÉTODO DE IMPORTACIÓN */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* TABS DE SELECCIÓN */}
          <div style={{
            display: 'flex',
            background: 'var(--input-bg)',
            padding: '6px',
            borderRadius: 'var(--radius-pill)',
            width: 'fit-content',
            boxShadow: 'var(--shadow-sm)',
            margin: '0 auto'
          }}>
            <button
              onClick={() => { setActiveTab('db'); setError(null); }}
              style={{
                border: 'none',
                padding: '12px 30px',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.95rem',
                transition: 'var(--transition-bezier)',
                background: activeTab === 'db' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'db' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'db' ? 'var(--shadow-md)' : 'none'
              }}
            >
              🏢 Base de Datos MySQL Directa
            </button>
            <button
              onClick={() => { setActiveTab('sql'); setError(null); }}
              style={{
                border: 'none',
                padding: '12px 30px',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.95rem',
                transition: 'var(--transition-bezier)',
                background: activeTab === 'sql' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'sql' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'sql' ? 'var(--shadow-md)' : 'none'
              }}
            >
              📄 Cargar Archivo de Respaldo SQL
            </button>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              padding: '18px 24px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              border: '1px solid rgba(211, 47, 47, 0.1)',
              animation: 'shake 0.3s ease'
            }}>
              ⚠️ {error}
            </div>
          )}

          {activeTab === 'db' ? (
            /* CONEXIÓN DIRECTA A MYSQL */
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'start' }}>
              <section className="form-section" style={{ flex: '1 1 500px', minWidth: '320px' }}>
                <h3>Configuración de Conexión MySQL</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                  Ingresa las credenciales de conexión de la base de datos de tu servidor Kayako Classic. El sistema leerá temporalmente las tablas para extraer tickets, departamentos y notas.
                </p>

                <form onSubmit={handleTestConnection} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
                      <label>Servidor / Host *</label>
                      <input type="text" name="host" value={dbConfig.host} onChange={handleDbChange} required />
                    </div>
                    <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
                      <label>Puerto *</label>
                      <input type="number" name="port" value={dbConfig.port} onChange={handleDbChange} required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
                      <label>Usuario *</label>
                      <input type="text" name="user" value={dbConfig.user} onChange={handleDbChange} required />
                    </div>
                    <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
                      <label>Contraseña</label>
                      <input type="password" name="password" value={dbConfig.password} onChange={handleDbChange} placeholder="Vacío si no tiene" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
                      <label>Nombre de la Base de Datos *</label>
                      <input type="text" name="database" value={dbConfig.database} onChange={handleDbChange} placeholder="e.g. kayako_db" required />
                    </div>
                    <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
                      <label>Prefijo de Tablas *</label>
                      <input type="text" name="prefix" value={dbConfig.prefix} onChange={handleDbChange} placeholder="e.g. sw (por defecto)" required />
                    </div>
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '10px' }}>
                    {loading ? '⏳ Probando conexión...' : '🔍 Conectar y Analizar Base de Datos'}
                  </button>
                </form>
              </section>

              {detectedStats && (
                /* RESUMEN DE REGISTROS DETECTADOS */
                <section className="form-section" style={{
                  borderLeft: '4px solid var(--primary)',
                  boxShadow: 'var(--shadow-lg)',
                  animation: 'slideUp 0.3s ease',
                  flex: '0 0 350px',
                  minWidth: '300px'
                }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Conexión Exitosa ✅</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                    Se ha establecido conexión con la base de datos de Kayako. Hemos detectado los siguientes registros listos para importar:
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 25px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                      <span>🏢 Departamentos:</span>
                      <span style={{ color: 'var(--primary)' }}>{detectedStats.departamentos}</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                      <span>👤 Agentes (Staff):</span>
                      <span style={{ color: 'var(--primary)' }}>{detectedStats.agentes}</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                      <span>🏷️ Estados de Ticket:</span>
                      <span style={{ color: 'var(--primary)' }}>{detectedStats.estados}</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                      <span>📋 Tickets:</span>
                      <span style={{ color: 'var(--primary)' }}>{detectedStats.tickets}</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                      <span>💬 Mensajes/Conversas:</span>
                      <span style={{ color: 'var(--primary)' }}>{detectedStats.notas}</span>
                    </li>
                  </ul>

                  <button className="btn-submit" onClick={handleImportFromDb} style={{ background: 'var(--success)', boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)' }}>
                    ⚡ Iniciar Importación Ahora
                  </button>
                </section>
              )}
            </div>
          ) : (
            /* CARGAR ARCHIVO SQL */
            <section className="form-section">
              <h3>Importar mediante Archivo SQL</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                ¿Tu servidor de base de datos no está expuesto a la red o prefieres no ingresar credenciales? No hay problema. Sube un archivo `.sql` de respaldo (dump) de tu base de datos Kayako Classic. Analizaremos el archivo para importar los registros en un instante.
              </p>

              <form onSubmit={handleImportSqlFile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: dragActive ? '3px dashed var(--primary)' : '2px dashed rgba(0,0,0,0.15)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: dragActive ? 'rgba(58, 123, 246, 0.04)' : 'rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    transition: 'var(--transition-bezier)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: '3rem' }}>📄</div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    Arrastra y suelta tu archivo SQL aquí
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    O si lo prefieres, haz clic para buscar en tu dispositivo
                  </p>
                  <p style={{ margin: 0, color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                    Solo archivos con extensión .sql (Máximo 50MB recomendado)
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".sql"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>

                {selectedFile && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--primary-light)',
                    padding: '14px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(58, 123, 246, 0.1)',
                    gap: '15px'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedFile.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--danger)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <button type="submit" className="btn-submit" disabled={!selectedFile || loading}>
                  {loading ? '⏳ Analizando y Cargando SQL...' : '⚡ Procesar e Importar Archivo SQL'}
                </button>
              </form>
            </section>
          )}

        </div>
      )}
    </div>
  );
}

export default AdminImportarKayako;
