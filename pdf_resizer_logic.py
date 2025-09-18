"""
🔧 PDF REDIMENSIONADOR - LÓGICA EXTRAÍDA DE MANGA_DOWNLOADER_EDGE
================================================================

Funciones Python adaptadas para trabajar en el navegador con Pyodide
Basado en la lógica original de EdgeMangaDownloader.images_to_pdf()
"""

import io
import base64
from collections import Counter
from PIL import Image


class PDFResizer:
    """Redimensionador de PDFs usando la lógica del manga downloader"""
    
    def __init__(self):
        self.logger_messages = []
    
    def log(self, message):
        """Logging simple para el navegador"""
        self.logger_messages.append(message)
        print(f"[PDFResizer] {message}")
    
    def analyze_image_widths(self, image_data_list):
        """
        Analizar anchos de imágenes - EXTRAÍDO DE TU CÓDIGO ORIGINAL
        Encuentra el ancho más común usando Counter (tu lógica exacta)
        """
        try:
            self.log(f"Analizando {len(image_data_list)} páginas...")
            
            widths = []
            for i, image_data in enumerate(image_data_list):
                try:
                    # Convertir base64 a imagen
                    image_bytes = base64.b64decode(image_data.split(',')[1])
                    with Image.open(io.BytesIO(image_bytes)) as img:
                        widths.append(img.width)
                        if (i + 1) % 10 == 0:
                            self.log(f"Analizadas {i + 1}/{len(image_data_list)} páginas")
                except Exception as e:
                    self.log(f"Error analizando página {i + 1}: {str(e)}")
                    continue
            
            if not widths:
                self.log("ERROR: No se pudieron analizar las imágenes")
                return None
            
            # TU LÓGICA EXACTA: Encontrar el ancho más común
            width_counts = Counter(widths)
            target_width = width_counts.most_common(1)[0][0]
            
            self.log(f"Anchos encontrados: {dict(width_counts)}")
            self.log(f"Ancho objetivo seleccionado: {target_width}px")
            
            return {
                'target_width': target_width,
                'width_distribution': dict(width_counts),
                'total_pages': len(widths),
                'pages_to_resize': sum(1 for w in widths if w != target_width)
            }
            
        except Exception as e:
            self.log(f"Error en análisis: {str(e)}")
            return None
    
    def resize_images_uniform_width(self, image_data_list, target_width, quality=1.0):
        """
        Redimensionar imágenes con ancho uniforme - ADAPTADO DE TU CÓDIGO
        Preserva proporción como en tu images_to_pdf()
        """
        try:
            self.log(f"Redimensionando a ancho: {target_width}px (calidad: {quality}x)")
            
            resized_images = []
            
            for i, image_data in enumerate(image_data_list):
                try:
                    # Convertir base64 a imagen
                    image_bytes = base64.b64decode(image_data.split(',')[1])
                    
                    with Image.open(io.BytesIO(image_bytes)) as img:
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                        
                        original_width, original_height = img.size
                        
                        # TU LÓGICA EXACTA: Solo redimensionar si es diferente
                        if original_width != target_width:
                            scale_factor = target_width / original_width
                            new_height = int(original_height * scale_factor * quality)
                            img_resized = img.resize((target_width, new_height), Image.Resampling.LANCZOS)
                        else:
                            # Si ya tiene el ancho correcto, mantener original
                            new_height = int(original_height * quality)
                            if quality != 1.0:
                                img_resized = img.resize((target_width, new_height), Image.Resampling.LANCZOS)
                            else:
                                img_resized = img.copy()
                        
                        # Convertir de vuelta a base64
                        buffer = io.BytesIO()
                        img_resized.save(buffer, format='JPEG', quality=95)
                        img_base64 = base64.b64encode(buffer.getvalue()).decode()
                        
                        resized_images.append({
                            'data': f"data:image/jpeg;base64,{img_base64}",
                            'width': target_width,
                            'height': img_resized.height,
                            'original_size': (original_width, original_height),
                            'resized': original_width != target_width
                        })
                    
                    if (i + 1) % 5 == 0:
                        self.log(f"Procesadas {i + 1}/{len(image_data_list)} páginas")
                        
                except Exception as e:
                    self.log(f"Error procesando página {i + 1}: {str(e)}")
                    continue
            
            self.log(f"✅ Redimensionado completado: {len(resized_images)} páginas")
            return resized_images
            
        except Exception as e:
            self.log(f"Error en redimensionado: {str(e)}")
            return []
    
    def get_statistics(self, analysis_result, resized_images):
        """Generar estadísticas del proceso"""
        if not analysis_result or not resized_images:
            return {}
        
        stats = {
            'total_pages': analysis_result['total_pages'],
            'target_width': analysis_result['target_width'],
            'pages_resized': analysis_result['pages_to_resize'],
            'pages_unchanged': analysis_result['total_pages'] - analysis_result['pages_to_resize'],
            'width_distribution': analysis_result['width_distribution'],
            'process_success': len(resized_images) == analysis_result['total_pages']
        }
        
        return stats


# Función global para usar desde JavaScript
def create_pdf_resizer():
    """Crear instancia del redimensionador"""
    return PDFResizer()

def resize_pdf_pages(image_data_list, quality=1.0):
    """
    Función principal que replica tu lógica completa:
    1. Analizar anchos (tu Counter logic)
    2. Encontrar ancho más común
    3. Redimensionar manteniendo proporción
    """
    resizer = create_pdf_resizer()

    # Paso 1: Analizar anchos (tu lógica exacta)
    analysis = resizer.analyze_image_widths(image_data_list)
    if not analysis:
        return {'success': False, 'error': 'No se pudo analizar los anchos'}

    # Paso 2: Redimensionar con ancho uniforme (tu algoritmo)
    resized_images = resizer.resize_images_uniform_width(
        image_data_list,
        analysis['target_width'],
        quality
    )

    # Paso 3: Generar estadísticas
    stats = resizer.get_statistics(analysis, resized_images)

    # Limpiar datos no serializables
    for img in resized_images:
        if 'original_size' in img:
            # Convertir tupla a lista para Pyodide/JS
            img['original_size'] = list(img['original_size'])

    return {
        'success': True,
        'resized_images': resized_images,
        'statistics': stats,
        'logs': resizer.logger_messages
    }