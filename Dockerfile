FROM node:0.12.7

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install --production
COPY . /usr/src/app
EXPOSE 5000
CMD [ "npm", "run", "start:prod" ]

