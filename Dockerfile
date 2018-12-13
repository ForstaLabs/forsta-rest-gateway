FROM node:8
WORKDIR /usr/src/client
COPY . .
RUN npm install
EXPOSE 8086
ENV LISTEN_ADDR="0.0.0.0"
CMD ["npm", "start"]
