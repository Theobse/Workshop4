import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

const registeredNodes: Node[] = [];

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // TODO implement the status route
  _registry.get("/status", (req, res) => {
    res.send("live");
  });

  // Route to register a node
  _registry.post("/registerNode", (req: Request<{}, {}, RegisterNodeBody>, res: Response) => {
    const { nodeId, pubKey } = req.body;

    // Check if the node is already registered
    const existingNode = registeredNodes.find((node) => node.nodeId === nodeId);

    if (existingNode) {
      res.status(400).json({error: "Node already registered"});
    } 
    else {
      // Register the new node
      const newNode: Node = { nodeId, pubKey };
      registeredNodes.push(newNode);

      res.status(200).json({ message: "Node registered successfully", node: newNode });
    }
  });

  _registry.get("/getNodeRegistry", (req, res) => {
    const getNodeRegistryBody: GetNodeRegistryBody = {
      nodes: registeredNodes,
    };
    // console.log(getNodeRegistryBody.nodes.length);
    res.status(200).json(getNodeRegistryBody);
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
