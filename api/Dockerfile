FROM node:latest
WORKDIR /app

# RUN apt-get update -y && \
#     apt-get install -y libqt4-dev libqt4-xml libxcb-screensaver0 libavahi-compat-libdnssd1 libphonon4 libhunspell-dev libavahi-compat-libdnssd-dev apt-utils build-essential python make g++ avahi-daemon avahi-discover libnss-mdns

RUN apt-get update -y && \
    apt-get install -y libavahi-compat-libdnssd-dev

EXPOSE 8101
CMD npm rebuild mdns && \
    service dbus start && \
    avahi-daemon --no-rlimits -D && \
    yarn api:dev