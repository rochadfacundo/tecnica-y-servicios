export interface RegisterUserDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponseDTO {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
  token?: string; // si usás JWT
}
