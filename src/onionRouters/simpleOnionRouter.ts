import bodyParser from "body-parser";
import express from "express";
import axios from "axios";
import { BASE_ONION_ROUTER_PORT, REGISTRY_PORT } from "../config";
import * as crypto from "../crypto";

export async function simpleOnionRouter(nodeId: number) {
  const { publicKey, privateKey } = await crypto.generateRsaKeyPair();
  const publicKeyString = await crypto.exportPubKey(publicKey);
  const privateKeyString = await crypto.exportPrvKey(privateKey);
  
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: string | null = null;

  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: lastMessageDestination });
  });

  onionRouter.get("/getPrivateKey", (req, res) => {
    res.json({result: privateKeyString});
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, async () => {
    console.log(`Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`);
    console.log({index: nodeId, pubKey: publicKeyString, prvKey: privateKeyString});

    // Register the node on the registry
    await registerNodeOnRegistry(nodeId, publicKeyString);
  });

  return server;
}

async function registerNodeOnRegistry(nodeId: number, publicKey: string) {
  try {
    const response = await axios.post(`http://localhost:${REGISTRY_PORT}/registerNode`, {
      nodeId: nodeId,
      pubKey: publicKey,
    });

    // console.log(`Node ${nodeId} registered successfully on the registry. Response:`, response.data);
  } 
  catch (error) {
    console.error(`Error registering node ${nodeId} on the registry:`);
  }
}
