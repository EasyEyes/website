const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  let data;

  // 'users/me/' or 'studies/'
  const task = event.path
    .replace("/netlify/functions/prolific/", "")
    .replace(/\//gim, "");

  try {
    const response = await fetch(`https://api.prolific.co/api/v1/${task}`);
    data = await response.json();
  } catch (error) {
    data = {
      status: "ERROR",
      error: error.message,
    };
  }

  return data;
};
