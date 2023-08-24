FROM node:14 
COPY . /app
WORKDIR /app 
COPY package*.json ./
RUN npm install 
COPY . .
USER root
RUN chown -R node:node /app
USER node 
EXPOSE 9080

CMD ["npm" , "start"]