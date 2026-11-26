import { prolificUpstreamFetch } from "../prolific/index.mts";

type ProlificProject = {
  title?: string;
  owner?: string;
  users?: { id: string; email?: string }[];
};

export const createProjectDetailsHandler =
  (fetchProject = prolificUpstreamFetch) =>
  async (request: Request): Promise<Response> => {
    if (request.method !== "GET") return Response.json({}, { status: 405 });

    const authorization = request.headers.get("authorization");
    if (!authorization) return Response.json({}, { status: 401 });

    const projectId = new URL(request.url).searchParams.get("projectId");
    if (!projectId?.trim() || projectId === "." || projectId === "..")
      return Response.json({}, { status: 400 });

    try {
      const response = await fetchProject(
        `https://api.prolific.com/api/v1/projects/${encodeURIComponent(projectId)}/`,
        { headers: { authorization }, redirect: "error" },
      );
      if (!response.ok) {
        const retryAfter = response.headers.get("Retry-After");
        return Response.json(
          {},
          {
            status: response.status,
            headers: retryAfter ? { "Retry-After": retryAfter } : undefined,
          },
        );
      }

      const project = (await response.json()) as ProlificProject | null;
      const owner =
        project?.owner && Array.isArray(project.users)
          ? project.users.find((user) => user?.id === project.owner)
          : undefined;
      return Response.json(
        {
          title: typeof project?.title === "string" ? project.title : undefined,
          ownerEmail:
            typeof owner?.email === "string" ? owner.email : undefined,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch {
      return Response.json({}, { status: 502 });
    }
  };

export default createProjectDetailsHandler();
