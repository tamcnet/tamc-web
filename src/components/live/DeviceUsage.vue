<template>
    <div class="equipments">
        <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
            <div class="text-h5 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
              {{ title }}
            </div>
        </v-container>

        <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
            <v-row justify="space-between" align="stretch" style="width: 100%;">
                <v-col cols="12" md="6" class="d-flex">
                    <v-container fluid class="d-flex flex-column" style="height: 100%;">
                        <v-row dense style="flex-grow: 1;">
                            <v-col cols="12" md="6" class="d-flex">
                                <v-card class="info-card d-flex flex-column flex-grow-1">
                                    <v-card-item>
                                        <div class="text-h6 mb-1">{{ basicInfos.title }}</div>
                                        <div class="text-h6 font-weight-regular text-grey">
                                            <div>疎通: True</div>
                                            <div>更新: {{ basicInfos.time }}</div>
                                            <div>温度: {{ basicInfos.temp }} 度</div>
                                            <div>湿度: {{ basicInfos.humis }} %</div>
                                            <div>CPU温度: {{ basicInfos.cpuTemp }} 度</div>
                                            <div>稼働時間: {{ basicInfos.operating }}</div>
                                        </div>
                                    </v-card-item>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="6" class="d-flex">
                                <v-card class="d-flex flex-column align-center justify-center info-card flex-grow-1" style="padding: 20px;">
                                    <v-row justify="center" align="center">
                                        <v-col cols="6" class="text-center">
                                            <v-progress-circular :model-value="basicInfos.sdUsage" :size="120" color="primary" class="mb-2" :width="10">
                                                {{ basicInfos.sdUsage }} %
                                            </v-progress-circular>
                                            <div class="text-subtitle1">本体使用率</div>
                                        </v-col>
                                        <v-col cols="6" class="text-center">
                                            <v-progress-circular :model-value="basicInfos.usbUsage" :size="120" color="primary" class="mb-2" :width="10">
                                                {{ basicInfos.usbUsage }} %
                                            </v-progress-circular>
                                            <div class="text-subtitle1">USB使用率</div>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="12" class="d-flex">
                                <v-card class="d-flex align-center justify-center info-card flex-grow-1">
                                    <canvas :id="'lineChart-' + deviceId" class="line-chart"></canvas>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>

                <v-col cols="12" md="6" class="d-flex">
                    <v-container fluid class="d-flex flex-column" style="height: 100%;">
                        <v-card class="log-card flex-grow-1">
                            <v-list lines="three">
                                <v-list-subheader>撮影ログ等</v-list-subheader>
                                <v-list-item>
                                    <v-list-item-title>notify-error.log</v-list-item-title>
                                    <v-list-item-subtitle>{{ notifyErrorLog }}</v-list-item-subtitle>
                                </v-list-item>
                                <v-divider></v-divider>
                                <v-list-item>
                                    <v-list-item-title>send_info.log</v-list-item-title>
                                    <v-list-item-subtitle>{{ sendInfoErrorLog }}</v-list-item-subtitle>
                                </v-list-item>
                                <v-divider></v-divider>
                                <v-list-item>
                                    <v-list-item-title>obs-once-error.log</v-list-item-title>
                                    <v-list-item-subtitle>{{ obsOnceErrorLog }}</v-list-item-subtitle>
                                </v-list-item>
                                <v-divider></v-divider>
                                <v-list-item>
                                    <v-list-item-title>obs-once.log</v-list-item-title>
                                    <v-list-item-subtitle>{{ obsOnceLog }}</v-list-item-subtitle>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </v-container>
                </v-col>
            </v-row>
        </v-container>
        <v-divider class="border-opacity-100"></v-divider>
    </div>
</template>


<script>
import api from '@/lib/api';
import { Chart, LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, LineController, PointElement } from 'chart.js';
Chart.register(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, LineController, PointElement);

