const repositoryList = document.querySelector("#repository-list");
const searchInput = document.querySelector("#repository-search");
let allRepositories = [];

function showSearchResults() {
  const query = searchInput.value.trim().toLowerCase();

  const matchingRepositories = allRepositories.filter((repository) =>
    `${repository.name} ${repository.description}`
      .toLowerCase()
      .includes(query)
  );

  renderRepositories(
    matchingRepositories,
    query ? "No repositories match your search." : "No starred repositories yet."
  );
}

searchInput.addEventListener("input", showSearchResults);

function renderRepositories(repositories, emptyMessage) {
  repositoryList.replaceChildren();

  if (repositories.length == 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "status";
    emptyState.textContent = emptyMessage;
    repositoryList.append(emptyState);
    return;
  }

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

function isValidRepository(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const hasRequiredText =
    ["name", "url", "description", "starred_at"].every(
      (field) =>
        typeof value[field] === "string" &&
        value[field].trim().length > 0
    );

    if (!hasRequiredText) {
    return false;
  }

  let url;
  try {
    url = new URL(value.url);
  } catch {
    return false;
  }

  const date = value.starred_at;
  const isValidDate =
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
    new Date(`${date}T00:00:00Z`).toISOString().startsWith(date);

  return url.protocol === "https:" && isValidDate;
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

    if (!repositories.every(isValidRepository)) {
      throw new Error("Repository data contains an invalid record");
    }

    allRepositories = repositories;
    showSearchResults();
  } catch (error) {
    console.error("Could not load starred repositories:", error);
    const status = document.createElement("li");
    status.className = "status";
    status.textContent = "Unable to load starred repositories.";
    repositoryList.replaceChildren(status);
  }
}

loadRepositories();
