<template>
  <div class="landing-container">
    <div class="landing-content">
        <div class="logo-wrap">
          <img v-if="logo" :src="logo" alt="Logo" class="logo" />
          <div v-else class="logo-fallback" aria-hidden="true">
            <!-- simple SVG fallback -->
            <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#fff" />
              <path d="M4 16c1.333-4 5.333-6 8-6s6.667 2 8 6" stroke="#667eea" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="9" r="2" fill="#667eea" />
            </svg>
          </div>
        </div>
      <h1>Gestión de Vehículos</h1>
      <p>Administra tu inventario de automóviles de forma sencilla y eficiente</p>

      <div class="btn-group">
        <NuxtLink to="/login" class="btn-primary">Iniciar Sesión</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import logoSrc from '~/assets/logosn.png';

const { user } = useAuth();
const router = useRouter();
const logo = logoSrc;

onMounted(() => {
  if (user.value) {
    router.push('/vehiculos');
  }
});
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #030915 0%, #565e6e 100%);
  padding: 20px;
}

.landing-content {
  text-align: center;
  color: white;
}

.logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.logo {
  width: 420px;
  height: 420px;
  object-fit: contain;
  display: block;
}

@media (max-width: 480px) {
  .logo {
    width: 96px;
    height: 96px;
  }
}

.logo-fallback svg {
  display: block;
}

h1 {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 20px;
}

p {
  font-size: 20px;
  margin: 0 0 40px;
  opacity: 0.95;
}

.btn-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
</style>
