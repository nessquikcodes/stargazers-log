const repositoryList = document.querySelector("#repository-list");

function renderRepositories(repositories) {
  repositoryList.replaceChildren();

  for (const repository of repositories) {
    const item = document.createElement("li");
    item.className = "repository";

    const link = document.createElement("a");
    link.href = repository.url;
    link.textContent = repository.name;

    const description = document.createElement("p");
    description.textContent = repository.description;

    const starredAt = document.createElement("time");
    starredAt.dateTime = repository.starred_at;
    starredAt.textContent = `Starred on ${new Date(
      `${repository.starred_at}T00:00:00`
    ).toLocaleDateString()}`;

    item.append(link, description, starredAt);
    repositoryList.append(item);
  }
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a JSON array");
    }

    renderRepositories(repositories);
  } catch (error) {
    console.error("Could not load starred repositories:", error);
    const status = document.createElement("li");
    status.className = "status";
    status.textContent = "Unable to load starred repositories.";
    repositoryList.replaceChildren(status);
  }
}

loadRepositories();
