export enum UserRole {
  ARTIST = 'artist',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export const USER_STATE_ACTIVE = 'active';
export const USER_STATE_INACTIVE = 'inactive';
export const GLOBAL_CONFIG_ID = 1;
export const USER_NOT_FOUND_ERROR = 'User not found';
export const ASSET_NOT_FOUND_ERROR = 'Asset not found';
export const USER_STATE_PENDING = 'pending';
export const ASSET_STATUS_PENDING = 'pending';
export const ASSET_STATUS_APPROVED = 'approved';
export const ASSET_STATUS_REJECTED = 'rejected';
export const HTTP_BAD_REQUEST = 400;
export const ERROR_ROLE_INVALID = 'Rol inválido. Debe ser uno de: artist, manager, admin';
export const ERROR_USERNAME_EXISTS = 'Username already exists';
export const USER_ROLE_ARTIST = UserRole.ARTIST;
export const USER_ROLE_MANAGER = UserRole.MANAGER;
export const USER_ROLE_ADMIN = UserRole.ADMIN;
