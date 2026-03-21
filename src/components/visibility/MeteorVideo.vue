<template>
  <v-container class="mx-auto d-flex align-center justify-start overflow-visible">
    <div class="text-h4 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
      流星ビデオ観測ライブ（昼間は観測停止）
    </div>
  </v-container>
  <v-row class="cross-layout">
    <v-col>
      <v-col cols="12" md="4" class="cross-item center">
        <div class="iframe-wrapper">
          <iframe
            :src="'https://www.youtube.com/embed/oDbjlIRcCJE?autoplay=1'"
            frameborder="0"
            scrolling="no"
            allowfullscreen
            class="camera-frame"
          ></iframe>
        </div>
      </v-col>
    </v-col>
  </v-row>
  <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
    <div class="text-h4 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
      最新の検出流星
    </div>
  </v-container>
  <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
    <v-row>
      <v-col v-for="index in [0, 1, 2]" :key="index" cols="12" md="4">
        <v-skeleton-loader v-if="loading" type="image, article" />
        <v-card v-else class="sharp-card" outlined>
          <div v-if="!MeteorlatestImages[index]" class="no-data-placeholder">
              <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
              <div class="text-body-1 text-grey mt-2">データなし</div>
          </div>
          <v-img v-else :src="MeteorlatestImages[index]" cover :aspect-ratio="16/9"></v-img>
          <v-card-title class="flex-column align-start">
            <div class="text-h5 mb-2">{{ formatMeteorLog(meteor_logs[index]) || 'データなし' }}</div>
          </v-card-title>
          <v-divider class="mx-4"></v-divider>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/lib/api';

export default {
  name: 'MeteorVideo',
  data() {
    return {
      loading: true,
      MeteorlatestImages: [null, null, null],
      meteor_logs: [null, null, null],
      interval: -1,
      directionMap: {
        'Zenith': '天頂',
        'North': '北',
        'East': '東',
        'South': '南',
        'West': '西'
      }
    };
  },
  methods: {
    async fetchMeteorLatestImages() {
      const base = import.meta.env.VITE_API_BASE_URL;
      this.MeteorlatestImages = [
        `${base}/Meteor_latest_video`,
        `${base}/Meteor_latest2_video`,
        `${base}/Meteor_latest3_video`,
      ];
    },
    async fetchMeteorinfo() {
      const [res] = await Promise.allSettled([
          api.get("/Meteor_info"),
      ]);
      this.meteor_logs = res.status === 'fulfilled' ? res.value.data : [null, null, null];
    },
    formatMeteorLog(log) {
      if (!log) return '';
      const parts = log.split(' :');
      if (parts.length < 2) return log;
      const time = parts[0].trim();
      const direction = parts[1].trim();
      const japaneseDirection = this.directionMap[direction] || direction;
      return `${time} : ${japaneseDirection}`;
    }
  },
  mounted() {
    Promise.all([
        this.fetchMeteorLatestImages(),
        this.fetchMeteorinfo(),
    ]).then(() => { this.loading = false; });

    this.interval = setInterval(() => {
      this.fetchMeteorLatestImages();
      this.fetchMeteorinfo();
    }, 600000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>

<style scoped>
.sharp-card {
  border-radius: 0 !important;
  background-color: white;
  border: 1px solid #212121;
}

.cross-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 70vh;
  overflow: visible;
}

.cross-item {
  position: absolute;
  width: 80vw;
  max-width: 1200px;
  aspect-ratio: 16 / 9;
}

.cross-item.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.iframe-wrapper {
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
}

.camera-frame {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
}

.no-data-placeholder {
    aspect-ratio: 16/9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}
</style>
