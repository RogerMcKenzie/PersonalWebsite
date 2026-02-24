import { siteConfig } from "./data";

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

async function fetchRepoLanguages(repoName: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${siteConfig.githubUsername}/${repoName}/languages`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
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

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${siteConfig.githubUsername}/repos?sort=updated&per_page=6&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status}, using fallback projects`);
      return [];
    }

    const repos: GitHubRepo[] = await res.json();

    const filtered = repos
      .filter((repo) => !repo.name.startsWith(".") && repo.description)
      .slice(0, 6);

    // Fetch languages for each repo in parallel
    const reposWithLanguages = await Promise.all(
      filtered.map(async (repo) => ({
        ...repo,
        languages: await fetchRepoLanguages(repo.name),
      }))
    );

    return reposWithLanguages;
  } catch (error) {
    console.warn("Failed to fetch GitHub repos, using fallback projects", error);
    return [];
  }
}
