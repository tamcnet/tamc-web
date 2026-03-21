<template>
  <div>
    <v-container class="mx-auto d-flex align-center justify-start overflow-visible">
      <div class="text-h5 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
        全天カメラライブ（HQカメラ）
      </div>
    </v-container>
    <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
      <v-row class="d-flex" style="width: 100%;">
        <v-col cols="12" md="6">
          <v-skeleton-loader v-if="loading" type="image, article" />
          <v-card v-else class="sharp-card" outlined>
            <div v-if="!HQlatestImage" class="no-data-placeholder">
                <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                <div class="text-body-1 text-grey mt-2">データなし</div>
            </div>
            <v-img v-else :width="740" :src="HQlatestImage" cover></v-img>
            <v-card-title class="flex-column align-start">
              <div class="text-h4 mb-2">{{ HQlatestTime }}</div>
            </v-card-title>
            <v-divider class="mx-4"></v-divider>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-skeleton-loader v-if="loading" type="image, article" />
          <v-card v-else class="sharp-card" outlined>
            <div v-if="!HosizoralatestImage" class="no-data-placeholder">
                <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                <div class="text-body-1 text-grey mt-2">データなし</div>
            </div>
            <v-img v-else :width="555" :src="HosizoralatestImage" cover></v-img>
            <v-card-title class="flex-column align-start">
              <div class="text-h4 mb-2">今夜の星空</div>
              <div class="text-h6 font-weight-regular text-grey">{{ HosizoraTime }}</div>
            </v-card-title>
            <v-divider class="mx-4"></v-divider>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import api from '@/lib/api';

export default {
  name: 'NightSky',
  data() {
    return {
      loading: true,
      HQlatestImage: null,
      HQlatestTime: '',
      HosizoralatestImage: null,
      HosizoraTime: '',
      interval: -1,
    };
  },
  methods: {
    async fetchHQLatestImages() {
      const [hq, hosizora] = await Promise.allSettled([
          api.get("/HQ_latest_img", { responseType: 'blob' }),
          api.get("/Hosizora_img", { responseType: 'blob' }),
      ]);
      this.HQlatestImage = hq.status === 'fulfilled' ? URL.createObjectURL(hq.value.data) : null;
      this.HosizoralatestImage = hosizora.status === 'fulfilled' ? URL.createObjectURL(hosizora.value.data) : null;
    },
    async fetchHQInfo() {
      const [hq, hosizora] = await Promise.allSettled([
          api.get("/HQ_info"),
          api.get("/Hosizora_info"),
      ]);
      this.HQlatestTime = hq.status === 'fulfilled' ? hq.value.data : '';
      this.HosizoraTime = hosizora.status === 'fulfilled' ? hosizora.value.data : '';
    },
  },
  mounted() {
    Promise.all([
        this.fetchHQLatestImages(),
        this.fetchHQInfo(),
    ]).then(() => { this.loading = false; });

    this.interval = setInterval(() => {
      this.fetchHQLatestImages();
      this.fetchHQInfo();
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
  border: 1px solid #000 !important;
}

.no-data-placeholder {
    aspect-ratio: 4/3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}
</style>
