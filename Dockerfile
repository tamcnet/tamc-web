FROM node:lts-alpine

ENV LANG=C.UTF-8
ENV TZ=Asia/Tokyo

WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH

CMD ["sh", "-c", "yarn install && yarn dev --host 0.0.0.0"]
