document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Moto');
    
    // Inicializar servicios
    const conductorService = new ConductoresService();
    const conductorInfo = new ConductorInfo('conductor-info-container', conductorService);
    
    // Variables globales
    let conductores = [];
    let conductorSeleccionado = null;
    let vehiculoSeleccionado = null;
    
    // Verificar que SignaturePad esté disponible
    if (typeof SignaturePad === 'undefined') {
        console.error('SignaturePad no está disponible');
    } else {
        console.log('SignaturePad está disponible');
    }
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF no está disponible');
    } else {
        console.log('jsPDF está disponible');
    }
    
    // Inicializar SignaturePad
    const canvas = document.getElementById('signature-pad');
    let signaturePad = null;
    
    if (canvas) {
        console.log('Canvas encontrado, inicializando SignaturePad');
        signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
            velocityFilterWeight: 0.7,
            minWidth: 0.5,
            maxWidth: 2.5,
            throttle: 16
        });

        // Ajustar el tamaño del canvas
        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            
            // Asegurarse de que el canvas tenga un tamaño mínimo
            canvas.width = Math.max(width * ratio, 300);
            canvas.height = Math.max(height * ratio, 200);
            
            // Obtener el contexto y configurarlo
            const ctx = canvas.getContext("2d");
            ctx.scale(ratio, ratio);
            
            // Limpiar el canvas después de redimensionar
            signaturePad.clear();
        }

        // Ajustar el tamaño inicial y cuando cambie el tamaño de la ventana
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('load', resizeCanvas);

        // Botón para limpiar la firma
        const clearButton = document.getElementById('clear-signature');
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                signaturePad.clear();
            });
        }

        // Agregar soporte para dispositivos táctiles
        canvas.addEventListener('touchstart', function(event) {
            event.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchmove', function(event) {
            event.preventDefault();
        }, { passive: false });
    } else {
        console.error('Canvas signature-pad no encontrado');
    }
    
    // Inicializar el generador de PDF
    let pdfGenerator = null;
    
    try {
        if (typeof window.PDFGenerator === 'undefined') {
            console.error('PDFGenerator no está disponible. Asegúrese de que pdf-generator.js esté cargado correctamente.');
            throw new Error('PDFGenerator no está disponible');
        }
        
        pdfGenerator = new window.PDFGenerator();
        console.log('PDFGenerator inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar PDFGenerator:', error);
        // Continuar sin PDFGenerator por ahora
        pdfGenerator = null;
    }

    // Cargar conductores al iniciar
    async function cargarConductores() {
        try {
            console.log('Cargando conductores...');
            conductores = await conductorService.getConductores();
            
            const select = document.getElementById('conductor-select');
            if (select) {
                // Limpiar opciones existentes
                select.innerHTML = '<option value="">Seleccione un conductor...</option>';
                
                // Agregar conductores
                conductores.forEach(conductor => {
                    const option = document.createElement('option');
                    option.value = conductor.id;
                    option.textContent = `${conductor.nombre} - ${conductor.numero_licencia}`;
                    select.appendChild(option);
                });
                
                console.log(`${conductores.length} conductores cargados`);
            }
        } catch (error) {
            console.error('Error al cargar conductores:', error);
            mostrarError('Error al cargar la lista de conductores');
        }
    }

    // Manejar selección de conductor
    async function onConductorSeleccionado(conductorId) {
        try {
            if (!conductorId) {
                conductorInfo.clear();
                conductorSeleccionado = null;
                vehiculoSeleccionado = null;
                limpiarCamposFormulario();
                return;
            }

            console.log('Cargando información del conductor:', conductorId);
            
            // Obtener información completa del conductor
            const { conductor, vehiculos } = await conductorService.getConductorCompleto(conductorId);
            
            conductorSeleccionado = conductor;
            
            // Filtrar solo vehículos tipo moto
            const vehiculosMoto = vehiculos.filter(v => v.tipo_vehiculo === 'moto');
            
            // Mostrar información del conductor
            conductorInfo.render(conductor, vehiculosMoto);
            
            // Llenar campo de nombre del conductor
            const conductorInput = document.getElementById('conductor');
            if (conductorInput) {
                conductorInput.value = conductor.nombre;
            }
            
            // Mostrar alertas si las hay
            conductorInfo.showAlertas();
            
            console.log('Información del conductor cargada:', conductor);
            console.log('Vehículos disponibles:', vehiculosMoto);
            
        } catch (error) {
            console.error('Error al cargar información del conductor:', error);
            mostrarError('Error al cargar la información del conductor');
        }
    }

    // Manejar selección de vehículo
    function onVehiculoSeleccionado(event) {
        const { vehiculo, conductor } = event.detail;
        vehiculoSeleccionado = vehiculo;
        
        console.log('Vehículo seleccionado:', vehiculo);
        
        // Llenar campos del formulario
        const placaInput = document.getElementById('placa');
        if (placaInput) {
            placaInput.value = vehiculo.placa;
        }
        
        // Establecer fecha actual
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            const hoy = new Date().toISOString().split('T')[0];
            fechaInput.value = hoy;
        }
    }

    // Limpiar campos del formulario
    function limpiarCamposFormulario() {
        const campos = ['conductor', 'placa', 'kilometraje'];
        campos.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.value = '';
            }
        });
    }

    // Mostrar error
    function mostrarError(mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${mensaje}
            <button type="button" class="float-right font-bold" onclick="this.parentElement.remove()">×</button>
        `;
        
        const form = document.querySelector('form');
        form.insertBefore(errorDiv, form.firstChild);
    }

    // Función para validar campos vacíos
    function validarFormulario() {
        const form = document.querySelector('form');
        const camposRequeridos = form.querySelectorAll('input[required], select[required]');
        const camposVacios = [];
        
        // Validar campos de texto y fecha
        camposRequeridos.forEach(campo => {
            if (!campo.value.trim()) {
                camposVacios.push(campo.previousElementSibling.textContent || campo.name);
            }
        });
        
        // Validar selects
        const selects = form.querySelectorAll('select');
        selects.forEach(select => {
            if (!select.value) {
                const label = select.previousElementSibling.textContent;
                if (!camposVacios.includes(label)) {
                    camposVacios.push(label);
                }
            }
        });
        
        return camposVacios;
    }

    // Función para obtener elementos no funcionales
    function getNoFuncionales() {
        const noFuncionales = [];
        const selects = document.querySelectorAll('select[name^="items"]');
        
        selects.forEach(select => {
            if (select.value === 'No funcional') {
                const label = select.previousElementSibling.textContent;
                noFuncionales.push(label);
            }
        });
        
        return noFuncionales;
    }

    // Función para recopilar datos del formulario
    function getFormData() {
        const form = document.querySelector('form');
        const formData = new FormData(form);
        const data = {
            vehiculo_id: vehiculoSeleccionado ? vehiculoSeleccionado.id : null,
            conductor_id: conductorSeleccionado ? conductorSeleccionado.id : null,
            fecha_inspeccion: formData.get('fecha'),
            kilometraje: formData.get('kilometraje'),
            tipo_vehiculo: 'moto', // Tipo fijo para este formulario
            resultados: {
                fecha: formData.get('fecha'),
                placa: formData.get('placa'),
                conductor: formData.get('conductor'),
                kilometraje: formData.get('kilometraje'),
                items: {},
                llantas: {},
                herramientas: {},
                observaciones: formData.get('observaciones')
            },
            firma_base64: null,
            pdf_base64: null,
            observaciones: formData.get('observaciones')
        };

        // Obtener la firma si existe
        if (signaturePad && !signaturePad.isEmpty()) {
            data.firma_base64 = signaturePad.toDataURL();
        }

        // Organizar los items por categoría
        formData.forEach((value, key) => {
            if (key.startsWith('items[')) {
                const itemName = key.match(/\[(.*?)\]/)[1];
                if (itemName.includes('Llantas')) {
                    data.resultados.llantas[itemName] = value;
                } else if (['Alicates', 'Destornilladores', 'Llave de expansión', 'Linterna', 'Chaleco Reflectivo', 'Llaves fijas'].includes(itemName)) {
                    data.resultados.herramientas[itemName] = value;
                } else {
                    data.resultados.items[itemName] = value;
                }
            }
        });

        return data;
    }

    // Función para enviar la inspección al backend
    async function enviarInspeccion(formData) {
        try {
            const response = await fetch(getApiUrl(CONFIG.ENDPOINTS.INSPECTIONS), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al enviar la inspección:', error);
            throw error;
        }
    }

    // Función para mostrar el modal de confirmación
    function showConfirmationModal(noFuncionales) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const modalContent = `
            <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                <h3 class="text-xl font-bold text-red-600 mb-4">⚠️ Elementos No Funcionales Detectados</h3>
                <div class="mb-4">
                    <p class="text-gray-700 mb-2">Se han detectado los siguientes elementos marcados como "No funcional":</p>
                    <ul class="list-disc list-inside text-gray-600 mb-4">
                        ${noFuncionales.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    <p class="text-gray-700">¿Desea continuar con el envío de la inspección?</p>
                </div>
                <div class="flex justify-end space-x-4">
                    <button id="cancel-submit" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        Volver a Revisar
                    </button>
                    <button id="confirm-submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Enviar Inspección
                    </button>
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

        // Eventos del modal
        document.getElementById('cancel-submit').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('confirm-submit').addEventListener('click', async () => {
            document.body.removeChild(modal);
            
            try {
                const formData = getFormData();
                
                // Generar PDF ANTES de enviar la inspección
                if (pdfGenerator) {
                    try {
                        console.log('Generando PDF antes del envío (modal)...');
                        let pdfBase64 = await pdfGenerator.generateInspectionPDF(formData, 'moto');
                        // Asegurarse de que no tenga prefijo
                        if (pdfBase64.startsWith('data:')) {
                            pdfBase64 = pdfBase64.split(',')[1];
                        }
                        formData.pdf_base64 = pdfBase64;
                        console.log('PDF generado exitosamente, agregado a formData');
                    } catch (pdfError) {
                        console.error('Error al generar PDF:', pdfError);
                        // Continuar sin PDF si hay error
                    }
                } else {
                    console.log('PDFGenerator no está disponible');
                }
                
                // Enviar inspección con PDF incluido
                const result = await enviarInspeccion(formData);
                
                // Mostrar mensaje de éxito
                mostrarExito('Inspección enviada exitosamente');
                
                limpiarFormulario();
            } catch (error) {
                mostrarError('Error al enviar la inspección: ' + error.message);
            }
        });
    }

    // Mostrar mensaje de éxito
    function mostrarExito(mensaje) {
        const exitoDiv = document.createElement('div');
        exitoDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
        exitoDiv.innerHTML = `
            <strong>Éxito:</strong> ${mensaje}
            <button type="button" class="float-right font-bold" onclick="this.parentElement.remove()">×</button>
        `;
        
        const form = document.querySelector('form');
        form.insertBefore(exitoDiv, form.firstChild);
    }

    // Limpiar formulario
    function limpiarFormulario() {
        const form = document.querySelector('form');
        form.reset();
        
        if (signaturePad) {
            signaturePad.clear();
        }
        
        conductorInfo.clear();
        conductorSeleccionado = null;
        vehiculoSeleccionado = null;
    }

    // Event listeners
    document.addEventListener('vehiculoSelected', onVehiculoSeleccionado);
    
    // Event listener para el selector de conductor
    const conductorSelect = document.getElementById('conductor-select');
    if (conductorSelect) {
        conductorSelect.addEventListener('change', function() {
            onConductorSeleccionado(this.value);
        });
    }

    // Event listener para el formulario
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('Formulario enviado');
            
            // Validar formulario
            const camposVacios = validarFormulario();
            if (camposVacios.length > 0) {
                mostrarError(`Por favor complete los siguientes campos: ${camposVacios.join(', ')}`);
                return;
            }
            
            // Verificar que se haya seleccionado un conductor
            if (!conductorSeleccionado) {
                mostrarError('Por favor seleccione un conductor');
                return;
            }
            
            // Verificar que se haya seleccionado un vehículo
            if (!vehiculoSeleccionado) {
                mostrarError('Por favor seleccione un vehículo');
                return;
            }
            
            // Obtener elementos no funcionales
            const noFuncionales = getNoFuncionales();
            
            if (noFuncionales.length > 0) {
                showConfirmationModal(noFuncionales);
            } else {
                try {
                    const formData = getFormData();
                    
                    // Generar PDF ANTES de enviar la inspección
                    if (pdfGenerator) {
                        try {
                            console.log('Generando PDF antes del envío...');
                            let pdfBase64 = await pdfGenerator.generateInspectionPDF(formData, 'moto');
                            // Asegurarse de que no tenga prefijo
                            if (pdfBase64.startsWith('data:')) {
                                pdfBase64 = pdfBase64.split(',')[1];
                            }
                            formData.pdf_base64 = pdfBase64;
                            console.log('PDF generado exitosamente, agregado a formData');
                        } catch (pdfError) {
                            console.error('Error al generar PDF:', pdfError);
                            // Continuar sin PDF si hay error
                        }
                    } else {
                        console.log('PDFGenerator no está disponible');
                    }
                    
                    // Enviar inspección con PDF incluido
                    const result = await enviarInspeccion(formData);
                    
                    // Mostrar mensaje de éxito
                    mostrarExito('Inspección enviada exitosamente');
                    
                    limpiarFormulario();
                } catch (error) {
                    mostrarError('Error al enviar la inspección: ' + error.message);
                }
            }
        });
    }

    // Inicializar
    cargarConductores();
});