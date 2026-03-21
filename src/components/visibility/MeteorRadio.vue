<template>
  <div>
    <v-container class="mx-auto d-flex align-center justify-start overflow-visible">
      <div class="text-h4 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
        流星電波観測ライブ
      </div>
    </v-container>
    <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
      <v-row>
        <v-col v-for="index in [0, 1]" :key="index" cols="12" md="6">
          <v-skeleton-loader v-if="loading" type="image, article" />
          <v-card v-else class="sharp-card" outlined>
            <div v-if="!LiveImages[index]" class="no-data-placeholder-wide">
                <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                <div class="text-body-1 text-grey mt-2">データなし</div>
            </div>
            <v-img v-else :src="LiveImages[index]" cover :aspect-ratio="16/9"></v-img>
            <v-card-title class="flex-column align-start">
              <div class="text-h4 mb-2">{{ ['豊川HRO', '大津HRO'][index] }}</div>
              <div class="text-h6 font-weight-regular text-grey" v-if="index === 0">{{ ToyokawalatestTime }}</div>
              <div class="text-h6 font-weight-regular text-grey" v-if="index === 1">{{ OtsulatestTime }}</div>
            </v-card-title>
            <v-divider class="mx-4"></v-divider>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
      <div class="text-h4 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
        最新の検出流星
      </div>
    </v-container>
    <v-card :class="{ 'parent-card': true, 'sidebar-open': isSidebarOpen }">
      <v-row>
        <v-col v-for="index in [0, 1, 2]" :key="`toyo-${index}`" cols="12" md="4">
          <v-skeleton-loader v-if="loading" type="image, article" />
          <v-card v-else class="sharp-card" outlined>
            <div v-if="!ToyokawalatestMeteorImages[index]" class="no-data-placeholder-wide">
                <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                <div class="text-body-1 text-grey mt-2">データなし</div>
            </div>
            <v-img v-else :src="ToyokawalatestMeteorImages[index]" cover :aspect-ratio="16/9"></v-img>
            <v-card-title class="flex-column align-start">
              <div class="text-h4 mb-2">豊川HRO</div>
              <div class="text-h6 font-weight-regular text-grey">{{ Toyokawa_meteor_logs[index] ?? 'データなし' }}</div>
            </v-card-title>
            <v-divider class="mx-4"></v-divider>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="index in [0, 1, 2]" :key="`otsu-${index}`" cols="12" md="4">
          <v-skeleton-loader v-if="loading" type="image, article" />
          <v-card v-else class="sharp-card" outlined>
            <div v-if="!OtsulatestMeteorImages[index]" class="no-data-placeholder-wide">
                <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                <div class="text-body-1 text-grey mt-2">データなし</div>
            </div>
            <v-img v-else :src="OtsulatestMeteorImages[index]" cover :aspect-ratio="16/9"></v-img>
            <v-card-title class="flex-column align-start">
              <div class="text-h4 mb-2">大津HRO</div>
              <div class="text-h6 font-weight-regular text-grey">{{ Otsu_meteor_logs[index] ?? 'データなし' }}</div>
            </v-card-title>
            <v-divider class="mx-4"></v-divider>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import api from '@/lib/api';

export default {
  name: 'MeteorRadio',
  data() {
    return {
      loading: true,
      ToyokawalatestTime: '',
      OtsulatestTime: '',
      LiveImages: [null, null],
      ToyokawalatestMeteorImages: [null, null, null],
      OtsulatestMeteorImages: [null, null, null],
      Toyokawa_meteor_logs: [null, null, null],
      Otsu_meteor_logs: [null, null, null],
      interval: -1,
    };
  },
  computed: {
    isSidebarOpen() {
      return this.$vuetify && this.$vuetify.sidebar && this.$vuetify.sidebar.model;
    },
  },
  methods: {
    async fetchMeteorLatestImages() {
      const base = import.meta.env.VITE_API_BASE_URL;
      this.LiveImages = [
        `${base}/Toyokawa_latest_img`,
        `${base}/Otsu_latest_img`,
      ];
      this.ToyokawalatestMeteorImages = [
        `${base}/Toyokawa_latest_meteor_img`,
        `${base}/Toyokawa_latest2_meteor_img`,
        `${base}/Toyokawa_latest3_meteor_img`,
      ];
      this.OtsulatestMeteorImages = [
        `${base}/Otsu_latest_meteor_img`,
        `${base}/Otsu_latest2_meteor_img`,
        `${base}/Otsu_latest3_meteor_img`,
      ];
    },
    async fetchMeteorInfo() {
      const [toyokawa, otsu, meteorToyokawa, meteorOtsu] = await Promise.allSettled([
          api.get("/Toyokawa_info"),
          api.get("/Otsu_info"),
          api.get("/Toyokawa_meteor_info"),
          api.get("/Otsu_meteor_info"),
      ]);
      this.ToyokawalatestTime = toyokawa.status === 'fulfilled' ? toyokawa.value.data : '';
      this.OtsulatestTime = otsu.status === 'fulfilled' ? otsu.value.data : '';
      this.Toyokawa_meteor_logs = meteorToyokawa.status === 'fulfilled' ? meteorToyokawa.value.data : [null, null, null];
      this.Otsu_meteor_logs = meteorOtsu.status === 'fulfilled' ? meteorOtsu.value.data : [null, null, null];
    },
  },
  mounted() {
    Promise.all([
        this.fetchMeteorLatestImages(),
        this.fetchMeteorInfo(),
    ]).then(() => { this.loading = false; });

    this.interval = setInterval(() => {
      this.fetchMeteorLatestImages();
      this.fetchMeteorInfo();
    }, 600000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>

<style scoped>
.parent-card {
  margin: 2%;
  padding: 2%;
  padding-top: 0px;
}

.sidebar-open.parent-card {
  margin-left: 250px;
}

.sharp-card {
  border-radius: 0 !important;
  border: 1px solid #000 !important;
}

.no-data-placeholder-wide {
    aspect-ratio: 16/9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}
</style>
