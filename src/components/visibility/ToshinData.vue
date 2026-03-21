<template>
  <div class="mainBody">
      <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
        <div class="text-h5 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
          視程観測装置(都心方面)
        </div>
      </v-container>
      <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
        <v-row justify="center" align="stretch" style="width: 100%;">
            <v-col cols="12" sm="6" md="6" lg="5" class="d-flex align-stretch">
                <v-skeleton-loader v-if="loading" type="image, article" class="skeleton-dark" style="width: 100%;" />
                <v-card v-else class="black-card d-flex flex-column" style="height: 100%; width: 100%;">
                    <div v-if="!latestMedias[0]" class="no-data-placeholder">
                        <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                        <div class="text-body-1 text-grey mt-2">データなし</div>
                    </div>
                    <v-img v-else :src="latestMedias[0]" cover style="width: 100%; height: auto;"></v-img>
                    <v-card-title class="flex-column align-start white-text">
                        <div class="text-h4 mb-2" style="white-space: pre-line;">視程距離: {{ visDis[latestResult[0]] ?? 'データなし' }}</div>
                        <div class="text-h5 font-weight-regular white-text mb-2" style="white-space: pre-line;">
                            {{ observedTimes[0] ?? '' }}
                        </div>
                        <div class="text-h6 font-weight-regular text-grey" style="white-space: pre-line;">
                            {{ obsEx[latestResult[0]] ?? '' }}
                        </div>
                    </v-card-title>
                </v-card>
            </v-col>

            <v-col cols="12" md="6" lg="7" class="d-flex align-stretch">
                <v-container fluid class="d-flex flex-column" style="height: 100%;">
                    <v-row dense>
                        <v-col :key="vis.title" cols="12">
                            <v-card class="d-flex align-center justify-center info-card" style="height: 100%;">
                                <v-card-item>
                                    <div class="text-h6 mb-1">{{ vis.title }}</div>
                                </v-card-item>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-row dense>
                        <v-col :key="basicInfos.title" cols="7">
                            <v-card style="height: 100%;" class="info-card d-flex flex-column">
                                <v-card-item>
                                    <div class="text-h6 mb-1">{{ basicInfos.title }}</div>
                                    <div class="text-h6 font-weight-regular text-grey">
                                        <div>疎通: これから</div>
                                        <div>更新: {{ basicInfos.time }}</div>
                                        <div>温度: {{ basicInfos.temp }}</div>
                                        <div>湿度: {{ basicInfos.humis }}</div>
                                        <div>CPU温度: {{ basicInfos.cpuTemp }}</div>
                                        <div>稼働時間: {{ basicInfos.operating }}</div>
                                    </div>
                                </v-card-item>
                            </v-card>
                        </v-col>

                        <v-col :key="usages.title" cols="5">
                            <v-card class="d-flex flex-column align-center justify-center info-card" style="padding: 20px; height: 100%;">
                                <v-card-item>
                                    <div class="text-h6 mb-1">{{ usages.title }}</div>
                                </v-card-item>
                                <v-row justify="center" align="center">
                                    <v-col cols="6" class="text-center">
                                        <v-progress-circular :model-value="usages.sdUsage" :size="120" color="primary" class="mb-2">
                                            {{ usages.sdUsage }}
                                        </v-progress-circular>
                                        <div class="text-subtitle1">本体使用率</div>
                                    </v-col>
                                    <v-col cols="6" class="text-center">
                                        <v-progress-circular :model-value="usages.usbUsage" :size="120" color="primary" class="mb-2">
                                            {{ usages.usbUsage }}
                                        </v-progress-circular>
                                        <div class="text-subtitle1">USB使用率</div>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-row dense>
                        <v-col :key="usaging.title" cols="12">
                            <v-card class="d-flex align-center justify-center info-card" style="height: 100%;">
                                <v-card-item>
                                    <div class="text-h6 mb-1">{{ usaging.title }}</div>
                                </v-card-item>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>
      </v-container>
  </div>
</template>

<script>
import api from '@/lib/api';
import { visDis, obsEx } from '@/lib/constants';

export default {
  data() {
      return {
          loading: true,
          latestMedias: [null],
          visDis,
          obsEx,
          latestResult: [null],
          observedTimes: [null],
          interval: -1,
          vis: {title: "視程推移"},
          basicInfos: {title: "基本情報", time: "", cpuTemp: "", usbUsage: "", sdUsage: "", temp: "", humis: "", operating: ""},
          usages: {title: "使用率", sdUsage: "70", usbUsage: "77"},
          usaging: {title: "使用状況"},
      };
  },
  methods: {
      async fetchlatestMedias() {
          const [r1] = await Promise.allSettled([
              api.get("/latest_image", { responseType: 'blob' }),
          ]);
          this.latestMedias.forEach(url => { if (url) URL.revokeObjectURL(url); });
          this.latestMedias = [
              r1.status === 'fulfilled' ? URL.createObjectURL(new Blob([r1.value.data])) : null,
          ];
      },
      async fetchlatestResults() {
          const [r1] = await Promise.allSettled([
              api.get("/latest_class"),
          ]);
          this.latestResult = [
              r1.status === 'fulfilled' ? r1.value.data[0] : null,
          ];
      },
      async fetchObservedTime() {
          const [r1] = await Promise.allSettled([
              api.get("/latest_info"),
          ]);
          this.observedTimes = [
              r1.status === 'fulfilled' ? r1.value.data.time : null,
          ];
      },
  },
  mounted() {
      Promise.all([
          this.fetchlatestMedias(),
          this.fetchlatestResults(),
          this.fetchObservedTime(),
      ]).then(() => { this.loading = false; });

      this.interval = setInterval(() => {
          this.fetchlatestMedias();
          this.fetchlatestResults();
          this.fetchObservedTime();
      }, 600000);
  },
  beforeUnmount() {
      clearInterval(this.interval);
  },
};
</script>

<style scoped>
.mainBody {
    width: 100vw;
    background-color: white;
}

.black-card {
    background-color: black;
    border: 5px solid #212121;
    border-radius: 0;
}

.info-card{
    border: 1px solid #212121;
    border-radius: 0;
}

.white-text {
    color: white;
}

.no-data-placeholder {
    aspect-ratio: 3/2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #1a1a1a;
}

.skeleton-dark :deep(.v-skeleton-loader__bone) {
    background-color: #2a2a2a;
}

.skeleton-dark {
    background-color: #212121;
}
</style>
