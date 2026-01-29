// Función segura para convertir ArrayBuffer a base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 0x8000) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
}

// Clase para generar PDFs
class PDFGenerator {
    constructor() {
        console.log('PDFGenerator constructor llamado');
        
        // Verificar que jsPDF esté disponible globalmente
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF no está disponible. Asegúrese de que esté cargado correctamente.');
            throw new Error('jsPDF no está disponible');
        }
        
        console.log('PDFGenerator inicializado correctamente');
    }

    // Función auxiliar para validar y formatear datos
    formatData(data, defaultValue = 'No especificado') {
        return data && data !== '' ? data : defaultValue;
    }

    // Función para agregar sección con título
    addSection(doc, title, y) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, 20, y);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        return y + 15;
    }

    // Función para agregar campo con etiqueta
    addField(doc, label, value, y) {
        const formattedValue = this.formatData(value);
        doc.text(`${label}: ${formattedValue}`, 20, y);
        return y + 10;
    }

    async generatePDF(formData) {
        try {
            console.log('Generando PDF con datos:', formData);
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuración inicial
            doc.setFont("helvetica");
            doc.setFontSize(12);
            
            let y = 20;
            
            // Encabezado con logo o título principal
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("INSPECCIÓN PREOPERACIONAL DE VEHÍCULO", 105, y, { align: "center" });
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            y += 20;
            
            // Línea separadora
            doc.line(20, y, 190, y);
            y += 15;
            
            // Información básica del vehículo
            y = this.addSection(doc, "INFORMACIÓN DEL VEHÍCULO", y);
            y = this.addField(doc, "Fecha de Inspección", formData.fecha, y);
            y = this.addField(doc, "Placa del Vehículo", formData.placa, y);
            y = this.addField(doc, "Conductor", formData.conductor, y);
            y = this.addField(doc, "Kilometraje", formData.kilometraje, y);
            y += 10;
            
            // Items de revisión
            if (formData.items && Object.keys(formData.items).length > 0) {
                y = this.addSection(doc, "ITEMS DE REVISIÓN", y);
                
                for (const [key, value] of Object.entries(formData.items)) {
                    const status = this.formatData(value);
                    const statusColor = status === 'Funcional' ? '#28a745' : '#dc3545';
                    
                    doc.text(`${key}:`, 30, y);
                    doc.setTextColor(statusColor);
                    doc.text(status, 120, y);
                    doc.setTextColor(0, 0, 0); // Reset color
                    y += 10;
                    
                    // Si llegamos al final de la página, agregamos una nueva
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                }
                y += 5;
            }
            
            // Estado de llantas
            if (formData.llantas && Object.keys(formData.llantas).length > 0) {
                y = this.addSection(doc, "ESTADO DE LLANTAS", y);
                
                for (const [key, value] of Object.entries(formData.llantas)) {
                    const status = this.formatData(value);
                    const statusColor = status === 'Funcional' ? '#28a745' : '#dc3545';
                    
                    doc.text(`${key}:`, 30, y);
                    doc.setTextColor(statusColor);
                    doc.text(status, 120, y);
                    doc.setTextColor(0, 0, 0); // Reset color
                    y += 10;
                }
                y += 5;
            }
            
            // Herramientas
            if (formData.herramientas && Object.keys(formData.herramientas).length > 0) {
                y = this.addSection(doc, "HERRAMIENTAS Y EQUIPOS", y);
                
                for (const [key, value] of Object.entries(formData.herramientas)) {
                    const status = this.formatData(value);
                    const statusColor = status === 'Funcional' ? '#28a745' : '#dc3545';
                    
                    doc.text(`${key}:`, 30, y);
                    doc.setTextColor(statusColor);
                    doc.text(status, 120, y);
                    doc.setTextColor(0, 0, 0); // Reset color
                    y += 10;
                }
                y += 5;
            }
            
            // Observaciones
            y = this.addSection(doc, "OBSERVACIONES", y);
            const observaciones = this.formatData(formData.observaciones, "Sin observaciones");
            
            // Dividir observaciones largas en múltiples líneas
            const maxWidth = 150;
            const lines = doc.splitTextToSize(observaciones, maxWidth);
            doc.text(lines, 30, y);
            y += (lines.length * 7) + 10;
            
            // Firma
            if (formData.signature) {
                try {
                    y = this.addSection(doc, "FIRMA DEL CONDUCTOR", y);
                    const imgData = formData.signature;
                    doc.addImage(imgData, 'PNG', 30, y, 50, 25);
                    y += 35;
                } catch (firmaError) {
                    console.warn('Error al agregar firma al PDF:', firmaError);
                    doc.text("Firma no disponible", 30, y);
                    y += 10;
                }
            }
            
            // Pie de página
            y += 20;
            doc.line(20, y, 190, y);
            y += 10;
            doc.setFontSize(10);
            doc.text("Documento generado automáticamente por el Sistema PESV", 105, y, { align: "center" });
            doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 105, y + 7, { align: "center" });
            
            // Convertir a base64 (puro, sin prefijo)
            const arrayBuffer = doc.output('arraybuffer');
            const base64 = arrayBufferToBase64(arrayBuffer);
            console.log('PDF generado exitosamente (base64 puro)');
            return base64;
        } catch (error) {
            console.error('Error al generar PDF:', error);
            throw error;
        }
    }

    // Método específico para generar PDF de inspección
    async generateInspectionPDF(formData, tipoVehiculo) {
        try {
            console.log('Generando PDF de inspección para:', tipoVehiculo);
            console.log('Datos recibidos:', formData);
            
            // Validar que formData no sea null o undefined
            if (!formData) {
                throw new Error('formData es null o undefined');
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuración inicial
            doc.setFont("helvetica");
            doc.setFontSize(12);
            
            let y = 20;
            
            // Encabezado mejorado
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text(`INSPECCIÓN PREOPERACIONAL - ${tipoVehiculo.toUpperCase()}`, 105, y, { align: "center" });
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            y += 20;
            
            // Línea separadora
            doc.line(20, y, 190, y);
            y += 15;
            
            // Datos básicos - usar datos de resultados si están disponibles
            const datos = formData.resultados || formData;
            console.log('Datos extraídos para PDF:', datos);
            
            // Validar que datos no sea null o undefined
            if (!datos) {
                throw new Error('No se pudieron extraer datos para el PDF');
            }
            
            // Información básica del vehículo
            y = this.addSection(doc, "INFORMACIÓN DEL VEHÍCULO", y);
            y = this.addField(doc, "Fecha de Inspección", datos.fecha || formData.fecha_inspeccion, y);
            y = this.addField(doc, "Placa del Vehículo", datos.placa, y);
            y = this.addField(doc, "Conductor", datos.conductor, y);
            y = this.addField(doc, "Kilometraje", datos.kilometraje, y);
            y += 10;
            
            // Items de revisión
            const items = datos.items || {};
            console.log('Items para PDF:', items);
            
            if (items && typeof items === 'object' && !Array.isArray(items) && Object.keys(items).length > 0) {
                y = this.addSection(doc, "ITEMS DE REVISIÓN", y);
                
                for (const [key, value] of Object.entries(items)) {
                    const status = this.formatData(value);
                    const statusColor = status === 'Funcional' ? '#28a745' : '#dc3545';
                    
                    doc.text(`${key}:`, 30, y);
                    doc.setTextColor(statusColor);
                    doc.text(status, 120, y);
                    doc.setTextColor(0, 0, 0); // Reset color
                    y += 10;
                    
                    // Si llegamos al final de la página, agregamos una nueva
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                }
                y += 5;
            } else {
                y = this.addSection(doc, "ITEMS DE REVISIÓN", y);
                doc.text("No hay items de revisión disponibles", 30, y);
                y += 15;
            }
            
            // Estado de llantas
            const llantas = datos.llantas || {};
            console.log('Llantas para PDF:', llantas);
            
            if (llantas && typeof llantas === 'object' && !Array.isArray(llantas) && Object.keys(llantas).length > 0) {
                y = this.addSection(doc, "ESTADO DE LLANTAS", y);
                
                for (const [key, value] of Object.entries(llantas)) {
                    const status = this.formatData(value);
                    const statusColor = status === 'Funcional' ? '#28a745' : '#dc3545';
                    
                    doc.text(`${key}:`, 30, y);
                    doc.setTextColor(statusColor);
                    doc.text(status, 120, y);
                    doc.setTextColor(0, 0, 0); // Reset color
                    y += 10;
                }
                y += 5;
            }
            
            // Herramientas
            const herramientas = datos.herramientas || {};
            console.log('Herramientas para PDF:', herramientas);
            
            if (herramientas && typeof herramientas === 'object' && !Array.isArray(herramientas) && Object.keys(herramientas).length > 0) {
                y = this.addSection(doc, "HERRAMIENTAS Y EQUIPOS", y);
                
                for (const [key, value] of Object.entries(herramientas)) {
                    const status = this.formatData(value);
                    const statusColor = status === 'Funcional' ? '#28a745' : '#dc3545';
                    
                    doc.text(`${key}:`, 30, y);
                    doc.setTextColor(statusColor);
                    doc.text(status, 120, y);
                    doc.setTextColor(0, 0, 0); // Reset color
                    y += 10;
                }
                y += 5;
            }
            
            // Observaciones
            y = this.addSection(doc, "OBSERVACIONES", y);
            const observaciones = this.formatData(datos.observaciones || formData.observaciones, "Sin observaciones");
            
            // Dividir observaciones largas en múltiples líneas
            const maxWidth = 150;
            const lines = doc.splitTextToSize(observaciones, maxWidth);
            doc.text(lines, 30, y);
            y += (lines.length * 7) + 10;
            
            // Firma
            if (formData.firma_base64) {
                try {
                    y = this.addSection(doc, "FIRMA DEL CONDUCTOR", y);
                    const imgData = formData.firma_base64;
                    doc.addImage(imgData, 'PNG', 30, y, 50, 25);
                    y += 35;
                } catch (firmaError) {
                    console.warn('Error al agregar firma al PDF:', firmaError);
                    doc.text("Firma no disponible", 30, y);
                    y += 10;
                }
            }
            
            // Pie de página
            y += 20;
            doc.line(20, y, 190, y);
            y += 10;
            doc.setFontSize(10);
            doc.text("Documento generado automáticamente por el Sistema PESV", 105, y, { align: "center" });
            doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 105, y + 7, { align: "center" });
            
            // Convertir a base64 (puro, sin prefijo)
            const arrayBuffer = doc.output('arraybuffer');
            const base64 = arrayBufferToBase64(arrayBuffer);
            console.log('PDF de inspección generado exitosamente (base64 puro)');
            return base64;
        } catch (error) {
            console.error('Error al generar PDF de inspección:', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }
}

// Verificar que jsPDF esté disponible antes de registrar la clase
if (typeof window.jspdf !== 'undefined') {
    // Hacer la clase disponible globalmente
    window.PDFGenerator = PDFGenerator;
    console.log('PDFGenerator registrado correctamente en window.PDFGenerator');
} else {
    console.error('jsPDF no está disponible, no se puede registrar PDFGenerator');
    // Crear una versión de fallback
    window.PDFGenerator = class PDFGeneratorFallback {
        constructor() {
            throw new Error('PDFGenerator no está disponible porque jsPDF no se cargó correctamente');
        }
    };
} 