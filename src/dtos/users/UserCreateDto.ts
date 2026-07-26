import { IsEmail, MinLength, IsIn } from 'class-validator';

export class UserCreateDto 
{
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  username!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email!: string;

  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsIn(['artist' , 'manager' , 'admin'], { message: 'El rol debe ser "admin", "artist" o "manager"' })
  role!: 'artist' | 'manager' | 'admin';
}
