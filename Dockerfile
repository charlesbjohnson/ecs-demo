FROM node:6

WORKDIR /app

RUN npm install --global --silent yarn
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install

ADD . /app

CMD ["yarn", "start"]
