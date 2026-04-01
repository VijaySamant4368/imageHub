const repoList = document.getElementById("repoList");
const addRepoBtn = document.getElementById("addRepoBtn");

function renderRepos() {
  const repos = getRepos();
  repoList.innerHTML = "";

  if (repos.length === 0) {
    repoList.textContent = "No repos saved yet.";
    return;
  }

  repos.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "repo-item";

    const name = document.createElement("span");
    name.className = "repo-name";
    name.textContent = `${item.owner}/${item.repo}`;
    name.addEventListener("click", () => {
      location.href = `gallery-view.html?owner=${encodeURIComponent(item.owner)}&repo=${encodeURIComponent(item.repo)}`;
    });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.addEventListener("click", () => {
      const repos = getRepos();
      repos.splice(index, 1);
      setRepos(repos);
      renderRepos();
    });

    row.appendChild(name);
    row.appendChild(removeBtn);
    repoList.appendChild(row);
  });
}

addRepoBtn.addEventListener("click", () => {
  const owner = prompt("Owner Name:");
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