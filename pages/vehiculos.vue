<template>
  <div class="vehicles-page">
    <header class="page-header">
      <div class="header-content">
        <h1>Gestión de Vehículos</h1>
        <div class="header-actions">
          <span class="user-name">{{ user?.nombre }} {{ user?.apellido }}</span>
          <button class="btn-logout" @click="handleLogout">Cerrar Sesión</button>
        </div>
      </div>
    </header>

    <div class="page-content">
      <div class="toolbar">
        <button class="btn-primary" @click="openAddModal">
          + Agregar Vehículo
        </button>
      </div>

      <div v-if="loading" class="loading">Cargando vehículos...</div>

      <div v-else-if="error" class="error-box">
        {{ error }}
        <button @click="loadVehicles" class="btn-retry">Reintentar</button>
      </div>

      <div v-else-if="vehicles.length === 0" class="empty-state">
        <p>No hay vehículos registrados</p>
        <button class="btn-primary" @click="openAddModal">
          Agregar el primer vehículo
        </button>
      </div>

      <div v-else class="vehicles-grid">
        <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card">
          <div class="vehicle-media">
            <img v-if="vehicle.portada" :src="vehicle.portada" alt="Portada" />
            <div v-else class="placeholder">Sin imagen</div>
          </div>
          <div class="vehicle-header">
            <h3>{{ vehicle.marca }} {{ vehicle.modelo }}</h3>
            <span class="vehicle-year">{{ vehicle.ano }}</span>
          </div>

          <div class="vehicle-details">
            <div class="detail-item">
              <span class="detail-label">Kilómetros:</span>
              <span class="detail-value">{{ formatNumber(vehicle.km) }} km</span>
            </div>

            <div v-if="vehicle.combustible" class="detail-item">
              <span class="detail-label">Combustible:</span>
              <span class="detail-value">{{ vehicle.combustible }}</span>
            </div>

            <div v-if="vehicle.transmision" class="detail-item">
              <span class="detail-label">Transmisión:</span>
              <span class="detail-value">{{ vehicle.transmision }}</span>
            </div>

            <div v-if="vehicle.carroceria" class="detail-item">
              <span class="detail-label">Carrocería:</span>
              <span class="detail-value">{{ vehicle.carroceria }}</span>
            </div>

            <div v-if="vehicle.descripcion" class="detail-description">
              <span class="detail-label">Descripción:</span>
              <p>{{ vehicle.descripcion }}</p>
            </div>
          </div>

          <div class="vehicle-actions">
            <button class="btn-edit" @click="openEditModal(vehicle)">
              Editar
            </button>
            <button class="btn-delete" @click="confirmDelete(vehicle)">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <VehicleForm v-if="showModal" :vehicle="selectedVehicle" :is-edit="isEditMode" @close="closeModal"
      @submit="loadVehicles" />

    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="confirm-dialog">
        <h3>Confirmar Eliminación</h3>
        <p>¿Estás seguro de que deseas eliminar este vehículo?</p>
        <p class="vehicle-info">
          <strong>{{ vehicleToDelete?.marca }} {{ vehicleToDelete?.modelo }}</strong>
        </p>
        <div class="confirm-actions">
          <button class="btn-secondary" @click="showDeleteConfirm = false">
            Cancelar
          </button>
          <button class="btn-danger" @click="handleDelete" :disabled="deleting">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Asegúrate de que estos imports existan en tu proyecto
import { useAuth } from '../composables/useAuth';
import { useVehicles } from '../composables/useVehicles';
// Asegúrate de que VehicleForm exista en tu proyecto
// import VehicleForm from './VehicleForm.vue'; 

declare const definePageMeta: any;
definePageMeta?.({ middleware: 'auth' });

const { user, logout } = useAuth();
const { fetchVehicles, deleteVehicle, getVehicleImages } = useVehicles();
const router = useRouter();

const vehicles = ref<any[]>([]);
const loading = ref(true);
const error = ref('');

const showModal = ref(false);
const selectedVehicle = ref(null);
const isEditMode = ref(false);

const showDeleteConfirm = ref(false);
const vehicleToDelete = ref<any>(null);
const deleting = ref(false);

