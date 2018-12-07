FROM node:8
WORKDIR /usr/src/client
COPY . .
RUN npm install
EXPOSE 8086
CMD ["npm", "start"]
