
export type ActorCategory = 'CORE' | 'SUPPLIER' | 'CONSUMPTION' | 'POLITICAL' | 'PROFESSIONAL';

export interface ActorNode {
  id: string;
  name: string;
  category: ActorCategory;
  description: string;
  baseCount?: number;
  val?: number;
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
  recordedBy?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface DatabaseStats {
  totalRecords: number;
  lastUpdate: number;
  serverStatus: 'online' | 'offline' | 'syncing';
  latency: number;
}

export interface AppSettings {
  googleSheetUrl: string;
  leaderName: string;
  isConfigured: boolean;
}

export interface AnalysisResponse {
  summary: string;
  correlations: string[];
  strategicInsights: string[];
}
