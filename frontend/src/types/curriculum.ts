export interface Track {
  id: number;
  number: number;
  name: string;
  slug: string;
  category: 'foundations' | 'structure' | 'protocols' | 'automation' | 'specialties';
  description: string;
  mini_site_route: string;
  order: number;
  module_count?: number;
}

export interface OracleCriterion {
  code: string;
  rule: string;
}

export interface ScopedBehavior {
  id?: number;
  code: string;
  title: string;
  category?: string;
  description?: string;
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'trivial';
  is_defect?: boolean;
  trigger_element?: string;
  trigger_action?: string;
  trigger_value?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  hint_direct?: string;
  hint_subtle?: string;
}

export interface Topic {
  id: number;
  code: string;
  title: string;
  slug: string;
  target_element: string;
  oracle_description: string;
  oracle_criteria?: OracleCriterion[];
  investigation_scope: string;
  xp_reward: number;
  order: number;
  active_behaviors?: ScopedBehavior[];
}

export interface Module {
  id: number;
  number: number;
  title: string;
  guidance_level: 'direct' | 'subtle' | 'autonomous';
  description: string;
  order: number;
  topics: Topic[];
}

export interface BugEvidence {
  code: string;
  topicCode?: string;
  title: string;
  status: string;
  severity?: string;
  element?: string;
  inputValue?: string;
  timestamp: number;
}
