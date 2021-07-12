FROM node:15
WORKDIR /app
COPY package.json .
RUN npm install

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

COPY . ./
ENV PORT 3000
EXPOSE ${PORT}
CMD ["node", "index.js"]


# no rule against creating multiple dockerfiles or docker-compose, e.g. test, dev, prod
# on the RUN command do --only=production so that nodemon does not get installed in production mode
    # doesn't install devdependencies

# fi ends the if statement