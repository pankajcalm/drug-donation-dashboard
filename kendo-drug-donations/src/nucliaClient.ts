// src/nucliaClient.ts
import { Nuclia } from "@nuclia/core";

const nuclia = new Nuclia({
    apiKey: import.meta.env.VITE_NUCLIA_API_KEY,
    zone: "aws-us-east-2-1", // 👈 from your KB settings
    knowledgeBox: "739e03a5-97e5-4ead-86ac-1c55c3ee6ede", // 👈 your KB UID
});

export default nuclia;
