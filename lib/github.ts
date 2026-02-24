import { siteConfig } from "./data";

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
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

    return repos
      .filter((repo) => !repo.name.startsWith(".") && repo.description)
      .slice(0, 6);
  } catch (error) {
    console.warn("Failed to fetch GitHub repos, using fallback projects", error);
    return [];
  }
}
