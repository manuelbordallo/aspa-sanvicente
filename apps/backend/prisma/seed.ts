import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to preserve data)
  console.log('🗑️  Cleaning existing data...');
  await prisma.passwordResetToken.deleteMany();
  await prisma.userGroupMember.deleteMany();
  await prisma.userGroup.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.news.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await hashPassword('Admin123');
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@aspa-sanvicente.com',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create sample users
  console.log('👥 Creating sample users...');
  const userPassword = await hashPassword('User123');
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Juan',
        lastName: 'García',
        email: 'juan.garcia@example.com',
        password: userPassword,
        role: Role.USER,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@example.com',
        password: userPassword,
        role: Role.USER,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Carlos',
        lastName: 'Martínez',
        email: 'carlos.martinez@example.com',
        password: userPassword,
        role: Role.USER,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Ana',
        lastName: 'Rodríguez',
        email: 'ana.rodriguez@example.com',
        password: userPassword,
        role: Role.USER,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Pedro',
        lastName: 'Sánchez',
        email: 'pedro.sanchez@example.com',
        password: userPassword,
        role: Role.USER,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${users.length} sample users`);

  // Create user groups
  console.log('👨‍👩‍👧‍👦 Creating user groups...');
  await prisma.userGroup.create({
    data: {
      name: 'Profesores',
      members: {
        create: [
          { userId: users[0].id },
          { userId: users[1].id },
        ],
      },
    },
  });

  await prisma.userGroup.create({
    data: {
      name: 'Padres',
      members: {
        create: [
          { userId: users[2].id },
          { userId: users[3].id },
          { userId: users[4].id },
        ],
      },
    },
  });
  console.log(`✅ Created 2 user groups`);

  // Create sample news
  console.log('📰 Creating sample news...');
  const newsItems = await Promise.all([
    prisma.news.create({
      data: {
        title: 'Bienvenidos al nuevo curso escolar 2024-2025',
        summary: 'Damos la bienvenida a todos los estudiantes y familias al nuevo curso escolar.',
        content: `<p>Estimadas familias,</p>
        <p>Es un placer darles la bienvenida al curso escolar 2024-2025. Este año viene cargado de nuevos proyectos y actividades que esperamos sean del agrado de toda la comunidad educativa.</p>
        <p>Les recordamos que las clases comenzarán el próximo lunes 9 de septiembre a las 9:00 horas.</p>
        <p>Atentamente,<br>La Dirección</p>`,
        authorId: admin.id,
      },
    }),
    prisma.news.create({
      data: {
        title: 'Nuevas instalaciones deportivas',
        summary: 'El colegio estrena nuevas instalaciones deportivas para el disfrute de todos.',
        content: `<p>Nos complace anunciar que las nuevas instalaciones deportivas ya están disponibles para su uso.</p>
        <p>Incluyen una pista polideportiva cubierta, vestuarios renovados y una zona de fitness.</p>
        <p>Estas mejoras permitirán ampliar nuestra oferta de actividades extraescolares deportivas.</p>`,
        authorId: admin.id,
      },
    }),
    prisma.news.create({
      data: {
        title: 'Jornada de puertas abiertas',
        summary: 'Les invitamos a conocer nuestras instalaciones el próximo sábado.',
        content: `<p>El próximo sábado 15 de septiembre celebraremos nuestra jornada de puertas abiertas.</p>
        <p>Horario: 10:00 - 14:00 horas</p>
        <p>Podrán visitar las aulas, conocer al profesorado y resolver todas sus dudas sobre nuestro proyecto educativo.</p>
        <p>¡Les esperamos!</p>`,
        authorId: admin.id,
      },
    }),
  ]);
  console.log(`✅ Created ${newsItems.length} news items`);

  // Create sample calendar events
  console.log('📅 Creating sample calendar events...');
  const today = new Date();
  const events = await Promise.all([
    prisma.calendarEvent.create({
      data: {
        title: 'Inicio del curso escolar',
        description: 'Primer día de clases para todos los niveles educativos.',
        date: new Date(today.getFullYear(), 8, 9), // September 9
        authorId: admin.id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Reunión de padres - Educación Infantil',
        description: 'Reunión informativa para padres de alumnos de educación infantil.',
        date: new Date(today.getFullYear(), 8, 15), // September 15
        authorId: admin.id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Excursión al museo',
        description: 'Visita al Museo de Ciencias Naturales para alumnos de primaria.',
        date: new Date(today.getFullYear(), 9, 5), // October 5
        authorId: admin.id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Día de la Hispanidad - Festivo',
        description: 'El centro permanecerá cerrado por festividad nacional.',
        date: new Date(today.getFullYear(), 9, 12), // October 12
        authorId: admin.id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Evaluación primer trimestre',
        description: 'Finalización del primer trimestre y entrega de notas.',
        date: new Date(today.getFullYear(), 11, 20), // December 20
        authorId: admin.id,
      },
    }),
  ]);
  console.log(`✅ Created ${events.length} calendar events`);

  // Create sample notices
  console.log('📬 Creating sample notices...');
  const notices = [];
  
  // Notice to all users
  for (const user of users) {
    notices.push(
      prisma.notice.create({
        data: {
          content: 'Recordatorio: La reunión general de padres será el próximo viernes a las 18:00 horas en el salón de actos.',
          authorId: admin.id,
          recipientId: user.id,
          isRead: false,
        },
      })
    );
  }

  // Notice to specific user
  notices.push(
    prisma.notice.create({
      data: {
        content: 'Por favor, pase por secretaría para recoger la documentación pendiente.',
        authorId: admin.id,
        recipientId: users[0].id,
        isRead: false,
      },
    })
  );

  // Notice from user to admin (read)
  notices.push(
    prisma.notice.create({
      data: {
        content: 'Solicito una reunión para tratar el rendimiento académico de mi hijo.',
        authorId: users[2].id,
        recipientId: admin.id,
        isRead: true,
        readAt: new Date(),
      },
    })
  );

  await Promise.all(notices);
  console.log(`✅ Created ${notices.length} notices`);

  console.log('\n✨ Database seeding completed successfully!');
  console.log('\n📝 Summary:');
  console.log(`   - 1 admin user (email: admin@aspa-sanvicente.com, password: Admin123)`);
  console.log(`   - ${users.length} regular users (password: User123)`);
  console.log(`   - 2 user groups`);
  console.log(`   - ${newsItems.length} news items`);
  console.log(`   - ${events.length} calendar events`);
  console.log(`   - ${notices.length} notices`);
  console.log('\n🔐 Login credentials:');
  console.log('   Admin: admin@aspa-sanvicente.com / Admin123');
  console.log('   User:  juan.garcia@example.com / User123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
