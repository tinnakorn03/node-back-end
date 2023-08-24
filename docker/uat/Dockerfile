FROM node:14 
COPY . /app
WORKDIR /app 
COPY package*.json ./
RUN npm install 
COPY . .
USER node 
EXPOSE 9081

CMD ["npm", "run", "start:uat"]