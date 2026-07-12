document.addEventListener("DOMContentLoaded", async () => {
    const groups = [...document.querySelectorAll(".team-group")];
    const search = document.getElementById("search");
    const status = document.getElementById("status");
    const noResults = document.getElementById("noResults");
    const lastUpdated = document.getElementById("lastUpdated");

    function escapeHtml(value) {
        const element = document.createElement("div");
        element.textContent = String(value ?? "");
        return element.innerHTML;
    }

    function createCard(member, logo) {
        return `
            <article class="team-card"
                data-search="${escapeHtml(`${member.name} ${member.username} ${member.rank} ${member.teamName}`.toLowerCase())}">
                <img src="${escapeHtml(logo)}" class="team-logo" alt="${escapeHtml(member.teamName)}">
                <img src="${escapeHtml(member.avatar)}" class="member-avatar" alt="${escapeHtml(member.name)}">
                <h3 class="team-name">${escapeHtml(member.name)}</h3>
                <p class="discord-name">@${escapeHtml(member.username)}</p>
                <p class="team-rank">${escapeHtml(member.rank)}</p>
                <div class="team-details">
                    <div><span>Teamebene</span><strong>${escapeHtml(member.teamName)}</strong></div>
                    <div><span>Im Team seit</span><strong>${escapeHtml(member.since)}</strong></div>
                </div>
            </article>
        `;
    }

    function filterCards() {
        const value = search.value.trim().toLowerCase();
        let visible = 0;

        groups.forEach(group => {
            const cards = [...group.querySelectorAll(".team-card")];

            cards.forEach(card => {
                const show = card.dataset.search.includes(value);
                card.style.display = show ? "" : "none";
                if (show) visible++;
            });

            group.style.display = cards.some(card => card.style.display !== "none") ? "" : "none";
        });

        noResults.style.display = visible === 0 ? "block" : "none";
    }

    search.addEventListener("input", filterCards);

    try {
        const response = await fetch("/api/team");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        groups.forEach(group => {
            const team = group.dataset.team;
            const members = data.members.filter(member => member.team === team);
            const grid = group.querySelector(".team-grid");

            grid.innerHTML = members
                .map(member => createCard(member, data.teamLogos[team]))
                .join("");

            group.style.display = members.length ? "" : "none";
        });

        status.style.display = "none";

        if (data.updatedAt) {
            lastUpdated.textContent =
                `Zuletzt synchronisiert: ${new Date(data.updatedAt).toLocaleString("de-DE")}`;
        }

        filterCards();
    } catch (error) {
        console.error(error);
        status.textContent = "Die Teamliste konnte nicht geladen werden.";
    }
});
