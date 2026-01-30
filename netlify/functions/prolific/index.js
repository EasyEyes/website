import fetch from "node-fetch";

const responseWrapper = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
};

exports.handler = async (event, context) => {
  let statusCode, data;

  // 'users/me/' or 'studies/' or 'projects/id/studies'
  const task = event.path.replace("/.netlify/functions/prolific/", "");

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
  } else if (task.includes("studies") && task.endsWith("studies/")) {
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
      statusCode = 200;
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
        throw new Error(
          `Failed to fetch workspaces: ${workspacesResponse.status} ${workspacesResponse.statusText}`,
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
        throw new Error(
          `Failed to fetch participant groups: ${participantGroupsResponse.status} ${participantGroupsResponse.statusText}`,
        );
      }

      data = await participantGroupsResponse.json();
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
};
