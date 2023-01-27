import fetch from "node-fetch";

exports.handler = async (event, context) => {
  let statusCode, data;

  // 'users/me/' or 'studies/'
  const task = event.path.replace("/.netlify/functions/prolific/", "");

  if (task.includes("users")) {
    try {
      const response = await fetch(`https://api.prolific.co/api/v1/${task}`, {
        method: "GET",
        headers: event.headers,
        redirect: "follow",
      });
      data = await response.json();
      console.log(data);
      statusCode = 200;
    } catch (error) {
      data = {
        error: error.message,
      };
      console.log(error);
      statusCode = 500;
    }

    return {
      statusCode: statusCode,
      headers: {
        /* Required for CORS support to work */
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: JSON.stringify(data),
    };
  }
};
