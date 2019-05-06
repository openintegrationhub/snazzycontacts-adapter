FROM node:8.11.1-alpine
LABEL NAME="snazzy-contacts-adapter"
LABEL MAINTAINER Shterion Yanev "syanev@wice.de"
LABEL SUMMARY="This image is used to start the Snazzy Contacts Adapter for OIH"

RUN apk --no-cache add \
    python \
    make \
    g++ \
    libc6-compat

CMD ["/bin/sh"]
ENV NODE_VERSION=10.2.0

# RUN /bin/sh -c addgroup --gid 1000 node && adduser -u 1000 -G node -s /bin/sh -D node && apk add --no-cache libstdc++ && apk add --no-cache --virtual .build-deps binutils-gold curl g++ gcc gnupg libgcc linux-headers make python && for key in 94AE36675C464D64BAFA68DD7434390BDBE9B9C5 FD3A5288F042B6850C66B31F09FE44734EB7990E 71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 DD8F2338BAE7501E3DD5AC78C273792F7D83545D C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 B9AE9905FFD7803F25714661B63B535A4C206CA9 56730D5401028683275BD23C23EFEFE93C4CFFFE 77984A986EBC2AA786BC0F66B01FBB92821C587A; do gpg --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || gpg --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || gpg --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key"; done && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.xz" && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc && grep "node-v$NODE_VERSION.tar.xz\$" SHASUMS256.txt | sha256sum -c - && tar -xf "node-v$NODE_VERSION.tar.xz" && cd "node-v$NODE_VERSION" && ./configure && make -j$(getconf _NPROCESSORS_ONLN) && make install && apk del .build-deps && cd .. && rm -Rf "node-v$NODE_VERSION" && rm "node-v$NODE_VERSION.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt

RUN apk add --no-cache libstdc++ && apk add --no-cache --virtual .build-deps binutils-gold curl g++ gcc gnupg libgcc linux-headers make python && for key in 94AE36675C464D64BAFA68DD7434390BDBE9B9C5 FD3A5288F042B6850C66B31F09FE44734EB7990E 71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 DD8F2338BAE7501E3DD5AC78C273792F7D83545D C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 B9AE9905FFD7803F25714661B63B535A4C206CA9 56730D5401028683275BD23C23EFEFE93C4CFFFE 77984A986EBC2AA786BC0F66B01FBB92821C587A; do gpg --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || gpg --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || gpg --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key"; done && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.xz" && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc && grep "node-v$NODE_VERSION.tar.xz\$" SHASUMS256.txt | sha256sum -c - && tar -xf "node-v$NODE_VERSION.tar.xz" && cd "node-v$NODE_VERSION" && ./configure && make -j$(getconf _NPROCESSORS_ONLN) && make install && apk del .build-deps && cd .. && rm -Rf "node-v$NODE_VERSION" && rm "node-v$NODE_VERSION.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt

# ENV YARN_VERSION=1.7.0
CMD ["node"]

RUN apk update && apk add bash && apk add libstdc++

WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN npm install

COPY . /usr/src/app

# RUN chown -R node:node .

# USER node
# USER root
#
# RUN  pwd
#
# RUN ls -lah
#
# RUN ls -lah /usr/local/bin/

ENTRYPOINT ["node" "./node_modules/elasticio-sailor-nodejs/run.js"]
# ENTRYPOINT ["/usr/local/bin/node" "./node_modules/elasticio-sailor-nodejs/run.js"]

# CMD ["node" "./node_modules/elasticio-sailor-nodejs/run.js"]
