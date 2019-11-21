/* eslint-env node */

const HTTP_ERROR = 400,
  HTTP_INTERNAL_ERROR = 500,
  SERVER_PORT = 9999,
  fs = require("fs"),
  https = require("https"),
  express = require("express"),
  fileUpload = require("express-fileupload"),
  app = express();

var server;

app.use(fileUpload());
app.post("/upload", handleUpload);

server = https.createServer({
  key: fs.readFileSync("./certs/server.key"),
  cert: fs.readFileSync("./certs/server.cert"),
}, app);
server.listen(SERVER_PORT);

function handleUpload(request, response) {
  if (!request.files || Object.keys(request.files).length === 0) {
    request.status(HTTP_ERROR).send("No files were uploaded.");
  }
  let file = request.files.file,
    experiment = request.body.experiment,
    user = request.body.user,
    session = request.body.session,
    path = `data/${experiment}/${user}`;
  log(`Received [${file.name}] from user with ID ${user} for session ${session}`
  );
  fs.mkdir(path, { recursive: true }, function(error) {
    if (error) {
      throw error;
    } else {
      log(`Moving file to ${path}`);
      file.mv(`${path}/${session}.csv`, function(err) {
        if (err) {
          response.status(HTTP_INTERNAL_ERROR).send(err);
        } else {
          response.send("File uploaded successfully");
        }
      });
    }
  });
}

function log(msg) {
	/* eslint-disable no-console */
	console.log(msg);
	/* eslint-ensable no-console */
}