const loadVehicles = async () => {
  loading.value = true;
  error.value = '';

  try {
    const data = await fetchVehicles();
    // intentar cargar la imagen de portada para cada vehículo
    const enriched = await Promise.all(
      data.map(async (v: any) => {
        try {
          const imgs = await getVehicleImages(v.id);
          const portada = imgs.find((i: any) => i.es_principal) || imgs[0];
          v.portada = portada ? (portada.url_imagen || portada.url || null) : null;
        } catch (e) {
          v.portada = null;
        }
        return v;
      })
    );
    vehicles.value = enriched;
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los vehículos';
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  selectedVehicle.value = null;
  isEditMode.value = false;
  showModal.value = true;
};

const openEditModal = (vehicle: any) => {
  selectedVehicle.value = vehicle;
  isEditMode.value = true;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedVehicle.value = null;
};

const confirmDelete = (vehicle: any) => {
  vehicleToDelete.value = vehicle;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (!vehicleToDelete.value) return;

  deleting.value = true;

  try {
    await deleteVehicle(vehicleToDelete.value.id);
    showDeleteConfirm.value = false;
    vehicleToDelete.value = null;
    await loadVehicles();
  } catch (err: any) {
    error.value = err.message || 'Error al eliminar el vehículo';
    showDeleteConfirm.value = false;
  } finally {
    deleting.value = false;
  }
};

const handleLogout = () => {
  logout();
  router.push('/login');
};

const formatNumber = (num: number) => {
  return num.toLocaleString('es-CL');
};

onMounted(() => {
  loadVehicles();
});
</script>

<style scoped>
.vehicles-page {
  min-height: 100vh;
  background: #f3f4f6;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.btn-logout {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #dc2626;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.toolbar {
  margin-bottom: 24px;
}

.btn-primary {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 16px;
}

.error-box {
  background: #fee2e2;
  color: #991b1b;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.btn-retry {
  margin-top: 12px;
  padding: 8px 16px;
  background: #991b1b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  color: #6b7280;
  font-size: 18px;
  margin-bottom: 24px;
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.vehicle-card {
  background: white;
  border-radius: 12px;
  /* Eliminamos padding-top/bottom para que la imagen llegue al borde superior */
  padding: 0 24px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.vehicle-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* ------------------------------------------- */
/* AJUSTE DE IMAGEN PARA EL CARD (AQUÍ ESTÁN LOS CAMBIOS) */
/* ------------------------------------------- */
.vehicle-media {
  /* Ocupa el 100% del ancho del card */
  width: calc(100% + 48px);
  /* Ancho del card + 24px de padding a cada lado */
  margin-left: -24px;
  /* Mueve el contenedor a la izquierda para cubrir el padding del card */

  /* Define una relación de aspecto de 16:9 */
  padding-top: 56.25%;
  /* 9 / 16 * 100% */

  position: relative;
  margin-bottom: 16px;
  overflow: hidden;
  border-top-left-radius: 12px;
  /* Coincide con el radio del card */
  border-top-right-radius: 12px;
  background: #e5e7eb;
  /* Fondo por defecto */
}

.vehicle-media img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* La clave: la imagen cubre completamente el espacio 16:9 */
  object-fit: cover;
}

.vehicle-media .placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7280;
}

/* ------------------------------------------- */
/* FIN DE AJUSTE DE IMAGEN PARA EL CARD */
/* ------------------------------------------- */

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  padding-top: 0;
  /* Asegura que no haya padding superior extra */
  border-bottom: 1px solid #e5e7eb;
}

.vehicle-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

/* ... (El resto de tus estilos permanecen igual) ... */

.vehicle-year {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
}

.vehicle-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  color: #6b7280;
  font-size: 14px;
}

.detail-value {
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;
}

.detail-description {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.detail-description .detail-label {
  display: block;
  margin-bottom: 6px;
}

.detail-description p {
  margin: 0;
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
}

.vehicle-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background: #2563eb;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
}

.confirm-dialog h3 {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.confirm-dialog p {
  margin: 0 0 16px;
  color: #6b7280;
  font-size: 15px;
}

.vehicle-info {
  color: #1a1a1a;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary,
.btn-danger {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .vehicles-grid {
    grid-template-columns: 1fr;
  }
}
</style>