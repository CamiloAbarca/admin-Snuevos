/// <reference types="vite/client" />
// Declaraciones globales para el proyecto (mejoran el soporte TS en el editor)
// Añade aquí nuevas declaraciones si agregas más helpers globales.

declare global {
	// Nuxt-like useState (simplificada)
	function useState<T = any>(key: string, fn?: () => T): { value: T };

	// Page/meta helper
	function definePageMeta(meta: any): void;

	// Router (simplificado)
	function useRouter(): any;

	// Composables usados en el proyecto (firma mínima)
	function useAuth(): {
		token: { value: string | null };
		user: { value: any };
		login: (correo: string, password: string) => Promise<any>;
		logout: () => void;
		initAuth: () => void;
	};

	function useVehicles(): {
		fetchVehicles: () => Promise<any>;
		createVehicle: (data: any) => Promise<any>;
		updateVehicle: (id: number, data: any) => Promise<any>;
		deleteVehicle: (id: number) => Promise<any>;
		uploadImage: (form: FormData) => Promise<any>;
		getVehicleImages: (automovilId: number) => Promise<any[]>;
		deleteImage: (imagenId: number) => Promise<any>;
	};

	// Declaración global directa de `process.client`
	declare const process: { client?: boolean; [key: string]: any };
}

export {};

// Declaraciones para imports de recursos estáticos (imagenes y vectores)
declare module '*.png' {
	const src: string;
	export default src;
}

declare module '*.jpg' {
	const src: string;
	export default src;
}

declare module '*.jpeg' {
	const src: string;
	export default src;
}

declare module '*.svg' {
	const src: string;
	export default src;
}
