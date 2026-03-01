import { siteConfig } from "./data";

const MAX_PROJECTS = 6;
const REVALIDATE_SECONDS = 3600;
const PERSONAL_WEBSITE_ALIAS_TOKENS = [
  "personalwebsite",
  "personal-website",
  "rogermckenziedev",
];

interface PriorityProjectTarget {
  fullNames: string[];
  aliases: string[];
}

const PRIORITY_PROJECTS: PriorityProjectTarget[] = [
  {
    fullNames: ["dsmithnautel/restailor"],
    aliases: ["restailor"],
  },
  {
    fullNames: [`${siteConfig.githubUsername}/SnapCal`],
    aliases: ["snapcal"],
  },
  {
    fullNames: [
      `${siteConfig.githubUsername}/MockClient-JennasRecipes`,
      `${siteConfig.githubUsername}/MockClient-JennasRecipes-1`,
      `${siteConfig.githubUsername}/MockClient-JennasRecipes-2`,
      `${siteConfig.githubUsername}/mock-client-jennas-recipes`,
    ],
    aliases: [
      "mock client jennas recipes",
      "mock client jenna s recipes",
      "mockclientjennasrecipes",
      "mockclient-jennasrecipes",
    ],
  },
];

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  languages: string[];
}

interface GitHubRestRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
}

interface GraphQLPinnedRepo {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  repositoryTopics?: {
    nodes: Array<{
      topic?: {
        name?: string | null;
      } | null;
    }>;
  } | null;
  languages?: {
    nodes: Array<{
      name?: string | null;
    } | null>;
  } | null;
}

interface GraphQLPinnedResponse {
  data?: {
    user?: {
      pinnedItems?: {
        nodes?: Array<GraphQLPinnedRepo | null>;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

const githubApiHeaders = {
  Accept: "application/vnd.github+json",
};

function normalizeRepo(
  repo: Omit<GitHubRepo, "topics" | "languages"> & {
    topics?: string[];
    languages?: string[];
  }
): GitHubRepo {
  return {
    ...repo,
    topics: repo.topics ?? [],
    languages: repo.languages ?? [],
  };
}

function extractStrings(values: Array<string | null | undefined>): string[] {
  return values.filter((value): value is string => Boolean(value));
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSearchValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseRepoFullNameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return null;

    return `${owner}/${repo}`;
  } catch {
    return null;
  }
}

function getRepoFullName(repo: GitHubRepo): string | null {
  return parseRepoFullNameFromUrl(repo.html_url);
}

function getRepoIdentity(repo: GitHubRepo): string {
  return getRepoFullName(repo)?.toLowerCase() ?? repo.name.toLowerCase();
}

function isPriorityRepoMatch(
  repo: GitHubRepo,
  target: PriorityProjectTarget
): boolean {
  const repoFullName = getRepoFullName(repo)?.toLowerCase();
  if (
    repoFullName &&
    target.fullNames.some((fullName) => fullName.toLowerCase() === repoFullName)
  ) {
    return true;
  }

  const searchableText = normalizeSearchValue(
    `${repo.name} ${repo.description ?? ""} ${repo.html_url}`
  );
  return target.aliases.some((alias) =>
    searchableText.includes(normalizeSearchValue(alias))
  );
}

function isPersonalWebsiteRepo(repo: GitHubRepo): boolean {
  const repoFullName = getRepoFullName(repo)?.toLowerCase() ?? "";
  const searchableText = normalizeSearchValue(
    `${repo.name} ${repo.description ?? ""} ${repo.html_url} ${repoFullName}`
  );

  return PERSONAL_WEBSITE_ALIAS_TOKENS.some((alias) =>
    searchableText.includes(normalizeSearchValue(alias))
  );
}

async function fetchRepoLanguages(fullName: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/languages`,
      {
        headers: githubApiHeaders,
        next: { revalidate: REVALIDATE_SECONDS },
      }
    );

    if (!res.ok) return [];

    const langs: Record<string, number> = await res.json();
    // Sort by bytes written (descending) and return top 3 language names
    return Object.entries(langs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);
  } catch {
    return [];
  }
}

async function fetchRepoDetails(fullName: string): Promise<GitHubRepo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: githubApiHeaders,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return null;

    const repo: GitHubRestRepo = await res.json();
    const repoFullName = parseRepoFullNameFromUrl(repo.html_url) ?? fullName;
    const languages = await fetchRepoLanguages(repoFullName);

    return normalizeRepo({
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      topics: repo.topics ?? [],
      languages,
    });
  } catch {
    return null;
  }
}

async function fetchPinnedReposFromGraphQL(): Promise<GitHubRepo[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return [];

  const query = `
    query PinnedRepos($username: String!, $first: Int!) {
      user(login: $username) {
        pinnedItems(first: $first, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              forkCount
              repositoryTopics(first: 10) {
                nodes {
                  topic {
                    name
                  }
                }
              }
              languages(first: 3, orderBy: { field: SIZE, direction: DESC }) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        ...githubApiHeaders,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          username: siteConfig.githubUsername,
          first: MAX_PROJECTS,
        },
      }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      console.warn(`GitHub GraphQL returned ${res.status}`);
      return [];
    }

    const payload: GraphQLPinnedResponse = await res.json();
    if (payload.errors?.length) {
      console.warn("GitHub GraphQL errors:", payload.errors[0]?.message);
      return [];
    }

    const nodes = payload.data?.user?.pinnedItems?.nodes ?? [];
    return nodes
      .filter((node): node is GraphQLPinnedRepo => Boolean(node?.name && node?.url))
      .map((repo) =>
        normalizeRepo({
          name: repo.name,
          description: repo.description,
          html_url: repo.url,
          language: null,
          stargazers_count: repo.stargazerCount,
          forks_count: repo.forkCount,
          topics: extractStrings(
            (repo.repositoryTopics?.nodes ?? []).map((item) => item.topic?.name)
          ),
          languages: extractStrings(
            (repo.languages?.nodes ?? []).map((item) => item?.name)
          ),
        })
      );
  } catch (error) {
    console.warn("Failed to fetch pinned repos from GraphQL", error);
    return [];
  }
}

function extractPinnedRepoNames(markup: string, username: string): string[] {
  const pinnedList = markup.match(
    /<ol[^>]*class="[^"]*pinned-item-list[^"]*"[^>]*>[\s\S]*?<\/ol>/i
  );
  const source = pinnedList?.[0] ?? markup;

  const repoHrefPattern = new RegExp(
    `href="/${escapeRegExp(username)}/([A-Za-z0-9._-]+)"`,
    "gi"
  );

  const names: string[] = [];
  const seen = new Set<string>();

  for (const match of source.matchAll(repoHrefPattern)) {
    const repoName = match[1];
    const key = repoName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      names.push(repoName);
    }
  }

  return names.slice(0, MAX_PROJECTS);
}

async function fetchPinnedRepoNamesFromProfile(): Promise<string[]> {
  const profileEndpoints = [
    `https://github.com/users/${siteConfig.githubUsername}/pinned_items`,
    `https://github.com/${siteConfig.githubUsername}`,
  ];

  for (const endpoint of profileEndpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          Accept: "text/html",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      });

