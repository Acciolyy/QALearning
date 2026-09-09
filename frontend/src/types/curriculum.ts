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

export interface Topic {
  id: number;
  code: string;
  title: string;
  slug: string;
  target_element: string;
  oracle_description: string;
  investigation_scope: string;
  xp_reward: number;
  order: number;
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
