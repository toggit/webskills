require("dotenv").config();

const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");

// Generate Random hexa 64 bytes token
// require('crypto').randomBytes(64).toString('hex')

// serve static directory
// app.use(express.static("ResponsiveNavBar"));
// app.use(express.static("images"));

app.use(express.json());

const posts = [
  {
    username: "Tomer",
    title: "Post1",
  },
  {
    username: "Oren",
    title: "Post2",
  },
];

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.name));
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(3000);
console.log("Server Running: https://localhost:3000");
