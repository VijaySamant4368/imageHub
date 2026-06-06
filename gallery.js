const repoList = document.getElementById("repoList");
const addRepoBtn = document.getElementById("addRepoBtn");

function renderRepos() {
  const repos = getRepos();
  repoList.innerHTML = "";

  if (repos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No repositories saved yet. Add one to get started.";
    repoList.appendChild(empty);
    return;
  }

  repos.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "repo-item";

    const label = document.createElement("span");
    label.className = "repo-label";
    label.textContent = "GitHub Repository";

    const name = document.createElement("div");
    name.className = "repo-name";
    name.textContent = `${item.owner}/${item.repo}`;
    name.style.cursor = "pointer";
    name.addEventListener("click", () => {
      location.href = `gallery-view.html?owner=${encodeURIComponent(item.owner)}&repo=${encodeURIComponent(item.repo)}`;
    });

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.style.marginTop = "auto";

    const openBtn = document.createElement("button");
    openBtn.textContent = "View Gallery";
    openBtn.style.flex = "1";
    openBtn.addEventListener("click", () => {
      location.href = `gallery-view.html?owner=${encodeURIComponent(item.owner)}&repo=${encodeURIComponent(item.repo)}`;
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Remove ${item.owner}/${item.repo}?`)) {
        const repos = getRepos();
        repos.splice(index, 1);
        setRepos(repos);
        renderRepos();
      }
    });

    card.appendChild(label);
    card.appendChild(name);
    actions.appendChild(openBtn);
    actions.appendChild(removeBtn);
    card.appendChild(actions);
    repoList.appendChild(card);
  });
}

addRepoBtn.addEventListener("click", () => {
  const owner = prompt("Owner Name (GitHub username or organization):");
  if (!owner) return;

  const repo = prompt("Repo Name:");
  if (!repo) return;

  const repos = getRepos();
  const exists = repos.some(
    (item) => item.owner === owner.trim() && item.repo === repo.trim()
  );

  if (exists) {
    alert("Repo already exists in local storage.");
    return;
  }

  repos.push({
    owner: owner.trim(),
    repo: repo.trim()
  });

  setRepos(repos);
  renderRepos();
});

renderRepos();
