import { User, DeliveryRequest, DeliveryPerson } from '@/types';

// Mock data para desarrollo
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'user@test.com',
    name: 'Juan Pérez',
    phone: '+34 600 123 456',
    role: 'user',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'delivery@test.com',
    name: 'María García',
    phone: '+34 600 789 012',
    role: 'delivery',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'admin@test.com',
    name: 'Admin Sistema',
    phone: '+34 600 345 678',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const MOCK_DELIVERY_REQUESTS: DeliveryRequest[] = [
  {
    id: '1',
    user_id: '1',
    pickup_address: 'Calle 23 y 12, Vedado, La Habana',
    pickup_lat: 23.1319,
    pickup_lng: -82.3841,
    pickup_contact_name: 'Juan Pérez',
    pickup_contact_phone: '+34 600 123 456',
    delivery_address: 'Malecón 567, Centro Habana, La Habana',
    delivery_lat: 23.1478,
    delivery_lng: -82.3540,
    delivery_contact_name: 'Ana López',
    delivery_contact_phone: '+34 600 987 654',
    package_description: 'Documentos importantes',
    package_value: 0,
    special_instructions: 'Entregar en recepción',
    status: 'pending',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    price: 8.50,
  },
];

const MOCK_DELIVERY_PERSONS: DeliveryPerson[] = [
  {
    id: '1',
    user_id: '2',
    vehicle_type: 'motorcycle',
    license_plate: 'M-1234-AB',
    is_available: true,
    current_lat: 23.1350,
    current_lng: -82.3700,
    rating: 4.8,
    completed_deliveries: 156,
    created_at: '2024-01-01T00:00:00Z',
  },
];

class ApiService {
  private baseUrl = 'https://api.tuapp.com'; // URL de tu API real

  // Autenticación
  async login(email: string, password: string): Promise<User> {
    // Simulación de login con datos mock
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async register(email: string, password: string, name: string, phone: string, role: 'user' | 'delivery'): Promise<User> {
    // Simulación de registro
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      phone,
      role,
      created_at: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);
    return newUser;
  }

  // Solicitudes de envío
  async createDeliveryRequest(request: Omit<DeliveryRequest, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<DeliveryRequest> {
    const newRequest: DeliveryRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_DELIVERY_REQUESTS.push(newRequest);
    return newRequest;
  }

  async getDeliveryRequests(userId?: string, status?: string): Promise<DeliveryRequest[]> {
    let requests = [...MOCK_DELIVERY_REQUESTS];
    if (userId) {
      requests = requests.filter(r => r.user_id === userId || r.delivery_person_id === userId);
    }
    if (status) {
      requests = requests.filter(r => r.status === status);
    }
    return requests;
  }

  async updateDeliveryRequest(id: string, updates: Partial<DeliveryRequest>): Promise<DeliveryRequest> {
    const index = MOCK_DELIVERY_REQUESTS.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Solicitud no encontrada');
    }
    MOCK_DELIVERY_REQUESTS[index] = {
      ...MOCK_DELIVERY_REQUESTS[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return MOCK_DELIVERY_REQUESTS[index];
  }

  // Repartidores
  async getAvailableDeliveryPersons(): Promise<DeliveryPerson[]> {
    return MOCK_DELIVERY_PERSONS.filter(d => d.is_available);
  }

  async updateDeliveryPersonLocation(id: string, lat: number, lng: number): Promise<void> {
    const index = MOCK_DELIVERY_PERSONS.findIndex(d => d.id === id);
    if (index !== -1) {
      MOCK_DELIVERY_PERSONS[index].current_lat = lat;
      MOCK_DELIVERY_PERSONS[index].current_lng = lng;
    }
  }

  async acceptDeliveryRequest(requestId: string, deliveryPersonId: string): Promise<DeliveryRequest> {
    return this.updateDeliveryRequest(requestId, {
      delivery_person_id: deliveryPersonId,
      status: 'accepted',
    });
  }

  // Obtener datos de usuario específico
  async getUser(id: string): Promise<User | null> {
    return MOCK_USERS.find(u => u.id === id) || null;
  }

  async getDeliveryPerson(userId: string): Promise<DeliveryPerson | null> {
    return MOCK_DELIVERY_PERSONS.find(d => d.user_id === userId) || null;
  }
}

export const apiService = new ApiService();