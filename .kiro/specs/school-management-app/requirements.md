# Documento de Requisitos - Aplicación de Gestión Escolar

## Introducción

Esta aplicación web moderna proporcionará una plataforma integral para la gestión de comunicaciones escolares, incluyendo noticias, avisos, eventos de calendario y administración de usuarios. La aplicación utilizará tecnologías modernas como Catalyst y Tailwind CSS para ofrecer una interfaz de usuario eficiente y segura.

## Glosario

- **Sistema**: La aplicación web de gestión escolar
- **Usuario_Básico**: Usuario con permisos limitados de visualización y creación de avisos
- **Administrador**: Usuario con permisos completos de gestión del sistema
- **Aviso**: Mensaje dirigido a usuarios específicos o grupos que puede marcarse como visto
- **Noticia**: Artículo informativo visible para todos los usuarios
- **Evento**: Entrada de calendario con información detallada
- **Curso_Actual**: Período académico activo (ej: 2025-2026)
- **Vista**: Pantalla o sección específica de la aplicación
- **Tema_Visual**: Configuración de apariencia (claro, oscuro, sistema)

## Requisitos

### Requisito 1

**Historia de Usuario:** Como usuario del sistema, quiero acceder a una aplicación web segura, para que pueda gestionar comunicaciones escolares de manera eficiente.

#### Criterios de Aceptación

1. EL Sistema DEBERÁ autenticar usuarios mediante credenciales válidas
2. EL Sistema DEBERÁ distinguir entre Usuario_Básico y Administrador
3. EL Sistema DEBERÁ mantener sesiones seguras durante el uso
4. EL Sistema DEBERÁ permitir logout seguro a cualquier usuario autenticado
5. EL Sistema DEBERÁ denegar acceso a funciones no autorizadas según el tipo de usuario

### Requisito 2

**Historia de Usuario:** Como usuario autenticado, quiero navegar entre diferentes vistas de la aplicación, para que pueda acceder a todas las funcionalidades disponibles.

#### Criterios de Aceptación

1. EL Sistema DEBERÁ mostrar una barra de navegación con iconos para cambiar entre vistas
2. EL Sistema DEBERÁ mostrar la vista inicial por defecto al acceder
3. EL Sistema DEBERÁ separar visualmente los accesos a configuración y usuario del resto de vistas
4. EL Sistema DEBERÁ proporcionar seis vistas principales: noticias, avisos, calendario, configuración, usuario y listado de usuarios
5. CUANDO un usuario seleccione una vista, EL Sistema DEBERÁ cargar el contenido correspondiente

### Requisito 3

**Historia de Usuario:** Como usuario autenticado, quiero visualizar noticias en un listado, para que pueda mantenerme informado sobre eventos escolares.

#### Criterios de Aceptación

1. EL Sistema DEBERÁ mostrar todas las noticias creadas en formato de listado
2. EL Sistema DEBERÁ mostrar título, fecha de creación y autor para cada noticia
3. EL Sistema DEBERÁ mostrar un resumen del contenido de cada noticia
4. DONDE el usuario sea Administrador, EL Sistema DEBERÁ permitir crear nuevas noticias
5. EL Sistema DEBERÁ almacenar título, texto completo, fecha de creación y autor para cada noticia

### Requisito 4

**Historia de Usuario:** Como usuario autenticado, quiero gestionar avisos personalizados, para que pueda comunicarme efectivamente con otros usuarios.

#### Criterios de Aceptación

1. EL Sistema DEBERÁ mostrar avisos asignados al usuario logueado y no marcados como vistos
2. EL Sistema DEBERÁ permitir a cualquier usuario autenticado crear avisos
3. EL Sistema DEBERÁ permitir dirigir avisos a usuarios específicos o grupos de usuarios
4. EL Sistema DEBERÁ permitir marcar avisos como vistos manualmente
5. EL Sistema DEBERÁ almacenar texto, fecha de creación, autor y destinatario para cada aviso

### Requisito 5

**Historia de Usuario:** Como usuario autenticado, quiero visualizar y gestionar eventos en un calendario, para que pueda planificar actividades escolares.

#### Criterios de Aceptación

1. EL Sistema DEBERÁ mostrar un calendario con todos los eventos creados
2. CUANDO un usuario pulse un evento, EL Sistema DEBERÁ mostrar título, texto, fecha y autor del evento
3. DONDE el usuario sea Administrador, EL Sistema DEBERÁ permitir crear nuevos eventos
4. EL Sistema DEBERÁ mostrar eventos en las fechas correspondientes del calendario
5. EL Sistema DEBERÁ almacenar título, texto, fecha y autor para cada evento

### Requisito 6

**Historia de Usuario:** Como usuario autenticado, quiero configurar la aplicación según mis preferencias, para que pueda personalizar mi experiencia de uso.

#### Criterios de Aceptación

1. EL Sistema DEBERÁ permitir modificar el Tema_Visual entre claro, oscuro o ajustado al sistema
2. EL Sistema DEBERÁ permitir cambiar el idioma de la interfaz
3. EL Sistema DEBERÁ mostrar el Curso_Actual configurado
4. DONDE el usuario sea Administrador, EL Sistema DEBERÁ permitir modificar el Curso_Actual
5. EL Sistema DEBERÁ persistir las configuraciones del usuario entre sesiones

### Requisito 7

**Historia de Usuario:** Como usuario autenticado, quiero gestionar mi información personal, para que pueda mantener mis datos actualizados.

#### Criterios de Aceptación

1. EL Sistema DEBERÁ mostrar la información del usuario logueado
2. EL Sistema DEBERÁ permitir modificar nombre, apellidos y correo electrónico
3. EL Sistema DEBERÁ permitir cambiar la contraseña del usuario
4. EL Sistema DEBERÁ validar que el correo electrónico tenga formato válido
5. EL Sistema DEBERÁ almacenar nombre, apellidos y correo electrónico para cada usuario

### Requisito 8

**Historia de Usuario:** Como administrador, quiero gestionar todos los usuarios del sistema, para que pueda mantener control sobre el acceso y la información.

#### Criterios de Aceptación

1. DONDE el usuario sea Administrador, EL Sistema DEBERÁ mostrar listado de todos los usuarios
2. DONDE el usuario sea Administrador, EL Sistema DEBERÁ permitir modificar datos de cualquier usuario
3. DONDE el usuario sea Usuario_Básico, EL Sistema DEBERÁ denegar acceso al listado de usuarios
4. EL Sistema DEBERÁ mostrar nombre, apellidos y correo electrónico en el listado
5. EL Sistema DEBERÁ permitir al Administrador cambiar el tipo de usuario

### Requisito 9

**Historia de Usuario:** Como usuario del sistema, quiero una interfaz moderna y responsive, para que pueda usar la aplicación en diferentes dispositivos.

#### Criterios de Aceptación

1. EL Sistema DEBERÁ utilizar Catalyst para la arquitectura de la interfaz
2. EL Sistema DEBERÁ utilizar Tailwind CSS para el diseño visual
3. EL Sistema DEBERÁ ser responsive y funcionar en dispositivos móviles y escritorio
4. EL Sistema DEBERÁ cargar de manera eficiente en navegadores modernos
5. EL Sistema DEBERÁ mantener consistencia visual en todas las vistas
