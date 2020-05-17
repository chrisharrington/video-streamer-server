# FROM node:latest
# WORKDIR /app

# # RUN apt-get update -y && \
# #     apt-get install -y libqt4-dev libqt4-xml libxcb-screensaver0 libavahi-compat-libdnssd1 libphonon4 libhunspell-dev libavahi-compat-libdnssd-dev apt-utils build-essential python make g++ avahi-daemon avahi-discover libnss-mdns

# RUN apt-get update -y && \
#     apt-get install -y libavahi-compat-libdnssd-dev

# EXPOSE 8101
# CMD npm rebuild mdns && \
#     service dbus start && \
#     avahi-daemon --no-rlimits -D && \
#     yarn api:dev

FROM nvidia/cuda:latest
WORKDIR /app

ENV PATH=/usr/local/nvidia/bin:/usr/local/cuda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV CUDA_VERSION=10.2.89
ENV CUDA_PKG_VERSION 10-2=$CUDA_VERSION-1
ENV LD_LIBRARY_PATH=/usr/local/nvidia/lib:/usr/local/nvidia/lib64
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=video,compute,utility
ENV NVIDIA_REQUIRE_CUDA=cuda>=8.0

# Install dependencies
RUN apt-get update -y && \
    apt-get install git nodejs npm wget yasm pkgconf libzvbi-dev libmp3lame-dev libavahi-compat-libdnssd-dev -y && \
    npm install yarn -g

# Install nv-codec-headers
RUN git clone https://github.com/FFmpeg/nv-codec-headers.git && \
    cd nv-codec-headers && \
    make install && \
    cd ..

# Install FFMPEG
RUN git clone https://git.ffmpeg.org/ffmpeg.git && \
    cd ffmpeg && \
    ./configure --enable-libzvbi --enable-libmp3lame --enable-cuda --enable-cuvid --enable-nvenc --enable-nonfree --enable-libnpp --extra-cflags=-I/usr/local/cuda/include --extra-ldflags=-L/usr/local/cuda/lib64 && \
    make -j 4 && \
    make install && \
    cd ..

# Launcht the API.
CMD npm rebuild mdns && \
    service dbus start && \
    avahi-daemon --no-rlimits -D && \
    yarn api:dev