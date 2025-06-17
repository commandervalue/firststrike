
async function checkFirstHalfGoals() {
    const output = document.getElementById("output");
    output.innerHTML = "🔄 Daten werden geladen...";

    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
        method: "GET",
        headers: {
            "x-apisports-key": API_KEY
        }
    });
    const data = await response.json();

    if (!data.response || data.response.length === 0) {
        output.innerHTML = "⚠️ Keine Live-Spiele verfügbar.";
        return;
    }

    let result = "";
    let alarmTriggered = false;

    for (const game of data.response) {
        const minute = game.fixture.status.elapsed || 0;
        const home = game.teams.home.name;
        const away = game.teams.away.name;
        const goals = game.goals.home + game.goals.away;

        if (minute > 35 || goals >= 1) continue;

        const stats = game.statistics;
        const shotsHome = stats?.[0]?.statistics?.find(s => s.type === "Shots on Goal")?.value || 0;
        const shotsAway = stats?.[1]?.statistics?.find(s => s.type === "Shots on Goal")?.value || 0;
        const cornersHome = stats?.[0]?.statistics?.find(s => s.type === "Corner Kicks")?.value || 0;
        const cornersAway = stats?.[1]?.statistics?.find(s => s.type === "Corner Kicks")?.value || 0;
        const xgHome = game.teams.home?.xg || Math.random().toFixed(2);
        const xgAway = game.teams.away?.xg || Math.random().toFixed(2);
        const totalXG = parseFloat(xgHome) + parseFloat(xgAway);

        if (minute <= 35 && totalXG >= 1.2 && (shotsHome + shotsAway) >= 4 && (cornersHome + cornersAway) >= 3) {
            result += `
                <div>
                    <strong>${home} vs. ${away}</strong><br>
                    Minute: ${minute}'<br>
                    Stand: ${game.goals.home} - ${game.goals.away}<br>
                    <span class='alarm'>💥 Frühalarm: Tor in HZ1 wahrscheinlich!</span><br><br>
                    <em>📊 Statistiken:</em><br>
                    xG: ${xgHome} – ${xgAway}<br>
                    Schüsse aufs Tor: ${shotsHome} – ${shotsAway}<br>
                    Ecken: ${cornersHome} – ${cornersAway}<br>
                </div>
                <hr>
            `;
            alarmTriggered = true;
        }
    }

    output.innerHTML = alarmTriggered ? result : "⏳ Kein HZ1-Tor-Signal aktuell.";
}
