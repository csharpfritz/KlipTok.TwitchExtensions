FROM node:current-alpine3.12

LABEL org.opencontainers.image.source https://github.com/csharpfritz/KlipTok.TwitchExtensions

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
RUN mkdir -p services
COPY services/* services

EXPOSE 8080
CMD [ "node", "services/backend.js", "-p", "8080" ]
