FROM node:7

WORKDIR /app

RUN npm install --global --silent yarn

ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock

RUN yarn install

ADD . /app

CMD ["yarn", "start"]
