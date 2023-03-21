FROM node:19.8.1 AS development

RUN apt-get update
RUN mkdir -p /app

COPY ./entrypoint.bash .

RUN chmod 777 ./entrypoint.bash

ENTRYPOINT [ "./entrypoint.bash" ]