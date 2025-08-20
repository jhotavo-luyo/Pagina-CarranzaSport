// c:/Users/jhotavo/Desktop/proyecto-Carranza/Frontend-CarranzaSport-final/src/hooks/useScrollAnimation.js

import { useEffect } from 'react';

/**
 * Hook personalizado para animar un <model-viewer> con el scroll.
 * Encapsula toda la lógica de añadir y quitar listeners, calcular el progreso
 * y actualizar los atributos del DOM.
 *
 * @param {React.RefObject} modelViewerRef - Una "referencia" de React que apunta al elemento <model-viewer>.
 * @param {React.RefObject} containerRef - Una referencia que apunta al contenedor del modelo que se va a mover.
 * @param {object} animationConfig - Un objeto con todos los parámetros de la animación (duración, valores de inicio/fin).
 */
export const useScrollAnimation = (modelViewerRef, containerRef, animationConfig) => {
    // Usamos useEffect para interactuar con el navegador (el DOM y los eventos),
    // lo cual es un "efecto secundario" en React.
    useEffect(() => {
        // 1. OBTENER LOS ELEMENTOS DEL DOM
        // Accedemos a los elementos reales del DOM a través de la propiedad .current de las referencias.
        const modelViewer = modelViewerRef.current;
        const container = containerRef.current;

        // Es una buena práctica comprobar que los elementos existen antes de intentar usarlos.
        // Esto evita errores si el componente se renderiza antes de que las refs estén asignadas.
        if (!modelViewer || !container) return;

        // 2. OPTIMIZACIÓN CON requestAnimationFrame
        // Esta variable guardará el ID de la solicitud de animación.
        // La usaremos para cancelar frames pendientes y evitar trabajo innecesario.
        let animationFrameId = null;

        // 3. LA FUNCIÓN PRINCIPAL QUE SE EJECUTA CON EL SCROLL
        const handleScroll = () => {
            // Si ya hay una animación pendiente de ejecutarse, la cancelamos.
            // Esto evita que se acumulen cálculos si el usuario hace scroll muy rápido.
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            // Le pedimos al navegador que ejecute nuestro código de animación justo antes
            // del próximo "repintado" de la pantalla. Esto sincroniza la animación con el
            // navegador, resultando en un movimiento mucho más suave y eficiente.
            animationFrameId = requestAnimationFrame(() => {
                // 4. CÁLCULO DE LA ANIMACIÓN

                // Desestructuramos la configuración para un acceso más fácil.
                const { scrollDuration, startOrientation, endOrientation, startOrbit, endOrbit, startExposure, endExposure, startTranslateX, endTranslateX } = animationConfig;
                
                // Obtenemos la posición actual del scroll vertical.
                const scrollY = window.scrollY;
                
                // Calculamos el progreso de la animación como un valor de 0 a 1.
                // Dividimos el scroll actual por la duración total de la animación en píxeles.
                // Math.min() asegura que el valor nunca sea mayor que 1.
                const scrollProgress = Math.min(scrollY / scrollDuration, 1);

                // 5. INTERPOLACIÓN LINEAL (LERP)
                // Usamos el `scrollProgress` para calcular el valor actual de cada propiedad
                // que queremos animar. Esta fórmula encuentra un punto intermedio entre un
                // valor de inicio y un valor de fin.
                const yaw = startOrientation.yaw + (endOrientation.yaw - startOrientation.yaw) * scrollProgress;
                const pitch = startOrientation.pitch + (endOrientation.pitch - startOrientation.pitch) * scrollProgress;
                const roll = startOrientation.roll + (endOrientation.roll - startOrientation.roll) * scrollProgress;
                const radius = startOrbit.radius + (endOrbit.radius - startOrbit.radius) * scrollProgress;
                const exposure = startExposure + (endExposure - startExposure) * scrollProgress;
                const translateX = startTranslateX + (endTranslateX - startTranslateX) * scrollProgress;

                // 6. APLICAR LOS CAMBIOS AL DOM
                // Actualizamos directamente los atributos y estilos de los elementos del DOM.
                modelViewer.orientation = `${yaw}deg ${pitch}deg ${roll}deg`;
                modelViewer.cameraOrbit = `0deg 75deg ${radius}%`;
                modelViewer.exposure = `${exposure}`;
                container.style.transform = `translateX(${translateX}%)`;
            });
        };

        // 7. CONFIGURACIÓN Y LIMPIEZA DEL EVENTO

        // Ejecutamos la función una vez al inicio para establecer el estado inicial correcto.
        handleScroll();
        
        // Añadimos el "escuchador" de eventos a la ventana. Cada vez que ocurra un 'scroll',
        // se llamará a nuestra función `handleScroll`.
        // { passive: true } es una optimización que le dice al navegador que no bloquearemos el scroll.
        window.addEventListener('scroll', handleScroll, { passive: true });

        // La función que se retorna en useEffect es la función de "limpieza".
        // Se ejecuta cuando el componente que usa este hook se "desmonta" (desaparece).
        return () => {
            // Es VITAL eliminar el listener para evitar fugas de memoria.
            window.removeEventListener('scroll', handleScroll);
            // También cancelamos cualquier animación que pudiera haber quedado pendiente.
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    // El array de dependencias le dice a React cuándo debe volver a ejecutar este efecto.
    // En este caso, se volverá a ejecutar si alguna de las referencias o la configuración cambian.
    }, [modelViewerRef, containerRef, animationConfig]);
};
