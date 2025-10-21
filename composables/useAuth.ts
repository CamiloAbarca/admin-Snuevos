declare function useState<T = any>(key: string, fn?: () => T): { value: T };

export const useAuth = () => {
  const API_BASE = 'https://snuevos.cl/api';
  const token = useState<string | null>('auth_token', () => null);
  const user = useState<any>('auth_user', () => null);

  const login = async (correo: string, password: string) => {
    const response = await fetch(`${API_BASE}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el inicio de sesión');
    }

    const data = await response.json();
    token.value = data.token;
    user.value = data.usuario;

    if (process.client) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.usuario));
    }

    return data;
  };

  const logout = () => {
    token.value = null;
    user.value = null;

    if (process.client) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  const initAuth = () => {
    if (process.client) {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      // Evitar valores 'undefined' guardados por accidente y manejar JSON corrupto
      if (savedToken && savedToken !== 'undefined') {
        token.value = savedToken;
      } else {
        token.value = null;
      }

      if (savedUser && savedUser !== 'undefined') {
        try {
          user.value = JSON.parse(savedUser);
        } catch (e) {
          // Si no se puede parsear, limpiar localStorage y resetear estado
          user.value = null;
          token.value = null;
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          console.error("Error al parsear el usuario guardado:", e);
        }
      } else {
        user.value = null;
      }
    }
  };

  return {
    token,
    user,
    login,
    logout,
    initAuth,
  };
};
