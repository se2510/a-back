export class UserResponseDto 
{
  /**
   * ID único del usuario
   * @example 1
   */
  id!: number;

  /**
   * Nombre de usuario
   * @example 'johndoe'
   */
  username!: string;

  /**
   * Correo electrónico del usuario
   * @example 'usuario@ejemplo.com'
   */
  email!: string;

  /**
   * Rol del usuario (admin o creator)
   * @example 'creator'
   */
  role!: 'admin' | 'creator';

  /**
   * Fecha de creación del usuario
   * @example '2023-01-01T00:00:00.000Z'
   */
  createdAt?: Date;

  /**
   * Fecha de última actualización del usuario
   * @example '2023-01-01T00:00:00.000Z'
   */
  updatedAt?: Date;
}
