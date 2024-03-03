import bodyParser from "body-parser";
import express from "express";
import axios from "axios";
import * as crypto from "../crypto";
import { GetNodeRegistryBody } from "../../src/registry/registry";
import { BASE_USER_PORT, REGISTRY_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  const lastReceivedMessage: { [userId: number]: string } = {};
  let lastSentMessage: string | null = null;

  _user.get("/status", (req, res) => {
    res.send("live");
  });

  _user.get("/getLastSentMessage", (req, res) => {
    res.json({ result: lastSentMessage });
  });

  _user.post("/message", (req, res) => {
    const { message }: SendMessageBody = req.body;
    lastReceivedMessage[userId] = message;
    res.send("success");
  });

  _user.post("/sendMessage", async (req, res) => {
    const { message, destinationUserId }: SendMessageBody = req.body;
    lastSentMessage = message;
    const destinationUserPort = BASE_USER_PORT + destinationUserId;
  
    try {
      const response = await axios.post(`http://localhost:${destinationUserPort}/message`, { message });
  
      // Si la requête est réussie, vous pouvez mettre à jour lastReceivedMessage
      if (response.data === "success") {
        lastReceivedMessage[destinationUserId] = message;
      }
  
      res.send(response.data);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :");
      res.status(500).send("Erreur lors de l'envoi du message");
    }
  });

  _user.get("/getLastReceivedMessage", (req, res) => {
    if (lastReceivedMessage[userId] == null) {
      res.json({ result: null });
    } else {
      res.json({ result: lastReceivedMessage[userId] });
    }
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(`User ${userId} is listening on port ${BASE_USER_PORT + userId}`);
  });

  return server;
}
