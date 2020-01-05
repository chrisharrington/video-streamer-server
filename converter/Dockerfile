FROM jlesage/handbrake:latest
WORKDIR /app
RUN apk add --update nodejs nodejs-npm
RUN npm install yarn -g
CMD yarn converter-dev