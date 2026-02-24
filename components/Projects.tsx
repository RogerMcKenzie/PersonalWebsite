import { fetchGitHubRepos } from "@/lib/github";
import { ProjectCard } from "./ProjectCard";
import { ProjectsHeader } from "./ProjectsHeader";
import { FallbackProjects } from "./FallbackProjects";
import { SlantedDivider } from "./SectionDivider";

export async function Projects() {
  const repos = await fetchGitHubRepos();

  return (
    <section id="projects" className="relative bg-foreground py-20 sm:py-28 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <ProjectsHeader />

        {repos.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, index) => (
              <ProjectCard key={repo.name} repo={repo} index={index} />
            ))}
          </div>
        ) : (
          <FallbackProjects />
        )}
      </div>
      <SlantedDivider bgColor="#f3f4f6" />
    </section>
  );
}
