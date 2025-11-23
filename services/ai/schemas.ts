import { Schema, Type } from "@google/genai";

export const NarrativeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "A direct, concise, and functional 2nd person narrative. Focus on describing the situation clearly, listing visible interactive objects, exits, or immediate threats."
    },
    playerStatusUpdate: {
      type: Type.STRING,
      description: "Short status description of the player's physical condition."
    },
    playerLocation: {
      type: Type.STRING,
      description: "The specific location of the player after the action."
    },
    timeUpdate: {
      type: Type.OBJECT,
      properties: {
        newTime: {
          type: Type.STRING,
          description: "The current in-game date/time using a SIMPLE NUMERIC format."
        }
      },
      required: ["newTime"]
    },
    worldEvents: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of active global events or weather."
    },
    knowledgeUpdate: {
      type: Type.OBJECT,
      description: "Updates to the persistent Codex. Only include NEW or UPDATED information.",
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
  required: ["narrative", "playerStatusUpdate", "playerLocation", "timeUpdate", "worldEvents"]
};

export const NPCBehaviorSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    npcs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique ID of the NPC (internal)" },
          name: { type: Type.STRING, description: "The true name of the NPC" },
          descriptor: { type: Type.STRING, description: "How the player sees them (e.g., 'Tall Guard', 'Shadowy Figure')" },
          isNameKnown: { type: Type.BOOLEAN, description: "True ONLY if the player explicitly knows their name." },
          location: { type: Type.STRING, description: "Where they are now" },
          action: { type: Type.STRING, description: "Visible action they are performing" },
          lastThought: { type: Type.STRING, description: "Internal monologue explaining WHY they are doing this." },
          status: { type: Type.STRING, description: "Physical state (Alert, Sleeping, Dead)" }
        },
        required: ["id", "name", "descriptor", "isNameKnown", "location", "action", "lastThought", "status"]
      }
    }
  },
  required: ["npcs"]
};

export const InitSchema: Schema = {
    type: NarrativeSchema.type,
    properties: {
        ...NarrativeSchema.properties,
        npcSimulation: NPCBehaviorSchema.properties?.npcs
    },
    required: [...(NarrativeSchema.required || []), "npcSimulation"]
};
