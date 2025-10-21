import { useAuth } from './useAuth';

export const useVehicles = () => {
  const API_BASE = 'https://snuevos.cl/api';
  const { token } = useAuth();

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`,
  });

  const fetchVehicles = async () => {
    const response = await fetch(`${API_BASE}/automoviles`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener vehículos');
    }

    return await response.json();
  };

  const createVehicle = async (vehicleData: {
    marca: string;
    modelo: string;
    ano: number;
    km: number;
    combustible?: string;
    transmision?: string;
    carroceria?: string;
    descripcion?: string;
  }) => {
    const response = await fetch(`${API_BASE}/automoviles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear vehículo');
    }

    return await response.json();
  };

  const updateVehicle = async (id: number, vehicleData: {
    marca: string;
    modelo: string;
    ano: number;
    km: number;
    combustible?: string;
    transmision?: string;
    carroceria?: string;
    descripcion?: string;
  }) => {
    const response = await fetch(`${API_BASE}/automoviles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar vehículo');
    }

    return await response.json();
  };

  const deleteVehicle = async (id: number) => {
    const response = await fetch(`${API_BASE}/automoviles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar vehículo');
    }

    return await response.json();
  };

  const uploadImage = async (formData: FormData) => {
    // No añadimos Content-Type para que el browser ponga el boundary
    const headers: any = {
      Authorization: `Bearer ${token.value}`,
    };

    const response = await fetch(`${API_BASE}/imagenes`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      // intentar leer el cuerpo para dar más contexto
      let body: any = null;
      try {
        body = await response.json();
      } catch (e) {
        try {
          body = await response.text();
        } catch (_) {
          body = null;
        }
      }

      if (response.status === 404) {
        throw new Error(`Endpoint POST ${API_BASE}/imagenes no encontrado (404). Respuesta: ${JSON.stringify(body)}`);
      }

      const message = (body && (body.message || body.error)) || `Error subiendo imagen, status ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  };

  const getVehicleImages = async (automovilId: number) => {
    const response = await fetch(`${API_BASE}/imagenes?automovil_id=${automovilId}`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      // endpoint no existe o no hay imágenes; retornar array vacío para evitar errores en la UI
      return [];
    }

    if (!response.ok) {
      let body: any = null;
      try {
        body = await response.json();
      } catch (e) {
        body = null;
      }
      throw new Error((body && (body.message || body.error)) || 'Error al obtener imágenes del vehículo');
    }

    return await response.json();
  };

  const deleteImage = async (imagenId: number) => {
    const response = await fetch(`${API_BASE}/imagenes/${imagenId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Error al eliminar imagen' }));
      throw new Error(err.message || 'Error al eliminar imagen');
    }

    return await response.json();
  };

  return {
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    uploadImage,
    getVehicleImages,
    deleteImage,
  };
};
