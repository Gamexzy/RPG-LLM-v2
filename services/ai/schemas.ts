
import { Schema, Type } from "@google/genai";

// --- AGENT 1: WORLD ENGINE SCHEMA ---
export const WorldEngineSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    actionResult: {
      type: Type.STRING,
      description: "Objective outcome of player action based on physics/logic. (e.g., 'Success: Door opened', 'Fail: Too heavy')."
    },
    playerStatus: {
      type: Type.STRING,
      description: "Current physical condition of player."
    },
    newLocation: {
      type: Type.STRING,
      description: "The location name after the action."
    },
    timePassed: {
      type: Type.STRING,
      description: "How much time passed during this action (e.g., '10 minutes')."
    },
    currentWeather: {
      type: Type.STRING,
      description: "Current weather or atmosphere."
    },
    worldEvents: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Ongoing background events unrelated to player."
    },
    inventoryUpdates: {
      type: Type.OBJECT,
      properties: {
        added: { type: Type.ARRAY, items: { type: Type.STRING } },
        removed: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  },
  required: ["actionResult", "playerStatus", "newLocation", "timePassed", "currentWeather", "worldEvents"]
};

// --- AGENT 2: NPC ENGINE SCHEMA ---
export const NPCBehaviorSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    npcs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          descriptor: { type: Type.STRING },
          isNameKnown: { type: Type.BOOLEAN },
          location: { type: Type.STRING },
          action: { type: Type.STRING },
          lastThought: { type: Type.STRING },
          status: { type: Type.STRING }
        },
        required: ["id", "name", "descriptor", "isNameKnown", "location", "action", "lastThought", "status"]
      }
    }
  },
  required: ["npcs"]
};

// --- AGENT 3: NARRATOR SCHEMA (Funnel) ---
export const NarrativeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "The final 2nd person story text combining World State and NPC Actions."
    },
    knowledgeUpdate: {
      type: Type.OBJECT,
      description: "Updates to Codex based on the narrative revealed.",
      properties: {
        characters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["character"] },
              description: { type: Type.STRING },
              status: { type: Type.STRING }
            },
            required: ["id", "type", "description"]
          }
        },
        locations: {
           type: Type.ARRAY,
           items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["location"] },
              description: { type: Type.STRING },
              status: { type: Type.STRING }
            },
            required: ["id", "type", "description"]
          }
        },
        quests: {
           type: Type.ARRAY,
           items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["active", "completed", "failed"] }
            },
            required: ["id", "title", "description", "status"]
          }
        }
      }
    }
  },
  required: ["narrative"]
};

// --- INIT SCHEMA (Used for bootstrapping) ---
// Combines everything for the very first turn to simplify setup
export const InitSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        initialTime: { 
            type: Type.STRING, 
            description: "The starting date and time in strict format 'DD/MM/YYYY HH:MM' appropriate for the setting." 
        },
        narrative: NarrativeSchema.properties?.narrative,
        worldUpdate: WorldEngineSchema,
        npcSimulation: NPCBehaviorSchema.properties?.npcs
    },
    required: ["initialTime", "narrative", "worldUpdate", "npcSimulation"]
};