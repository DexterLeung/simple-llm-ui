const http = require('http');
const url = require("url");
const fs = require('fs');


const server = http.createServer((request, response) => {
  console.dir(request)
  const method = request.method;
  if (method== "POST") {


  } else {
    var q = url.parse(request.url, true);
    var locLink = (q.pathname.endsWith("/zh/") || q.pathname.endsWith("/en/"));
    if (locLink) {
      let newLocation = (q.pathname.length == 4 ? "/" : ("." + (q.pathname.slice(0, -4) + "/")));
      response.writeHead(301, { Location: newLocation });
      response.end();
    } else {

      var filename = (q.pathname == "/" ? "index.html" : "." + q.pathname);
      if (!q.pathname.includes(".")) {
        filename = "index.html";
      }
      fs.readFile(filename, (err, data) => {

        if (err) {
          response.writeHead(404, {
            'Content-Type': 'text/html'
          });
          return response.end("404 Not Found: " + filename);
        }
        response.writeHead(200, {
          'Content-Type': filename.endsWith("html") ? 'text/html' :
                                        filename.endsWith("js") ? "text/javascript" :
                                          filename.endsWith("mjs") ? "javascript/esm" :
                                            filename.endsWith("css") ? "text/css" :
                                              filename.endsWith("png") ? "image/png" :
                                                filename.endsWith("jpg") ? "image/jpg" :
                                                  filename.endsWith("svg") ? "image/svg+xml" :
                                                    filename.endsWith("py") ? "text/python" : ""
        });
        response.write(data);
        response.end();
      });
    }
  }
});

server.listen(8001, () => {
  console.log(`Server running...`);
});
