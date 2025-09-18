/**
 * 🎛️ INTERFAZ PRINCIPAL - MANEJO DE EVENTOS Y UI
 * ==============================================
 */

// Variables globales
let currentPDF = null;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeInterface();
    setupEventListeners();
});

function initializeInterface() {
    console.log('🚀 Inicializando interfaz PDF Redimensionador');
    
    // Configurar slider de calidad
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = `${this.value}x`;
    });
}

function setupEventListeners() {
    // Input de archivo
    const pdfInput = document.getElementById('pdfInput');
    const uploadArea = document.getElementById('uploadArea');
    
    // Eventos de archivo
    pdfInput.addEventListener('change', handleFileSelect);
    
    // Drag & Drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    // Clics en área de carga
    uploadArea.addEventListener('click', () => {
        if (!pdfInput.disabled) {
            pdfInput.click();
        }
    });
}

// Manejo de archivos
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        await loadPDF(file);
    } else {
        alert('❌ Por favor selecciona un archivo PDF válido');
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

async function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
            await loadPDF(file);
        } else {
            alert('❌ Por favor arrastra un archivo PDF válido');
        }
    }
}

// Cargar PDF
async function loadPDF(file) {
    try {
        console.log('📄 Cargando PDF:', file.name);
        
        // Deshabilitar input mientras se procesa
        const pdfInput = document.getElementById('pdfInput');
        pdfInput.disabled = true;
        
        // Actualizar UI
        updateUploadArea('Cargando PDF...', true);
        
        // Cargar con el procesador
        const success = await window.pdfProcessor.loadPDF(file);
        
        if (success) {
            updateUploadArea('✅ PDF cargado correctamente', false);
            currentPDF = file;
        } else {
            throw new Error('No se pudo cargar el PDF');
        }
        
    } catch (error) {
        console.error('❌ Error cargando PDF:', error);
        alert(`Error cargando PDF: ${error.message}`);
        resetUploadArea();
    } finally {
        const pdfInput = document.getElementById('pdfInput');
        if (pdfInput) {
            pdfInput.disabled = false;
        }
    }
}

// Procesar PDF (llamada desde el botón)
async function processPDF() {
    if (!currentPDF) {
        alert('❌ No hay PDF cargado');
        return;
    }
    
    try {
        // Obtener configuración
        const quality = parseFloat(document.getElementById('qualitySlider').value);
        
        // Deshabilitar botón
        const processBtn = document.getElementById('processBtn');
        const originalText = processBtn.textContent;
        processBtn.disabled = true;
        processBtn.textContent = '🔄 Procesando...';
        
        // Procesar con el procesador
        await window.pdfProcessor.processPDF(quality);
        
        // Restaurar botón
        processBtn.disabled = false;
        processBtn.textContent = originalText;
        
    } catch (error) {
        console.error('❌ Error procesando PDF:', error);
        alert(`Error procesando PDF: ${error.message}`);
        
        // Restaurar botón
        const processBtn = document.getElementById('processBtn');
        processBtn.disabled = false;
        processBtn.textContent = '🚀 Procesar PDF';
    }
}

// Reiniciar todo
function resetAll() {
    // Limpiar variables
    currentPDF = null;
    
    // Ocultar secciones
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('analysisSection').style.display = 'none';
    document.getElementById('configSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    
    // Resetear input
    const pdfInput = document.getElementById('pdfInput');
    if (pdfInput) {
        pdfInput.value = '';
        pdfInput.disabled = false;
    }
    
    // Resetear área de carga
    resetUploadArea();
    
    // Resetear configuración
    document.getElementById('qualitySlider').value = 1.0;
    document.getElementById('qualityValue').textContent = '1.0x';
    
    console.log('🔄 Interfaz reiniciada');
}

// Helpers de UI
function updateUploadArea(message, loading = false) {
    const uploadArea = document.getElementById('uploadArea');
    const uploadContent = uploadArea.querySelector('.upload-content');
    
    if (loading) {
        uploadContent.innerHTML = `
            <div class="upload-icon">⏳</div>
            <h3>${message}</h3>
            <div class="loading-spinner"></div>
        `;
        uploadArea.classList.add('loading');
    } else {
        uploadContent.innerHTML = `
            <div class="upload-icon">✅</div>
            <h3>${message}</h3>
            <p>Archivo cargado correctamente</p>
        `;
        uploadArea.classList.add('success');
    }
}

function resetUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadContent = uploadArea.querySelector('.upload-content');
    
    uploadContent.innerHTML = `
        <div class="upload-icon">📄</div>
        <h3>Arrastra tu PDF aquí</h3>
        <p>o haz clic para seleccionar</p>
        <button class="btn-upload" onclick="document.getElementById('pdfInput').click()">
            Seleccionar PDF
        </button>
    `;
    
    uploadArea.classList.remove('loading', 'success', 'drag-over');
}

// Funciones de demostración
function showInfo() {
    alert(`
🔧 PDF REDIMENSIONADOR

Basado en la lógica de EdgeMangaDownloader:

1. Analiza todas las páginas del PDF
2. Encuentra el ancho más común usando Counter()
3. Redimensiona todas las páginas a ese ancho
4. Mantiene las proporciones originales
5. Genera un nuevo PDF uniforme

✨ Funciona completamente en tu navegador
🔒 Tus archivos no se suben a ningún servidor
    `);
}

// Exponer funciones globales necesarias
window.processPDF = processPDF;
window.resetAll = resetAll;
window.showInfo = showInfo;