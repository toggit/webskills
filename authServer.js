require("dotenv").config();

const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

app.use(express.json());

let refreshTokens = [];

const users = [];

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/users", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log("hashPassword: " + hashedPassword);
    const user = { name: req.body.username, password: hashedPassword };
    users.push(user);
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});

app.get("/token", (req, res) => {
  const accessToken = req.body.token;
  const accessTokenDecoded = jwt.decode(accessToken);
  accessTokenDecoded.date = new Date(
    accessTokenDecoded.iat * 1000
  ).toGMTString();
  console.log(accessTokenDecoded);
  res.send(accessTokenDecoded);
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.post("/login", async (req, res) => {
  // Authenticate User
  const username = users.find((user) => (user.username = req.body.username));
  if (username == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, username.password)) {
      // var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const ip = req.connection.remoteAddress;
      const user = { name: username.username, ip: ip };

      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

      refreshTokens.push(refreshToken);

      res.json({ accessToken: accessToken, refreshToken: refreshToken });
    } else {
      res.status(401).send("Not Allowed");
    }
  } catch {
    res.status(500).send();
  }
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

app.listen(4000, "0.0.0.0");
console.log("Server Running: https://localhost:4000");
