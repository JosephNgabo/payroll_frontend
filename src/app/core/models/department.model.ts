// This model is for frontend use. Backend fields 'departement_name' and 'departement_description' are mapped to 'name' and 'description' in the service.
export interface Department {
  id: string;
  name: string;
  description: string;
} 