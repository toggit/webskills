var express = require("express");
var app = express();

app.use(express.static("ResponsiveNavBar"));
// app.use(express.static("images"));

app.listen(3000);
