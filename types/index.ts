export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'delivery' | 'admin';
  avatar?: string;
  created_at: string;
}

export interface DeliveryRequest {
  id: string;
  user_id: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  pickup_contact_name: string;
  pickup_contact_phone: string;
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  delivery_contact_name: string;
  delivery_contact_phone: string;
  package_description: string;
  package_value?: number;
  special_instructions?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  delivery_person_id?: string;
  created_at: string;
  updated_at: string;
  estimated_time?: number;
  price: number;
}

export interface DeliveryPerson {
  id: string;
  user_id: string;
  vehicle_type: 'bike' | 'motorcycle' | 'car' | 'walking';
  license_plate?: string;
  is_available: boolean;
  current_lat?: number;
  current_lng?: number;
  rating: number;
  completed_deliveries: number;
  created_at: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string, role: 'user' | 'delivery') => Promise<void>;
  signOut: () => Promise<void>;
}