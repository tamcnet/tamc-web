<template>
    <div class="mainBody">
        <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
            <div class="text-h5 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
              富士山方面の直近撮影画像
            </div>
        </v-container>
        <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
            <v-row justify="space-between" align="stretch" style="width: 100%;">
                <v-col v-for="index in [0, 1, 2]" :key="index" cols="12" sm="6" md="4" lg="4">
                    <v-skeleton-loader v-if="loading" type="image, article" class="skeleton-dark" />
                    <v-card v-else class="black-card" height="100%">
                        <div v-if="!latestMedias[index]" class="no-data-placeholder">
                            <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                            <div class="text-body-1 text-grey mt-2">データなし</div>
                        </div>
                        <v-img v-else :src="latestMedias[index]" cover :aspect-ratio="3/2"></v-img>
                        <v-card-title class="flex-column align-start white-text" style="height: auto; display: block;">
                            <div class="text-h4 mb-2" style="white-space: pre-line;">富士山の可視性: {{ flags[latestResult[index]] ?? 'データなし' }}</div>
                            <div class="text-h6 font-weight-regular text-grey" style="white-space: pre-line;">
                                {{ observedTimes[index] ?? '' }}
                            </div>
                            <div class="text-h6 font-weight-regular text-grey" style="white-space: pre-line;">
                                {{ obsEx[latestResult[index]] ?? '' }}
                            </div>
                        </v-card-title>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-divider class="border-opacity-100"></v-divider>
    </div>
</template>

<script>
import api from '@/lib/api';
import { Fujiobs, fujiObsEx } from '@/lib/constants';

export default {
    data() {
        return {
            loading: true,
            latestMedias: [null, null, null],
            realtimeDataType: ["視程距離", "富士山", "流星"],
            flags: Fujiobs,
            obsEx: fujiObsEx,
            latestResult: [null, null, null],
            observedTimes: [null, null, null],
            interval: -1,
        };
    },
    methods: {
        async fetchlatestMedias() {
            const [r1, r2, r3] = await Promise.allSettled([
                api.get("/Fuji_latest_image", { responseType: 'blob' }),
                api.get("/Fuji_30minago_image", { responseType: 'blob' }),
                api.get("/Fuji_60minago_image", { responseType: 'blob' }),
            ]);
            this.latestMedias.forEach(url => { if (url) URL.revokeObjectURL(url); });
            this.latestMedias = [
                r1.status === 'fulfilled' ? URL.createObjectURL(new Blob([r1.value.data])) : null,
                r2.status === 'fulfilled' ? URL.createObjectURL(new Blob([r2.value.data])) : null,
                r3.status === 'fulfilled' ? URL.createObjectURL(new Blob([r3.value.data])) : null,
            ];
        },
        async fetchlatestResults() {
            const [r1, r2, r3] = await Promise.allSettled([
                api.get("/Fuji_latest_class"),
                api.get("/Fuji_30minago_class"),
                api.get("/Fuji_60minago_class"),
            ]);
            this.latestResult = [
                r1.status === 'fulfilled' ? r1.value.data[0] : null,
                r2.status === 'fulfilled' ? r2.value.data[0] : null,
                r3.status === 'fulfilled' ? r3.value.data[0] : null,
            ];
        },
        async fetchObservedTime() {
            const [r1, r2, r3] = await Promise.allSettled([
                api.get("/Fuji_latest_info"),
                api.get("/Fuji_30minago_info"),
                api.get("/Fuji_60minago_info"),
            ]);
            this.observedTimes = [
                r1.status === 'fulfilled' ? r1.value.data.time : null,
                r2.status === 'fulfilled' ? r2.value.data.time : null,
                r3.status === 'fulfilled' ? r3.value.data.time : null,
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
