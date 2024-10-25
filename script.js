document.getElementById("config-form").addEventListener("submit", handleFormSubmit);
document.getElementById("achievement-week").addEventListener("click", handleAchievementWeekClick);

function handleFormSubmit(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const gameId = document.getElementById("game-id").value.trim();
    const apiKey = document.getElementById("api-key").value;
    const backgroundColor = document.getElementById("background-color").value;

    // Mudar a cor de fundo da página
    document.body.style.backgroundColor = backgroundColor;

    // Verifica se o campo gameId está vazio
    if (!gameId) {
        fetchLastPlayedGame(username, apiKey);
    } else {
        fetchAchievements(username, gameId, apiKey);
    }
}

function handleAchievementWeekClick() {
    const apiKey = document.getElementById("api-key").value;
    fetchAchievementOfTheWeek(apiKey);
}

async function fetchLastPlayedGame(username, apiKey) {
    const url = `https://retroachievements.org/API/API_GetUserSummary.php?u=${username}&y=${apiKey}&g=1`;

    try {
        const response = await fetch(url);
        handleFetchResponse(response);

        const data = await response.json();
        if (data?.RecentlyPlayed?.length) {
            const { GameID: lastGameId, Title: lastGameTitle, ImageTitle: lastGameImage } = data.RecentlyPlayed[0];
            fetchAchievements(username, lastGameId, apiKey);
            displayLastPlayedGame(lastGameTitle, lastGameImage);
        } else {
            displayMessage("Nenhum jogo jogado recentemente encontrado.");
        }
    } catch (error) {
        console.error("Erro ao buscar o último jogo jogado:", error);
        displayMessage("Erro ao buscar o último jogo jogado. Verifique os dados fornecidos.");
    }
}

async function fetchAchievements(username, gameId, apiKey) {
    const url = `https://retroachievements.org/API/API_GetGameInfoAndUserProgress.php?u=${username}&z=${username}&y=${apiKey}&g=${gameId}`;

    try {
        const response = await fetch(url);
        handleFetchResponse(response);

        const data = await response.json();
        if (data?.Achievements) {
            displayAchievements(data.Achievements, data.Title, data.ImageTitle);
        } else {
            displayMessage("Não foram encontradas conquistas para este jogo.");
        }
    } catch (error) {
        console.error("Erro ao buscar conquistas:", error);
        displayMessage("Erro ao buscar conquistas. Verifique se o ID do jogo e a API Key estão corretos.");
    }
}

async function fetchAchievementOfTheWeek(apiKey) {
    const url = `https://retroachievements.org/API/API_GetAchievementOfTheWeek.php?y=${apiKey}`;

    try {
        const response = await fetch(url);
        handleFetchResponse(response);

        const data = await response.json();
        displayAchievementOfTheWeek(data);
    } catch (error) {
        console.error("Erro ao buscar a conquista da semana:", error);
        displayMessage("Erro ao buscar a conquista da semana. Verifique a chave da API.");
    }
}

function handleFetchResponse(response) {
    if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);
    }
}

function displayLastPlayedGame(title, image) {
    document.getElementById("achievements").innerHTML = `
        <h2>Último Jogo Jogado:</h2>
        <h3>${title}</h3>
        <img src="https://retroachievements.org${image}" alt="${title}">
    `;
}

function displayAchievements(achievements, gameTitle, gameImage) {
    const achievementsContainer = document.getElementById("achievements");
    achievementsContainer.innerHTML = ""; // Limpa os resultados anteriores

    Object.values(achievements).forEach(achievement => {
        const achievementDiv = createAchievementElement(achievement);
        achievementsContainer.appendChild(achievementDiv);
    });

    // Adiciona o título e imagem do jogo no topo
    achievementsContainer.insertAdjacentHTML("afterbegin", `
        <h2>Conquistas para ${gameTitle}</h2>
        <img src="https://retroachievements.org${gameImage}" alt="${gameTitle}">
    `);
}

function createAchievementElement(achievement) {
    const achievementDiv = document.createElement("div");
    achievementDiv.classList.add("achievement");
    achievementDiv.innerHTML = `
        <h3>${achievement.Title}</h3>
        <p>${achievement.Description}</p>
        <p>Pontos: ${achievement.Points}</p>
        <img src="https://media.retroachievements.org/Badge/${achievement.BadgeName}.png" alt="${achievement.Title}">
    `;
    return achievementDiv;
}

function displayAchievementOfTheWeek(data) {
    const achievementsContainer = document.getElementById("achievements");
    achievementsContainer.innerHTML = ""; // Limpa os resultados anteriores

    if (data?.Achievement) {
        const { Title: achievementTitle, Description, Points, BadgeName } = data.Achievement;
        const gameTitle = data.Game.Title;

        const achievementDiv = document.createElement("div");
        achievementDiv.classList.add("achievement");
        achievementDiv.innerHTML = `
            <h3>${achievementTitle} - ${gameTitle}</h3>
            <p>${Description}</p>
            <p>Pontos: ${Points}</p>
            <img src="https://media.retroachievements.org/Badge/${BadgeName}.png" alt="${achievementTitle}">
        `;
        achievementsContainer.appendChild(achievementDiv);
    } else {
        achievementsContainer.innerHTML = "<p>Não foram encontradas conquistas da semana.</p>";
    }
}

function displayMessage(message) {
    document.getElementById("achievements").innerHTML = `<p>${message}</p>`;
}
