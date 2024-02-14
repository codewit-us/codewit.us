FROM node:lts-alpine as builder
WORKDIR /codewit
COPY . .
RUN npm install && npm i -g nx
RUN nx build api

FROM node:lts-alpine as runner
WORKDIR /codewit
COPY --from=builder ./codewit/dist/api .
COPY package* ./
RUN npm install --production
EXPOSE 3000
CMD node main.js