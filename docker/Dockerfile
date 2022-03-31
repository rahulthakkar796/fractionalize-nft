FROM 0xpolygon/polygon-edge:0.3.2-arm64

COPY docker/entrypoint.sh entrypoint.sh

RUN apk --no-cache add curl
RUN chmod +x entrypoint.sh
ENTRYPOINT ["sh", "-c"]
