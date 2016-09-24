FROM node:6

ADD . /app
WORKDIR /app

EXPOSE 8000
RUN npm install --silent
CMD ["node", "."]
