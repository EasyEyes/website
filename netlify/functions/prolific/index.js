import fetch from "node-fetch";
import { saveAs } from "file-saver";
import Blob from "cross-blob";

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
      const response = await fetch(`https://api.prolific.co/api/v1/${task}`, {
        method: "GET",
        headers: {
          ...event.headers,
          host: "api.prolific.co",
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
      const response = await fetch(`https://api.prolific.co/api/v1/${task}`, {
        method: "POST",
        body: event.body,
        headers: {
          ...event.headers,
          host: "api.prolific.co",
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
        `https://api.prolific.co/api/v1/${task}?limit=300&offset=0`,
        {
          method: "GET",
          headers: {
            ...event.headers,
            host: "api.prolific.co",
            "Access-Control-Allow-Origin": "*",
          },
        }
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
      const response = await fetch(`https://api.prolific.co/api/v1/${task}`, {
        method: "GET",
        headers: {
          ...event.headers,
          host: "api.prolific.co",
          "Access-Control-Allow-Origin": "*",
        },
      });

      const blob1 = await response.blob();
      const blob = new Blob([blob1], { type: "text/csv" });
      console.log(blob1, "prolific");
      saveAs(blob, "data.csv");
      data = {
        message: "CSV file downloaded and saved",
      };
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
      const response = await fetch(`https://api.prolific.co/api/v1/${task}`, {
        method: "GET",
        headers: {
          ...event.headers,
          host: "api.prolific.co",
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
