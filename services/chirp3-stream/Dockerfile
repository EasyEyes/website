FROM node:24.22.1-slim
WORKDIR /app/services/chirp3-stream
COPY services/chirp3-stream/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY services/chirp3-stream/*.mjs ./
COPY netlify/functions/shared/chirp3Ticket.ts /app/netlify/functions/shared/chirp3Ticket.ts
COPY netlify/functions/shared/cors.ts /app/netlify/functions/shared/cors.ts
USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "start.mjs"]
