FROM node:lts

ARG PORT=8080

ENV PORT=${PORT}

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE ${PORT}

CMD [ "npm", "run", "start:prod" ]
