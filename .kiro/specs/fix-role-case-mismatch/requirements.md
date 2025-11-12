# Requirements Document

## Introduction

Este documento define los requisitos para solucionar el error "Acceso Denegado" que ocurre después del login. El problema se debe a una inconsistencia en el formato de los roles de usuario entre el backend (que usa mayúsculas: `USER`, `ADMIN`) y el frontend (que espera minúsculas: `user`, `admin`). Esta inconsistencia causa que el sistema de autorización falle al verificar los permisos del usuario.

## Glossary

- **Backend**: El servidor API construido con Node.js/Express que maneja la autenticación y autorización
- **Frontend**: La aplicación web construida con Lit que consume la API del backend
- **Role**: El nivel de permisos asignado a un usuario (USER o ADMIN en backend, user o admin en frontend)
- **AuthService**: Servicio del backend responsable de la autenticación y generación de tokens JWT
- **RouteGuard**: Clase del frontend que verifica permisos de acceso a rutas
- **JWT**: JSON Web Token usado para autenticación

## Requirements

### Requirement 1

**User Story:** Como usuario del sistema, quiero poder acceder a las vistas después de hacer login, para poder usar la aplicación correctamente.

#### Acceptance Criteria

1. WHEN THE Backend genera un token JWT después del login, THE Backend SHALL normalizar el rol del usuario a minúsculas antes de incluirlo en el payload del token
2. WHEN THE Backend retorna información del usuario en cualquier endpoint, THE Backend SHALL normalizar el rol del usuario a minúsculas en la respuesta
3. WHEN THE Frontend recibe datos de usuario del backend, THE Frontend SHALL poder verificar correctamente los roles del usuario
4. WHEN un usuario con rol USER hace login, THE Frontend SHALL permitir el acceso a todas las rutas permitidas para usuarios normales
5. WHEN un usuario con rol ADMIN hace login, THE Frontend SHALL permitir el acceso a todas las rutas del sistema

### Requirement 2

**User Story:** Como desarrollador, quiero que el sistema maneje roles de forma consistente, para evitar errores de autorización en el futuro.

#### Acceptance Criteria

1. THE Backend SHALL definir un tipo TypeScript para los roles que use minúsculas
2. THE Backend SHALL crear una función utilitaria para normalizar roles de Prisma a minúsculas
3. WHEN THE Backend accede a datos de usuario desde Prisma, THE Backend SHALL aplicar la normalización de roles antes de retornar los datos
4. THE Backend SHALL mantener los roles en mayúsculas en la base de datos según el schema de Prisma
5. THE Frontend SHALL continuar usando roles en minúsculas sin cambios

### Requirement 3

**User Story:** Como usuario, quiero que el mensaje de error sea claro cuando no tengo permisos, para entender por qué no puedo acceder a una sección.

#### Acceptance Criteria

1. WHEN un usuario intenta acceder a una ruta sin permisos, THE Frontend SHALL mostrar un mensaje de error descriptivo
2. THE Frontend SHALL incluir en el mensaje de error los roles requeridos para acceder a la ruta
3. WHEN ocurre un error de autorización, THE Frontend SHALL redirigir al usuario a una vista apropiada
4. THE Frontend SHALL registrar en consola información de depuración sobre el estado de autenticación
5. WHEN un usuario no está autenticado, THE Frontend SHALL redirigir al login sin mostrar mensajes de error de permisos
