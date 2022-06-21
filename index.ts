import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import * as bcrypt from "bcrypt";
import Joi from 'joi'
import { PrismaClient, User } from '@prisma/client';
import jwt, { JwtPayload, Secret, VerifyCallback, VerifyErrors } from 'jsonwebtoken';
import cors from 'cors';

dotenv.config();

if (!process.env.JWT_PRIVATE_KEY) {
  console.log(
    "Vous devez créer un fichier .env qui contient la variable JWT_PRIVATE_KEY"
  );
  process.exit(1);
}

const prisma = new PrismaClient()
const app: Express = express();

const port = process.env.PORT;
const SECRET_KEY: Secret = process.env.JWT_PRIVATE_KEY;

interface CustomRequest extends Request {
  user: Omit<User, "password">;
}

const allowedOrigins = ['http://localhost:3000'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

// Then pass these options to cors:
app.use(cors(options));
app.use(express.json())

function authGuard(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ erreur: "Vous devez vous connecter" });

  jwt.verify(token, SECRET_KEY, async (err, data) => {
    if (err) return res.status(400).json({ erreur: "Token Invalide" });

    const user = await prisma.user.findUnique({ where: { id: (data as JwtPayload).jti } });

    (req as CustomRequest).user = (user as Omit<User, "password">);

    next();
  });
}

app.post("/signup", async (req, res) => {
  const payload = req.body;
  const schema = Joi.object({
    email: Joi.string().required().email(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { value: account, error } = schema.validate(payload);
  if (error) return res.status(400).send({ erreur: error.details[0].message });

  const user = await prisma.user.findUnique({ where: { email: account.email } });
  if (user) return res.status(400).send("Please signin instead of signup");

  const salt = await bcrypt.genSalt(10);
  const passwordHashed = await bcrypt.hash(account.password, salt);
  account.password = passwordHashed;

  await prisma.user.create({
    data: account
  })

  res.status(201).json({
    username: account.username,
    email: account.email,
  });
});

app.post("/signin", async (req, res) => {
  const payload = req.body;
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });

  const { value: connexion, error } = schema.validate(payload);

  if (error) return res.status(400).send({ erreur: error.details[0].message });

  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) return res.status(400).send({ erreur: "Email Invalide" });

  const passwordIsValid = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!passwordIsValid)
    return res.status(400).send({ erreur: "Mot de Passe Invalide" });

  const token = jwt.sign({ jti: user.id }, SECRET_KEY);
  res
    .status(200)
    .send({ username: user.username, token: token });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get("/api/tasks", authGuard, async (req: Request, res: Response) => {
  const user = (req as CustomRequest).user;

  const tasks = await prisma.task.findMany({
    where: { by: user.id }
  })
  res.json(tasks)
})

app.get("/api/task/:id", async (req, res) => {
  let id = req.params.id;
  const task = await prisma.task.findUnique({
    where: { id }
  })
  res.json(task);
});

app.post("/api/tasks", authGuard, async (req: Request, res: Response) => {
  const payload = req.body;

  const schema = Joi.object({
    description: Joi.string().required(),
    // faite: Joi.boolean().required(),
  });
  const { value, error } = schema.validate(payload);
  if (error) return res.status(400).send({ erreur: error.details[0].message });

  const user = (req as CustomRequest).user

  const task = await prisma.task.create({
    data: {
      description: value.description,
      faite: true,
      author: { connect: { email: user.email } },
    },
  })
  res.json(task)
})

app.put("/api/task/:id", authGuard, async (req: Request, res: Response) => {
  let id = req.params.id;
  const payload = req.body;

  const schema = Joi.object({
    description: Joi.string(),
    faite: Joi.boolean(),
  }).or('description', 'faite');
  const { value, error } = schema.validate(payload);
  if (error) return res.status(400).send({ erreur: error.details[0].message });

  const post = await prisma.task.update({
    where: { id },
    data: value,
  })

  res.status(204).send();
});

app.delete("/api/task/:id", authGuard, async (req: Request, res: Response) => {
  let id = req.params.id;

  const user = (req as CustomRequest).user;

  const task = await prisma.task.findUnique({
    where: { id }
  })

  if (user.id !== task?.by) {
    return res.status(400).send({ erreur: "Cette tâche ne vous appartient pas" });
  }

  const t = await prisma.task.delete({ where: { id } });

  res.status(204).send();
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
