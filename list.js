#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const http = require("http");
const url = require("url");

function getDirectoryList(directory, filter) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        return reject(err);
      }

      const results = files
        .filter((file) => file !== "." && file !== ".." && file !== ".DS_Store")
        .filter(
          (file) => !filter || file.toLowerCase().includes(filter.toLowerCase())
        )
        .map((file) => path.join(directory, file));

      results.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      resolve(results);
    });
  });
}

const server = http.createServer(async (req, res) => {
  const query = url.parse(req.url, true).query;
  const filter = query.filter || "";
  const directory = "tmp";

  try {
    const list = await getDirectoryList(directory, filter);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(list));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
