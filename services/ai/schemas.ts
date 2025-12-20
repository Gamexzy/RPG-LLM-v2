
import { Schema, Type } from "@google/genai";

export const WorldEngineSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    actionResult: { type: Type.STRING },
    playerStatus: { type: Type.STRING },
    newLocation: { type: Type.STRING },
    timePassed: { type: Type.STRING },
    currentWeather: { type: Type.STRING },
    worldEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
    inventoryUpdates: {
      type: Type.OBJECT,
      properties: {
        added: { type: Type.ARRAY, items: { type: Type.STRING } },
        removed: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    statChanges: {
      type: Type.OBJECT,
      properties: {
        health: { type: Type.NUMBER },
        strength: { type: Type.NUMBER },
        agility: { type: Type.NUMBER },
        intelligence: { type: Type.NUMBER },
        spirit: { type: Type.NUMBER }
      },
      description: "Numeric changes to player stats. Use negative for damage/loss."
    }
  },
  required: ["actionResult", "playerStatus", "newLocation", "timePassed", "currentWeather", "worldEvents"]
};

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

export const NarrativeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: { type: Type.STRING },
    canonicalEvents: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Events that change the history of the universe (e.g., Kings dying, Wars starting)."
    },
    discoveredTruths: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "New rules of physics, magic, or deep lore discovered in this turn (e.g., 'Gold blocks magic')."
    },
    graphUpdates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          relation: { type: Type.STRING },
          object: { type: Type.STRING }
        },
        required: ["subject", "relation", "object"]
      }
    },
    knowledgeUpdate: {
      type: Type.OBJECT,
      properties: {
        characters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["id", "type", "description"] } },
        locations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["id", "type", "description"] } },
        quests: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, status: { type: Type.STRING } }, required: ["id", "title", "description", "status"] } }
      }
    }
  },
  required: ["narrative"]
};

export const InitSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        initialTime: { type: Type.STRING },
        narrative: NarrativeSchema.properties?.narrative,
        worldUpdate: WorldEngineSchema,
        npcSimulation: NPCBehaviorSchema.properties?.npcs
    },
    required: ["initialTime", "narrative", "worldUpdate", "npcSimulation"]
};
