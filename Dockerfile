FROM node:8.11.1-alpine
LABEL NAME="snazzy-contacts-adapter"
LABEL MAINTAINER Shterion Yanev "syanev@wice.de"
LABEL SUMMARY="This image is used to start the Snazzy Contacts Adapter for OIH"

RUN apk --no-cache add \
    python \
    make \
    g++ \
    libc6-compat

WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN npm install

COPY . /usr/src/app

RUN chown -R 1000:1000 /usr/src/app

USER node

# EXPOSE 3000
#
# CMD ["npm", "start"]
