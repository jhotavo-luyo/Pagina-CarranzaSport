// src/types/model-viewer.d.ts

// Esto le dice a TypeScript/JSX cómo entender la etiqueta <model-viewer>
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'shadow-intensity'?: string | number;
        'environment-image'?: string;
        exposure?: string | number;
        autoplay?: boolean;
        'animation-name'?: string;
        orientation?: string;
        'camera-orbit'?: string;
        'camera-target'?: string;
      },
      HTMLElement
    >;
  }
}

