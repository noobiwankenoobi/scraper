const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const xpath = require("xpath");
const { DOMParser } = require("xmldom");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.all("/scrape", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.post("/scrape", (req, res) => {
  const { body } = req;
  const { url } = body;

  const xpaths = {
    title: 'string(//meta[@property="og:title"]/@content)',
    description: 'string(//meta[@property="og:description"]/@content)',
    image: 'string(//meta[@property="og:image"]/@content)',
    keywords: 'string(//meta[@property="keywords"]/@content)',
  };

  const retreivePage = (url) => axios.request({ url });
  const convertBodyToDocument = (body) => new DOMParser().parseFromString(body);
  const nodesFromdocument = (document, xpathselector) =>
    xpath.select(xpathselector, document);
  const mapProperties = (paths, document) =>
    Object.keys(paths).reduce(
      (acc, key) => ({
        ...acc,
        [key]: nodesFromdocument(document, paths[key]),
      }),
      {}
    );
  const parseUrl = (url) =>
    retreivePage(url).then((response) => {
      const document = convertBodyToDocument(response.data);
      const mappedProperties = mapProperties(xpaths, document);
      return mappedProperties;
    });

  return parseUrl(url).then((result) => {
    res.json(result);
  });
});

app.get("/", function (req, res) {
  res.send("<h1>Hello World!</h1>");
});

app.listen(process.env.PORT || 5000);
