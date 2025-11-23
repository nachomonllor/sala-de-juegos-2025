export const environment = {

    production: false,
    // Supabase Cloud (entorno por defecto)
    supabaseUrl: 'https://tuwlrspqlkpqatnaintx.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1d2xyc3BxbGtwcWF0bmFpbnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDcyOTEsImV4cCI6MjA3MTMyMzI5MX0.O5eawMd27SKifzyOvKp5fJZcvgBodxXA5LZWZdexRSA',
    // Si necesitás volver a la instancia local, reemplazá estas variables por las de localhost.
     accesoRapidoHabilitado: true,
    demoUsers: [
        { etiqueta: 'Nacho', correo: 'nachomonllor@hotmail.com', contrasenia: '123456' },
        { etiqueta: 'Hector', correo: 'hector@hotmail.com', contrasenia: '123456' },
    ],
    dbzBaseUrl: 'https://dragonball-api.com'

};


