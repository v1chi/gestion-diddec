# Utilizar la imagen base de Node.js
FROM node:18-alpine

# Crear y establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos necesarios para instalar las dependencias
COPY package*.json ./

# Instalar las dependencias del frontend
RUN npm install

# Construir la aplicación
COPY . .
RUN npm run build

# Exponer el puerto 3000
EXPOSE 3000

CMD [ "npm", "run", "start" ]