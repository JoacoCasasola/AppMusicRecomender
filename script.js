document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".get-playlist");
    const result = document.querySelector(".result");

    // Definir las credenciales y codificarlas en base64
    const client_id = '489e12b9c01d4e72a92b359a92677165';
    const client_secret = '67d146d7626a40cc9142825663d277de';
    const credentials = btoa(`${client_id}:${client_secret}`);

    async function showError(message) {
        const alert = document.createElement("p");
        alert.classList.add("alert-error");
        alert.innerHTML = message;
        result.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 1000);
    }

    async function clearHtml() {
        result.innerHTML = "";
    }

    async function showPlaylists(playlistName, ownerName, coverUrl, playlistUrl) {
        const content = document.createElement("div");
        content.classList.add("playlist");

        content.innerHTML = `
            <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-neutral-800 dark:border-neutral-700">
                <a href="${playlistUrl}" target="_blank">
                    <img class="rounded-t-lg" src="${coverUrl}" alt="" />
                </a>
                <div class="p-5">
                    <p class="mb-3 font-normal text.sm text-gray-700 dark:text-gray-400">${playlistName}  <span>by</span>  ${ownerName}</p>
                    <a href="${playlistUrl}" target="_blank" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                        Visitar
                        <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;

        result.appendChild(content);
    }

    async function getAccessToken(credentials) {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            showError(`Error obteniendo el token de acceso: ${error.message}`);
            throw error;
        }
    }

    async function searchPlaylists(token, animo, genero, actividad) {
        try {
            const query = `${animo} ${genero} ${actividad}`;
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=50`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.playlists.items;
        } catch (error) {
            console.log(`Error buscando listas de reproducción: ${error.message}`);
            throw error;
        }
    }

    async function getPlaylistCoverURL(token, playlistId) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.images[0].url;
        } catch (error) {
            console.log(`Error obteniendo la portada de la lista de reproducción: ${error.message}`);
            throw error;
        }
    }

    async function main() {
        try {
            const animo = document.querySelector("#animo").value;
            const genero = document.querySelector("#genero").value;
            const actividad = document.querySelector("#actividad").value;
            const token = await getAccessToken(credentials);
            const playlists = await searchPlaylists(token, animo, genero, actividad);

            clearHtml();

            for (const playlist of playlists) {
                const coverUrl = await getPlaylistCoverURL(token, playlist.id);
                const playlistName = playlist.name;
                const ownerName = playlist.owner.display_name;
                const playlistUrl = playlist.external_urls.spotify;

                await showPlaylists(playlistName, ownerName, coverUrl, playlistUrl);
            }
        } catch (error) {
            console.log(`Error en la función principal: ${error.message}`);
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await main();
    });

    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const up = document.querySelector('.up');

        if (scrollPosition >= 250) {
            up.style.opacity = '1';
        } else {
            up.style.opacity = '0';
        }
    });
});