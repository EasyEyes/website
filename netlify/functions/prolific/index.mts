import nodeFetch from "node-fetch";
import { nativeHandler } from "../shared/nativeHandler";

const UPSTREAM_TIMEOUT_MS = 15_000;

export const prolificUpstreamFetch = async (
  url: string,
  options: Record<string, any> = {},
  fetchImpl: typeof nodeFetch = nodeFetch,
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

export const responseWrapper = (statusCode, body, upstreamHeaders?) => {
  const retryAfter = upstreamHeaders?.get?.("Retry-After");
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      ...(retryAfter
        ? {
            "Retry-After": retryAfter,
            "Access-Control-Expose-Headers": "Retry-After",
          }
        : {}),
    },
    body: JSON.stringify(body),
  };
};

const handler = async (event, fetch: typeof prolificUpstreamFetch) => {
  let statusCode, data, upstreamHeaders;

  if (event.httpMethod === "OPTIONS") {
    return responseWrapper(200, {});
  }

  // 'users/me/' or 'studies/' or 'projects/id/studies'
  const task = event.path.replace("/.netlify/functions/prolific/", "");

  if (event.httpMethod === "GET" && /^projects\/[a-f0-9]{24}\/$/i.test(task)) {
    const authorization = event.headers.authorization;
    if (!authorization) return responseWrapper(401, {});

    try {
      const response = await fetch(`https://api.prolific.com/api/v1/${task}`, {
        method: "GET",
        headers: { authorization },
        redirect: "error",
      });
      if (!response.ok) return responseWrapper(response.status, {});

      const project = await response.json();
      const owner =
        project?.owner && Array.isArray(project.users)
          ? project.users.find((user) => user?.id === project.owner)
          : undefined;
      const result = responseWrapper(200, {
        title: typeof project?.title === "string" ? project.title : undefined,
        ownerEmail: typeof owner?.email === "string" ? owner.email : undefined,
      });
      return {
        ...result,
        headers: { ...result.headers, "Cache-Control": "no-store" },
      };
    } catch {
      return responseWrapper(502, {});
    }
  }

  if (task.includes("users")) {
    // ! user
    try {
      const response = await fetch(`https://api.prolific.com/api/v1/${task}`, {
        method: "GET",
        headers: {
          ...event.headers,
          host: "api.prolific.com",
          "Access-Control-Allow-Origin": "*",
        },
        redirect: "follow",
      });

      data = await response.json();
      statusCode = 200;
    } catch (error) {
      console.error("ERROR", error);

      data = {
        error: error.message,
      };
      statusCode = 500;
    }

    return responseWrapper(statusCode, data);
  } else if (
    task.includes("studies") &&
    task.endsWith("studies/") &&
    !task.includes("projects")
  ) {
    // ! study
    try {
      const response = await fetch(`https://api.prolific.com/api/v1/${task}`, {
        method: "POST",
        body: event.body,
        headers: {
          ...event.headers,
          host: "api.prolific.com",
          "Access-Control-Allow-Origin": "*",
        },
        // redirect: "follow",
      });

      data = await response.json();
      // Preserve Prolific's validation/authentication status as well as its body.
      statusCode = response.status;
    } catch (error) {
      console.error("ERROR", error);

      data = {
        error: error.message,
      };
      statusCode = 500;
    }

    return responseWrapper(statusCode, data);
  } else if (task.includes("submissions")) {
    // ! study submissions
    try {
      const response = await fetch(
        `https://api.prolific.com/api/v1/${task}?limit=300&offset=0`,
        {
          method: "GET",
          headers: {
            ...event.headers,
            host: "api.prolific.com",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );

      data = await response.json();
      statusCode = 200;
    } catch (error) {
      console.error("ERROR", error);

      data = {
        error: error.message,
      };
      statusCode = 500;
    }

    return responseWrapper(statusCode, data);
  } else if (task.includes("export")) {
    // ! download participants demographics
    try {
      const response = await fetch(`https://api.prolific.com/api/v1/${task}`, {
        method: "GET",
        headers: {
          ...event.headers,
          host: "api.prolific.com",
          "Access-Control-Allow-Origin": "*",
        },
      });

      data = await response.text();
      statusCode = 200;
    } catch (error) {
      console.error("ERROR", error);

      data = {
        error: error.message,
      };
      statusCode = 500;
    }

    return responseWrapper(statusCode, data);
  } else if (task.includes("filter-sets")) {
    // ! filter sets (Prolific screener sets)
    try {
      const authToken = event.headers.authorization;

      if (!authToken) {
        return responseWrapper(401, { error: "Authorization token missing" });
      }

      // Step 1: Get workspace ID
      const workspacesResponse = await fetch(
        "https://api.prolific.com/api/v1/workspaces/",
        {
          method: "GET",
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (!workspacesResponse.ok) {
        return responseWrapper(
          workspacesResponse.status,
          await workspacesResponse.json(),
          workspacesResponse.headers,
        );
      }

      const workspacesData = await workspacesResponse.json();
      const workspaceId =
        workspacesData.results?.[0]?.id || workspacesData[0]?.id;

      if (!workspaceId) {
        return responseWrapper(404, {
          error: "No workspace found for this account",
        });
      }

      // Step 2: Fetch filter sets for the workspace
      const filterSetsResponse = await fetch(
        `https://api.prolific.com/api/v1/filter-sets/?workspace_id=${workspaceId}`,
        {
          method: "GET",
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (!filterSetsResponse.ok) {
        return responseWrapper(
          filterSetsResponse.status,
          await filterSetsResponse.json(),
          filterSetsResponse.headers,
        );
      }

      data = await filterSetsResponse.json();
      statusCode = filterSetsResponse.status;
      upstreamHeaders = filterSetsResponse.headers;
    } catch (error) {
      console.error("ERROR", error);

      data = {
        error: error.message,
      };
      statusCode = 500;
    }

    return responseWrapper(statusCode, data, upstreamHeaders);
  } else if (task.includes("participant-groups")) {
    // ! participant groups
    try {
      // Extract authorization token from headers
      const authToken = event.headers.authorization;

      if (!authToken) {
        return responseWrapper(401, { error: "Authorization token missing" });
      }

      // Step 1: Get workspace ID from workspaces API
      const workspacesResponse = await fetch(
        "https://api.prolific.com/api/v1/workspaces/",
        {
          method: "GET",
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (!workspacesResponse.ok) {
        return responseWrapper(
          workspacesResponse.status,
          await workspacesResponse.json(),
          workspacesResponse.headers,
        );
      }

      const workspacesData = await workspacesResponse.json();

      // Get the first workspace ID
      const workspaceId =
        workspacesData.results?.[0]?.id || workspacesData[0]?.id;

      if (!workspaceId) {
        return responseWrapper(404, {
          error: "No workspace found for this account",
        });
      }

      // Step 2: Fetch participant groups for the workspace
      const participantGroupsResponse = await fetch(
        `https://api.prolific.com/api/v1/participant-groups/?workspace_id=${workspaceId}`,
        {
          method: "GET",
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (!participantGroupsResponse.ok) {
        return responseWrapper(
          participantGroupsResponse.status,
          await participantGroupsResponse.json(),
          participantGroupsResponse.headers,
        );
      }

      data = await participantGroupsResponse.json();
      statusCode = participantGroupsResponse.status;
      upstreamHeaders = participantGroupsResponse.headers;
    } catch (error) {
      console.error("ERROR", error);

      data = {
        error: error.message,
      };
      statusCode = 500;
    }

    return responseWrapper(statusCode, data, upstreamHeaders);
  } else if (task.includes("projects") && task.includes("studies")) {
    // ! list project studies (GET with pagination)
    try {
      let allStudies = [];
      let url = `https://api.prolific.com/api/v1/${task}?limit=100&offset=0`;

      while (url) {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            ...event.headers,
            host: "api.prolific.com",
            "Access-Control-Allow-Origin": "*",
          },
        });

        const page = await response.json();

        if (page.results) {
          allStudies = allStudies.concat(page.results);
        }

        url = page.next || null;
      }

      data = { results: allStudies };
      statusCode = 200;
    } catch (error) {
      console.error("ERROR", error);

      data = {
        error: error.message,
      };
      statusCode = 500;
    }

    return responseWrapper(statusCode, data);
  } else if (task.includes("studies")) {
    // ! retrive study
    try {
      const response = await fetch(`https://api.prolific.com/api/v1/${task}`, {
        method: "GET",
        headers: {
          ...event.headers,
          host: "api.prolific.com",
          "Access-Control-Allow-Origin": "*",
        },
      });

      data = await response.json();
      statusCode = 200;
    } catch (error) {
      console.error("ERROR", error);

      data = {
        error: error.message,
      };
      statusCode = 500;
    }

    return responseWrapper(statusCode, data);
  }

  return responseWrapper(404, { error: "Endpoint not found" });
};

export const createProlificHandler = (fetchImpl?: typeof nodeFetch) =>
  nativeHandler((event) =>
    handler(event, (url, options) =>
      prolificUpstreamFetch(url, options, fetchImpl),
    ),
  );

export default createProlificHandler();
