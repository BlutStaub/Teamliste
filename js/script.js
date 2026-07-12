document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.getElementById("search");
    const statusBox = document.getElementById("status");
    const noResults = document.getElementById("noResults");
    const lastUpdated = document.getElementById("lastUpdated");
    const groups = [...document.querySelectorAll(".team-group")];

    function escapeHtml(value) {
        const element = document.createElement("div");
        element.textContent = String(value ?? "");
        return element.innerHTML;
    }

    function createMemberCard(member, fallbackLogo) {
        const logo = member.teamLogo || fallbackLogo;

        return `
            <article
                class="team-card"
                data-search="${escapeHtml(
                    `${member.name} ${member.rank} ${member.teamName}`.toLowerCase()
                )}"
            >
                <div class="team-logo-wrapper">
                    <img
                        src="${escapeHtml(logo)}"
                        class="team-logo"
                        alt="${escapeHtml(member.teamName)} Logo"
                    >
                </div>

                <h3 class="team-name">${escapeHtml(member.name)}</h3>
                <p class="team-rank">${escapeHtml(member.rank)}</p>

                <div class="team-details">
                    <div>
                        <span>Teamebene</span>
                        <strong>${escapeHtml(member.teamName)}</strong>
                    </div>

                    <div>
                        <span>Im Team seit</span>
                        <strong>${escapeHtml(member.since)}</strong>
                    </div>
                </div>
            </article>
        `;
    }

    function applySearch() {
        const searchValue = (searchInput.value || "")
            .trim()
            .toLowerCase();

        let visibleCards = 0;

        groups.forEach(group => {
            const cards = [...group.querySelectorAll(".team-card")];

            cards.forEach(card => {
                const visible = card.dataset.search.includes(searchValue);
                card.style.display = visible ? "" : "none";

                if (visible) {
                    visibleCards++;
                }
            });

            group.style.display = cards.some(
                card => card.style.display !== "none"
            ) ? "" : "none";
        });

        noResults.style.display =
            visibleCards === 0 ? "block" : "none";
    }

    searchInput.addEventListener("input", applySearch);

    try {
        const response = await fetch("./team.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const members = Array.isArray(data.members) ? data.members : [];

        groups.forEach(group => {
            const team = group.dataset.team;
            const grid = group.querySelector(".team-grid");
            const teamMembers = members.filter(
                member => member.team === team
            );
            const fallbackLogo =
                data.teamLogos?.[team] ||
                `img/team/${team}.png`;

            grid.innerHTML = teamMembers
                .map(member => createMemberCard(member, fallbackLogo))
                .join("");

            group.style.display =
                teamMembers.length > 0 ? "" : "none";
        });

        statusBox.style.display = "none";

        if (data.updatedAt) {
            lastUpdated.textContent =
                `Zuletzt aktualisiert: ${new Date(
                    data.updatedAt
                ).toLocaleString("de-DE")}`;
        }

        applySearch();
    } catch (error) {
        console.error("Teamliste konnte nicht geladen werden:", error);

        statusBox.classList.add("error");
        statusBox.innerHTML =
            "<strong>Die Teamliste konnte nicht geladen werden.</strong>" +
            "<br>Prüfe, ob die Datei team.json im Repository vorhanden ist.";
    }
});
