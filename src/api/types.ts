export interface PelotonInstructor {
  id: string;
  name: string;
  image_url: string;
}

export interface PelotonClass {
  id: string;
  title: string;
  duration: number; // seconds
  image_url: string;
  difficulty_estimate: number;
  fitness_discipline_display_name: string;
  instructor_id: string;
  instructors?: PelotonInstructor[];
  original_air_time?: number; // unix timestamp
  content_format?: string;
}

export interface ArchivedRidesResponse {
  data: PelotonClass[];
  total: number;
  page_count: number;
  instructors?: { [id: string]: PelotonInstructor };
}

export interface BrowseCategory {
  id: string;
  name: string;
  list_image_url?: string;
  fitness_discipline?: string;
}

export interface BrowseCategoriesResponse {
  browse_categories: BrowseCategory[];
}

