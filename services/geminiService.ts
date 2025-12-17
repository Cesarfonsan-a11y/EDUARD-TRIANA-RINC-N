
import { GoogleGenAI, Type } from "@google/genai";
import { ActorNode, RelationLink, AnalysisResponse, VoteRecord } from "../types";

export type AnalysisMode = 'ACTOR_TACTICAL' | 'VOTE_REGISTRY_IMPACT' | 'GENERAL_ECOSYSTEM' | 'METRIC_PROJECTION';

export const getEcosystemAnalysis = async (
  actors: ActorNode[],
  relations: RelationLink[],
  context: {
    mode: AnalysisMode;
    selectedActor?: ActorNode | null;
    lastRecord?: VoteRecord | null;
    totalRecords?: number;
    metricType?: string;
  }
): Promise<AnalysisResponse | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let contextPrompt = "";
  const target = 1005;

  if (context.mode === 'ACTOR_TACTICAL' && context.selectedActor) {
    contextPrompt = `
      MODO: ANÁLISIS TÁCTICO DE ACTOR
      Actor: "${context.selectedActor.name}"
      Categoría: ${context.selectedActor.category}
      Analiza cómo este actor asegura la lealtad política para Eduard Triana.
    `;
  } else if (context.mode === 'VOTE_REGISTRY_IMPACT' && context.lastRecord) {
    const actor = actors.find(a => a.id === context.lastRecord?.actorId);
    contextPrompt = `
      MODO: IMPACTO DE NUEVO REGISTRO
      Votante: ${context.lastRecord.voterName} vinculada a ${actor?.name}.
      Progreso: ${context.totalRecords} de ${target} votos.
    `;
  } else if (context.mode === 'METRIC_PROJECTION') {
    contextPrompt = `
      MODO: PROYECCIÓN MÉTRICA ESTRATÉGICA
      Métrica Analizada: ${context.metricType}
      Datos actuales: ${context.totalRecords} registros vs Meta de ${target}.
      Analiza si la velocidad de captación y la red de influencia actual permiten llegar a la meta.
    `;
  } else {
    contextPrompt = `
      MODO: ANÁLISIS GENERAL DE COBERTURA
      Analiza la salud de la red de Eduard Triana en Paipa.
    `;
  }

  const prompt = `
    ${contextPrompt}
    
    ESTRUCTURA DE RED:
    ACTORES: ${JSON.stringify(actors)}
    RELACIONES: ${JSON.stringify(relations)}
    
    Genera un informe en JSON:
    1. summary: Análisis crítico.
    2. correlations: 3 tendencias.
    3. strategicInsights: 3 acciones.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            correlations: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategicInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "correlations", "strategicInsights"]
        }
      }
    });

    return response.text ? (JSON.parse(response.text) as AnalysisResponse) : null;
  } catch (error) {
    console.error("Error en inteligencia:", error);
    return null;
  }
};
