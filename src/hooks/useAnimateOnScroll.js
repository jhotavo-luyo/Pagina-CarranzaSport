// src/hooks/useAnimateOnScroll.js
import { useEffect, useRef } from 'react';

/**
 * A custom hook that uses the Intersection Observer API to add a CSS class to an element
 * when it enters the viewport, triggering a CSS animation/transition.
 * @param {object} [options] - Configuration for the Intersection Observer.
 * @param {number} [options.threshold=0.1] - The percentage of the element that must be visible to trigger the animation.
 * @param {boolean} [options.triggerOnce=true] - If true, the animation only runs once.
 * @returns {React.RefObject} A ref object to be attached to the element you want to observe.
 */
export const useAnimateOnScroll = (options) => {
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        if (options?.triggerOnce !== false) {
                            observer.unobserve(entry.target);
                        }
                    }
                });
            },
            { threshold: options?.threshold || 0.1, rootMargin: options?.rootMargin || '0px' }
        );

        const currentElement = elementRef.current;
        if (currentElement) observer.observe(currentElement);

        return () => { if (currentElement) observer.unobserve(currentElement); };
    }, [options]);

    return elementRef;
};

