<template>
  <div>
    <v-container class="mx-auto d-flex align-center justify-start overflow-visible">
      <div class="text-h4 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
        黒点画像(Seestar)
      </div>
    </v-container>
    <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
      <v-row>
        <v-col v-for="index in [0, 1]" :key="index" cols="12" md="6">
          <v-skeleton-loader v-if="loading" type="image, article" />
          <v-card v-else class="sharp-card" outlined>
            <div v-if="!SunspotImages[index]" class="no-data-placeholder">
                <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                <div class="text-body-1 text-grey mt-2">データなし</div>
            </div>
            <v-img v-else :src="SunspotImages[index]" cover></v-img>
            <v-card-title class="flex-column align-start">
              <div class="text-h4 pa-3" style="font-weight: bold;" v-if="index === 0">
                最新の観測日: {{ latestSunInfo.date ?? 'データなし' }}
              </div>
              <div class="text-h4 pa-3" style="font-weight: bold;" v-if="index === 1">
                黒点面積: {{ latestSunInfo.total_area != null ? `${latestSunInfo.total_area} pixel` : 'データなし' }}
              </div>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import api from '@/lib/api';

export default {
  name: 'Sunspots',
  data() {
    return {
      loading: true,
      latestSunInfo: {},
      SunspotImages: [null, null],
      interval: -1,
    };
  },
  methods: {
    async fetchSunInfos() {
      const [res] = await Promise.allSettled([
          api.get("/manualReport/sunspot/info"),
      ]);
      if (res.status === 'fulfilled') {
        this.latestSunInfo = res.value.data;
        this.SunspotImages = [
          `${import.meta.env.VITE_API_BASE_URL}${res.value.data.image_url}`,
          `${import.meta.env.VITE_API_BASE_URL}${res.value.data.contour_image_url}`,
        ];
      } else {
        this.latestSunInfo = {};
        this.SunspotImages = [null, null];
      }
    },
  },
  mounted() {
    this.fetchSunInfos().then(() => { this.loading = false; });

    this.interval = setInterval(() => {
      this.fetchSunInfos();
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
