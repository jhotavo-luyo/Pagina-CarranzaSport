// src/utils/youtubeUtils.js
// esta funcion ayuda a detectar cual es el id del video
export function getYoutubeVideoId(url) {
    if (!url) return null;

    // Expresión regular para encontrar el ID en varios formatos de URL de YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return match[2];
    } else {
        return null;
    }
}