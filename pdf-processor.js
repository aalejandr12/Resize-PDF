/**
 * 🚀 PDF PROCESSOR - INTEGRACIÓN PYODIDE + PDF.js
 * ================================================
 * 
 * Usa la lógica exacta del EdgeMangaDownloader adaptada para navegador
 * 1. PDF.js para convertir PDF → imágenes
 * 2. Pyodide para ejecutar tu código Python de redimensionado
 * 3. PDF-lib para regenerar PDF final
 */

class PDFProcessor {
    constructor() {
        this.pyodide = null;
        this.pdfDoc = null;
        this.currentFile = null;
        this.isProcessing = false;
        this.setupPDFJS();
    }

    setupPDFJS() {
        // Configurar PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }

    async initializePyodide() {
        if (this.pyodide) return true;
        
        try {
            console.log('🐍 Inicializando Pyodide...');
            this.updateProgress(10, 'Cargando Python...');
            
            this.pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
            });
            
            this.updateProgress(30, 'Instalando librerías...');
            
            // Instalar librerías necesarias
            await this.pyodide.loadPackage(['pillow', 'numpy']);
            
            this.updateProgress(50, 'Cargando lógica de redimensionado...');
            
            // Cargar nuestro código Python
            const pythonCode = await fetch('pdf_resizer_logic.py').then(r => r.text());
            this.pyodide.runPython(pythonCode);
            
            console.log('✅ Pyodide inicializado con tu lógica de redimensionado');
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando Pyodide:', error);
            return false;
        }
    }

    async loadPDF(file) {
        try {
            console.log('📄 Cargando PDF:', file.name);
            this.currentFile = file;
            
            const arrayBuffer = await file.arrayBuffer();
            this.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            const info = {
                name: file.name,
                size: this.formatFileSize(file.size),
                pageCount: this.pdfDoc.numPages
            };
            
            this.displayFileInfo(info);
            console.log('✅ PDF cargado:', info);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error cargando PDF:', error);
            return false;
        }
    }

    async convertPDFToImages() {
        if (!this.pdfDoc) {
            throw new Error('No hay PDF cargado');
        }

        try {
            console.log('🖼️ Convirtiendo PDF a imágenes...');
            const images = [];
            const pageCount = this.pdfDoc.numPages;
            
            for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
                this.updateProgress(
                    50 + (pageNum / pageCount) * 30, 
                    `Convirtiendo página ${pageNum}/${pageCount}...`
                );
                
                const page = await this.pdfDoc.getPage(pageNum);
                
                // Configurar escala para buena calidad
                const viewport = page.getViewport({ scale: 2.0 });
                
                // Crear canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                // Renderizar página
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                // Convertir a base64
                const imageData = canvas.toDataURL('image/jpeg', 0.95);
                images.push(imageData);
            }
            
            console.log(`✅ ${images.length} páginas convertidas a imágenes`);
            return images;
            
        } catch (error) {
            console.error('❌ Error convirtiendo PDF:', error);
            throw error;
        }
    }

    async analyzeAndResizeWithPython(imageDataList, quality = 1.0) {
        if (!this.pyodide) {
            throw new Error('Pyodide no inicializado');
        }

        try {
            console.log('🧮 Ejecutando lógica Python de redimensionado...');
            this.updateProgress(80, 'Analizando anchos con Python...');
            
            // Pasar datos a Python
            this.pyodide.globals.set("image_data_list", imageDataList);
            this.pyodide.globals.set("quality_factor", quality);
            
            // Ejecutar tu lógica exacta
            const pythonCode = `
result = resize_pdf_pages(image_data_list, quality_factor)
result
            `;
            
            const result = this.pyodide.runPython(pythonCode);
            
            if (!result || !result.success) {
                throw new Error('Error en el procesamiento Python');
            }
            
            console.log('✅ Procesamiento Python completado:', result.statistics);
            return result;
            
        } catch (error) {
            console.error('❌ Error en procesamiento Python:', error);
            throw error;
        }
    }

    async createPDFFromImages(resizedImages) {
        try {
            console.log('📋 Creando PDF final...');
            this.updateProgress(90, 'Generando PDF final...');
            
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.create();
            
            for (let i = 0; i < resizedImages.length; i++) {
                const imageData = resizedImages[i];
                
                // Convertir base64 a bytes
                const imageBytes = Uint8Array.from(
                    atob(imageData.data.split(',')[1]), 
                    c => c.charCodeAt(0)
                );
                
                // Embedar imagen en PDF
                const image = await pdfDoc.embedJpg(imageBytes);
                
                // Crear página con el tamaño exacto de la imagen
                const page = pdfDoc.addPage([imageData.width, imageData.height]);
                
                // Dibujar imagen
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: imageData.width,
                    height: imageData.height,
                });
                
                if ((i + 1) % 10 === 0) {
                    console.log(`Procesadas ${i + 1}/${resizedImages.length} páginas en PDF`);
                }
            }
            
            const pdfBytes = await pdfDoc.save();
            console.log('✅ PDF final creado');
            
            return pdfBytes;
            
        } catch (error) {
            console.error('❌ Error creando PDF:', error);
            throw error;
        }
    }

    async processPDF(quality = 1.0) {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.updateProgress(0, 'Iniciando procesamiento...');
            
            // 1. Inicializar Pyodide
            if (!await this.initializePyodide()) {
                throw new Error('No se pudo inicializar Python');
            }
            
            // 2. Convertir PDF a imágenes
            const imageDataList = await this.convertPDFToImages();
            
            // 3. Procesar con tu lógica Python
            const result = await this.analyzeAndResizeWithPython(imageDataList, quality);
            
            // 4. Mostrar análisis
            this.displayAnalysisResults(result.statistics);
            
            // 5. Crear PDF final
            const pdfBytes = await this.createPDFFromImages(result.resized_images);
            
            // 6. Preparar descarga
            this.preparePDFDownload(pdfBytes);
            
            this.updateProgress(100, '✅ Procesamiento completado!');
            this.showResults();
            
            console.log('🎉 Procesamiento completado exitosamente');
            
        } catch (error) {
            console.error('❌ Error en procesamiento:', error);
            this.showError(`Error: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    preparePDFDownload(pdfBytes) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentFile.name.replace('.pdf', '')}_redimensionado.pdf`;
            a.click();
        };
    }

    // Métodos de UI
    updateProgress(percentage, message) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = message;
    }

    displayFileInfo(info) {
        document.getElementById('fileName').textContent = info.name;
        document.getElementById('fileSize').textContent = info.size;
        document.getElementById('pageCount').textContent = info.pageCount;
        document.getElementById('fileInfo').style.display = 'block';
        document.getElementById('analysisSection').style.display = 'block';
    }

    displayAnalysisResults(stats) {
        const resultsDiv = document.getElementById('analysisResults');
        resultsDiv.innerHTML = `
            <div class="analysis-stats">
                <div class="stat-item">
                    <strong>Ancho objetivo:</strong> ${stats.target_width}px
                </div>
                <div class="stat-item">
                    <strong>Páginas a redimensionar:</strong> ${stats.pages_resized}
                </div>
                <div class="stat-item">
                    <strong>Páginas sin cambios:</strong> ${stats.pages_unchanged}
                </div>
                <div class="stat-item">
                    <strong>Distribución de anchos:</strong>
                    <div class="width-distribution">
                        ${Object.entries(stats.width_distribution)
                          .map(([width, count]) => `${width}px: ${count} páginas`)
                          .join('<br>')}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('targetWidth').value = stats.target_width;
        document.getElementById('configSection').style.display = 'block';
    }

    showResults() {
        document.getElementById('resultsSection').style.display = 'block';
    }

    showError(message) {
        alert(message);
        this.updateProgress(0, 'Error en procesamiento');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Instancia global
window.pdfProcessor = new PDFProcessor();