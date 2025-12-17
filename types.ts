
export type ActorCategory = 'CORE' | 'SUPPLIER' | 'CONSUMPTION' | 'POLITICAL';

export interface ActorNode {
  id: string;
  name: string;
  category: ActorCategory;
  description: string;
  baseCount?: number; // Empleados directos + Dueños
  val?: number; // for D3
}

export type RelationType = 'PRIMARY_FLOW' | 'SECONDARY_FLOW' | 'VOTING_INFLUENCE';

export interface RelationLink {
  source: string;
  target: string;
  type: RelationType;
  label: string;
}

export interface VoteRecord {
  id: string;
  actorId: string;
  voterName: string;
  idNumber: string;
  phoneNumber: string;
  timestamp: number;
}

export interface ElectoralZone {
  id: string;
  name: string;
  votePercentage: number;
  workerDensity: number;
}

export interface AnalysisResponse {
  summary: string;
  correlations: string[];
  strategicInsights: string[];
}
