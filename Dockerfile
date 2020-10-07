FROM node:10
ENV PORT=8080
ENV NODE_ENV="production"
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
RUN npm install pm2 -g
COPY index.js ./
COPY ./static ./static
EXPOSE 8066
CMD ["pm2-runtime", "index.js"]
