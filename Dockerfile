FROM debian:buster-slim

WORKDIR /tmp

RUN apt update && apt install curl unzip -y

RUN curl -fsSL https://deno.land/x/install/install.sh | sh

ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

WORKDIR /app

COPY . .

RUN deno cache --unstable main.ts

ENTRYPOINT deno run --allow-net --allow-write --allow-read --allow-env --allow-plugin --unstable main.ts