      if (!res.ok) continue;

      const markup = await res.text();
      const repoNames = extractPinnedRepoNames(markup, siteConfig.githubUsername);
      if (repoNames.length > 0) {
        return repoNames;
      }
    } catch {
      // Try the next endpoint.
    }
  }

  return [];
}

async function fetchPinnedReposFromProfile(): Promise<GitHubRepo[]> {
  const pinnedRepoNames = await fetchPinnedRepoNamesFromProfile();
  if (pinnedRepoNames.length === 0) {
    return [];
  }

  const repos = await Promise.all(
    pinnedRepoNames.map((repoName) =>
      fetchRepoDetails(`${siteConfig.githubUsername}/${repoName}`)
    )
  );

  return repos.filter((repo): repo is GitHubRepo => Boolean(repo));
}

async function fetchRecentRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${siteConfig.githubUsername}/repos?sort=updated&per_page=${MAX_PROJECTS}&type=owner`,
      {
        headers: githubApiHeaders,
        next: { revalidate: REVALIDATE_SECONDS },
      }
    );

    if (!res.ok) {
      return [];
    }

    const repos: GitHubRestRepo[] = await res.json();
    const visibleRepos = repos
      .filter((repo) => !repo.name.startsWith("."))
      .slice(0, MAX_PROJECTS);

    return Promise.all(
      visibleRepos.map(async (repo) =>
        normalizeRepo({
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          topics: repo.topics ?? [],
          languages: await fetchRepoLanguages(
            parseRepoFullNameFromUrl(repo.html_url) ??
              `${siteConfig.githubUsername}/${repo.name}`
          ),
        })
      )
    );
  } catch {
    return [];
  }
}

async function prioritizeFeaturedProjects(repos: GitHubRepo[]): Promise<GitHubRepo[]> {
  const remainingRepos = repos.filter((repo) => !isPersonalWebsiteRepo(repo));
  const prioritizedRepos: GitHubRepo[] = [];
  const seen = new Set<string>();

  const addUniqueRepo = (repo: GitHubRepo) => {
    if (isPersonalWebsiteRepo(repo)) return;

    const identity = getRepoIdentity(repo);
    if (seen.has(identity)) return;
    seen.add(identity);
    prioritizedRepos.push(repo);
  };

  for (const target of PRIORITY_PROJECTS) {
    const existingIndex = remainingRepos.findIndex((repo) =>
      isPriorityRepoMatch(repo, target)
    );

    if (existingIndex >= 0) {
      const [existingRepo] = remainingRepos.splice(existingIndex, 1);
      addUniqueRepo(existingRepo);
      continue;
    }

    for (const fullName of target.fullNames) {
      const fetchedRepo = await fetchRepoDetails(fullName);
      if (fetchedRepo) {
        addUniqueRepo(fetchedRepo);
        break;
      }
    }
  }

  for (const repo of remainingRepos) {
    addUniqueRepo(repo);
  }

  return prioritizedRepos.slice(0, MAX_PROJECTS);
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  const pinnedFromGraphQL = await fetchPinnedReposFromGraphQL();
  if (pinnedFromGraphQL.length > 0) {
    return prioritizeFeaturedProjects(pinnedFromGraphQL);
  }

  const pinnedFromProfile = await fetchPinnedReposFromProfile();
  if (pinnedFromProfile.length > 0) {
    return prioritizeFeaturedProjects(pinnedFromProfile);
  }

  const recentRepos = await fetchRecentRepos();
  if (recentRepos.length === 0) {
    console.warn("Failed to fetch GitHub repos, using fallback projects");
  } else {
    console.warn("Pinned repos unavailable, showing recently updated repos");
  }

  return prioritizeFeaturedProjects(recentRepos);
}
