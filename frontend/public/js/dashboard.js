/**
 * Dashboard JavaScript
 * Este archivo contiene toda la funcionalidad JavaScript necesaria para el dashboard
 * 
 * Funcionalidades implementadas:
 * - Control del menú desplegable de Ejecución
 * - Animación de la flecha del submenú
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el menú desplegable
    initializeSubmenu();
});

/**
 * Inicializa el menú desplegable y agrega los event listeners necesarios
 */
function initializeSubmenu() {
    const submenuTrigger = document.querySelector('.submenu-trigger');
    if (submenuTrigger) {
        submenuTrigger.addEventListener('click', toggleSubmenu);
    }
}

/**
 * Maneja el evento de clic en el menú desplegable
 * @param {Event} event - El evento de clic
 */
function toggleSubmenu(event) {
    // Prevenir el comportamiento predeterminado del enlace
    event.preventDefault();
    
    // Obtener el submenú y la flecha
    const submenu = event.currentTarget.nextElementSibling;
    const arrow = document.getElementById('submenu-arrow');
    
    // Alternar la visibilidad del submenú
    submenu.classList.toggle('active');
    
    // Rotar la flecha cuando el menú está abierto
    arrow.classList.toggle('rotate-180');
}

/**
 * Función para cerrar el submenú cuando se hace clic fuera de él
 * @param {Event} event - El evento de clic
 */
function closeSubmenuOnClickOutside(event) {
    const submenu = document.querySelector('.submenu');
    const submenuTrigger = document.querySelector('.submenu-trigger');
    
    if (submenu && submenuTrigger) {
        if (!submenu.contains(event.target) && !submenuTrigger.contains(event.target)) {
            submenu.classList.remove('active');
            const arrow = document.getElementById('submenu-arrow');
            arrow.classList.remove('rotate-180');
        }
    }
}

// Agregar event listener para cerrar el submenú al hacer clic fuera
document.addEventListener('click', closeSubmenuOnClickOutside); 