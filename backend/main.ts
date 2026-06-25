// NestJS-style bootstrap skeleton for marketplace backend.
// Replace with real NestFactory bootstrap when backend app is initialized.

export function bootstrapBackend() {
  return {
    appName: 'kupiprodadi-backend',
    modules: ['auth', 'users', 'ads', 'search'],
    database: {
      primary: 'PostgreSQL',
      cache: 'Redis',
      media: 'S3/Cloudinary',
    },
  };
}
