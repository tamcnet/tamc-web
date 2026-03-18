<template>
  <div class="mainBody">
      <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
        <div class="text-h5 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
          視程観測装置(都心方面)
        </div>
      </v-container>
      <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
        <v-row justify="center" align="stretch" style="width: 100%;">
            <v-col v-for="(media, index) in latestMedias" :key="index" cols="12" sm="6" md="6" lg="5"
                class="d-flex align-stretch">
                <v-card class="black-card d-flex flex-column" style="height: 100%; width: 100%;">
                    <v-img :src="latestMedias[index]" cover style="width: 100%; height: auto;"></v-img>
                    <v-card-title class="flex-column align-start white-text">
                        <div class="text-h4 mb-2" style="white-space: pre-line;">視程距離: {{ visDis[latestResult[index]] }}</div>
                        <div class="text-h5 font-weight-regular white-text mb-2" style="white-space: pre-line;">
                            {{ observedTimes[index] }}
                        </div>
                        <div class="text-h6 font-weight-regular text-grey" style="white-space: pre-line;">
                            {{ obsEx[latestResult[index]] }}
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
          usbUsages: [],
          Dates: [],
          cpuTempers: [],
          Tempers: [],
          Humis: [],
          sdCardUsages: [],
          notifyErrorLog: "",
          sendInfoErrorLog: "",
          obsOnceErrorLog: "",
          obsOnceLog: "",
          Fgo: "",
          latestMedias: [],
          visDis,
          obsEx,
          latestResult: [],
          observedTimes: [],
          interval: -1,
          vis: {title: "視程推移"},
          basicInfos: {title: "基本情報", time: "", cpuTemp: "", usbUsage: "", sdUsage: "", temp: "", humis: "", operating: ""},
          usages: {title: "使用率", path: "/", path: "/mnt/usb1", sdUsage: "70", usbUsage: "77"},
          usaging: {title: "使用状況"}
        //   basicInfos: [
        //     {title: "基本情報", flex: 12},
        //     {title: "使用率", flex: 6},
        //     {title: "CPU温度", flex: 6}
        //   ],
      };
  },
  methods: {
      async fetchlatestMedias() {
          try {
              const visTree1 = await api.get("/latest_image", { responseType: 'blob' });
              // const visTree2 = await axios.get("http://100.119.204.18:5000/10minago_image", { responseType: 'blob' });
              // const visTree3 = await axios.get("http://100.119.204.18:5000/20minago_image", { responseType: 'blob' });
              // 古い Blob URL を解放
              this.latestMedias.forEach(url => URL.revokeObjectURL(url));

              const visTree1Blob = new Blob([visTree1.data]);
              // const visTree2Blob = new Blob([visTree2.data]);
              // const visTree3Blob = new Blob([visTree3.data]);
              
              this.latestMedias = [
                  URL.createObjectURL(visTree1Blob),
                  // URL.createObjectURL(visTree2Blob),
                  // URL.createObjectURL(visTree3Blob)
              ];
          } catch (error) {
              console.log("Error fetching latestMedias:", error);
          }
      },
      async fetchlatestResults() {
          try {
              const latest_class = await api.get("/latest_class");
              // const tenmin_class = await axios.get("http://100.119.204.18:5000/10minago_class");
              // const twemin_class = await axios.get("http://100.119.204.18:5000/20minago_class");
              const visTreeRes1 = latest_class.data[0];
              // const visTreeRes2 = tenmin_class.data[0];
              // const visTreeRes3 = twemin_class.data[0];
              // this.latestResult = [visTreeRes1, visTreeRes2, visTreeRes3];
              this.latestResult = [visTreeRes1,];
          } catch (error) {
              console.log("Error fetching latestResults: ", error);
          }
      },
      async fetchObservedTime() {
          try {
              const latest_time = await api.get("/latest_info");
              // const tenmin_time = await axios.get("http://100.119.204.18:5000/10minago_info");
              // const twemin_time = await axios.get("http://100.119.204.18:5000/20minago_info");

              const visTreeTime1 = latest_time.data.time;
              // const visTreeTime2 = tenmin_time.data.time;
              // const visTreeTime3 = twemin_time.data.time;

              // this.observedTimes = [visTreeTime1, visTreeTime2, visTreeTime3];
              this.observedTimes = [visTreeTime1,];
          } catch(error) {
              console.log("Error fetching observedTimes:", error);
          }
      }
  },
  mounted() {
      this.interval = setInterval(() => {
          this.fetchlatestMedias();
          this.fetchlatestResults();
          this.fetchObservedTime();
      }, 600000);

      this.fetchlatestMedias();
      this.fetchlatestResults();
      this.fetchObservedTime();
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

.full-width-row {
    width: 100vw;
    max-width: 100vw;
    margin: 0;
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
</style>
