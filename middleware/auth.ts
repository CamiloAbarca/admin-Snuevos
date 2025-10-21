export default defineNuxtRouteMiddleware((to, from) => {
  const { token, initAuth } = useAuth();

  if (process.client) {
    initAuth();
  }

  if (!token.value) {
    return navigateTo('/login');
  }
});
