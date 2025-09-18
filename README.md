# 🔧 PDF Redimensionador - Ancho Uniforme

> **Herramienta web para uniformizar el ancho de todas las páginas de un PDF**  
> Basada en la lógica inteligente del **EdgeMangaDownloader**

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://tuusuario.github.io/pdf-redimensionador)
[![Python](https://img.shields.io/badge/Python-Pyodide-green)](https://pyodide.org/)
[![PDF.js](https://img.shields.io/badge/PDF.js-Mozilla-red)](https://mozilla.github.io/pdf.js/)

## 🌟 Características

- ✅ **Lógica inteligente**: Encuentra automáticamente el ancho más común
- ✅ **Sin servidores**: Funciona completamente en tu navegador
- ✅ **Privacidad total**: Tus archivos no se suben a ningún lugar
- ✅ **Python real**: Usa Pyodide para ejecutar código Python auténtico
- ✅ **Interfaz moderna**: Diseño responsive y fácil de usar
- ✅ **Gratuito**: Alojado en GitHub Pages sin costo

## 🚀 ¿Cómo funciona?

La herramienta usa la **misma lógica del EdgeMangaDownloader**:

1. **Analiza** todas las páginas del PDF y extrae sus dimensiones
2. **Identifica** el ancho más común usando `Counter().most_common(1)[0][0]`
3. **Redimensiona** todas las páginas a ese ancho manteniendo la proporción
4. **Genera** un nuevo PDF con páginas uniformes

## 🛠️ Tecnologías utilizadas

- **Pyodide**: Python ejecutándose en el navegador
- **PDF.js**: Conversión de PDF a imágenes
- **PIL (Pillow)**: Procesamiento de imágenes en Python
- **PDF-lib**: Generación del PDF final
- **Vanilla JS**: Interfaz reactiva sin frameworks

## 📦 Instalación en GitHub Pages

### Opción 1: Fork este repositorio

1. Haz fork de este repositorio
2. Ve a Settings → Pages
3. Selecciona "Deploy from a branch"
4. Elige "main" branch y "/ (root)"
5. ¡Listo! Tu página estará en `https://tuusuario.github.io/pdf-redimensionador`

### Opción 2: Crear desde cero

1. Crea un nuevo repositorio en GitHub
2. Copia todos los archivos de este proyecto
3. Habilita GitHub Pages en la configuración
4. Disfruta tu herramienta personalizada

## 📁 Estructura del proyecto

```
pdf-redimensionador/
├── index.html              # Página principal
├── style.css              # Estilos modernos
├── app.js                  # Lógica de interfaz
├── pdf-processor.js        # Procesador PDF con Pyodide
├── pdf_resizer_logic.py    # Lógica Python extraída
├── README.md               # Esta documentación
└── .github/
    └── workflows/
        └── pages.yml       # Configuración de despliegue
```

## 🎯 Casos de uso

- **📚 Mangas y cómics**: Uniformizar páginas de diferentes tamaños
- **📄 Documentos escaneados**: Corregir inconsistencias de escaneo
- **📖 Libros digitales**: Mejorar la experiencia de lectura
- **🗂️ Archivos de trabajo**: Estandarizar documentos corporativos

## 🔧 Configuración avanzada

### Calidad de imagen

Puedes ajustar la calidad de las imágenes procesadas:
- **0.5x**: Compresión máxima, archivos más pequeños
- **1.0x**: Calidad original (recomendado)
- **2.0x**: Alta calidad, archivos más grandes

### Formatos soportados

- **Entrada**: PDF (cualquier versión)
- **Salida**: PDF optimizado con páginas uniformes
- **Procesamiento**: JPEG interno para máxima compatibilidad

## 🚫 Limitaciones

- **Tamaño de archivo**: Recomendado hasta 50MB por limitaciones del navegador
- **Páginas**: Óptimo hasta 200 páginas
- **Conectividad**: Requiere internet para cargar Pyodide la primera vez
- **Navegadores**: Chrome, Firefox, Safari, Edge modernos

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -m 'Añadir nueva mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Créditos

- **Inspirado en**: EdgeMangaDownloader original
- **Tecnologías**: Pyodide, PDF.js, PIL, PDF-lib
- **Diseño**: Inspirado en herramientas web modernas

## 📞 Soporte

¿Tienes problemas o sugerencias?

- 🐛 **Bugs**: Abre un issue en GitHub
- 💡 **Ideas**: Comparte en las discusiones
- 📧 **Contacto**: Crea un issue con tus dudas

---

**⭐ Si te gusta este proyecto, ¡dale una estrella!**

*Herramienta creada con ❤️ para la comunidad*