export default {
  props: {
    deviceId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      notifyErrorLog: "",
      sendInfoErrorLog: "",
      obsOnceErrorLog: "",
      obsOnceLog: "",
      basicInfos: { title: "基本情報", time: "", cpuTemp: "", usbUsage: "", sdUsage: "", temp: "", humis: "", operating: "" },
      lineColors: {
        temperature: 'rgba(255, 99, 132, 1)',
        cpuTemperature: 'rgba(255, 165, 38, 1)'
      },
      yMinValue: -5,
      yMaxValue: 30,
      interval: -1,
    };
  },
  methods: {
    async fetchLogs() {
      try {
        const response = await api.get(`/${this.deviceId}/logs`);
        const logs = response.data;
        this.notifyErrorLog = logs["notify-error.log"];
        this.sendInfoErrorLog = logs["send_info-error.log"];
        this.obsOnceErrorLog = logs["obs-once-error.log"];
        this.obsOnceLog = logs["obs-once.log"];
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    },
    async fetchStatus() {
      try {
        const infos = await api.get(`/${this.deviceId}/info`);
        this.basicInfos.time = infos.data.date;
        this.basicInfos.temp = infos.data.temperature;
        this.basicInfos.humis = infos.data.humidity;
        this.basicInfos.operating = infos.data.uptime;
        this.basicInfos.cpuTemp = infos.data.cpuTemperature;
        this.basicInfos.usbUsage = infos.data.usbUsage;
        this.basicInfos.sdUsage = infos.data.sdCardUsage;
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    },
    async fetchData() {
      try {
        const response = await api.get(`/${this.deviceId}/usages`);
        const data = response.data;

        if (!data || !data.temperature || !data.cpuTemperature || !data.date) {
          console.error("API response is missing required fields");
          return;
        }

        const times = data.date;
        const temperatures = data.temperature.filter(temp => temp !== -128);
        const cpuTemperatures = data.cpuTemperature.filter(cpuTemp => cpuTemp !== -128);

        const minValue = Math.min(...temperatures, ...cpuTemperatures);
        const maxValue = Math.max(...temperatures, ...cpuTemperatures);
        this.yMinValue = minValue;
        this.yMaxValue = maxValue;

        this.drawChart(times, temperatures, cpuTemperatures);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    drawChart(labels, temperatures, cpuTemperatures) {
      const canvas = document.getElementById('lineChart-' + this.deviceId);
      if (!canvas) {
        console.error("Canvas not found");
        return;
      }
      Chart.getChart(canvas)?.destroy();

      const mobileScreen = window.innerWidth <= 450;

      new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: "Temperature", data: temperatures, borderColor: this.lineColors.temperature, fill: false },
            { label: "CPU Temperature", data: cpuTemperatures, borderColor: this.lineColors.cpuTemperature, fill: false }
          ]
        },
        options: {
          maintainAspectRatio: true,
          responsive: true,
          aspectRatio: mobileScreen ? 5 / 2 : 5 / 1,
          plugins: { legend: { display: !mobileScreen } },
          scales: {
            y: {
              min: this.yMinValue,
              max: this.yMaxValue,
              beginAtZero: false,
              ticks: { font: { size: mobileScreen ? 10 : 12 } }
            },
            x: {
              ticks: { display: true, maxTicksLimit: mobileScreen ? 8 : 12, rotation: 0, font: { size: mobileScreen ? 10 : 12 } }
            }
          }
        }
      });
    }
  },
  mounted() {
    this.interval = setInterval(() => {
      this.fetchLogs();
      this.fetchStatus();
      this.fetchData();
    }, 600000);
    this.fetchLogs();
    this.fetchStatus();
    this.fetchData();
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>


<style scoped>
.equipments {
    width: 100vw;
    background-color: white;
}

.info-card {
    border: 1px solid #212121;
    border-radius: 0;
}

.log-card {
    border: 1px solid #212121;
    border-radius: 0;
}

.line-chart {
    width: 100%;
}
</style>
