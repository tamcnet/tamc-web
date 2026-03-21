<template>
    <div class="mainBody">
        <!-- Meteorology セクション -->
        <v-container class="mx-auto overflow-visible">
            <div class="category-title text-h4 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
                気象 (Meteorology)
            </div>
            <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
                <v-row justify="space-between" align="stretch" style="width: 100%;">
                    <v-col v-for="index in [0, 1]" :key="`met-${index}`" cols="12" sm="6" md="6" lg="6">
                        <v-skeleton-loader v-if="loading" type="image, article" class="skeleton-dark" />
                        <v-card v-else class="black-card" height="100%">
                            <div v-if="!meteorologyData.medias[index]" class="no-data-placeholder">
                                <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                                <div class="text-body-1 text-grey mt-2">データなし</div>
                            </div>
                            <v-img
                                v-else
                                :src="meteorologyData.medias[index]"
                                cover
                                :aspect-ratio="3/2"
                            ></v-img>
                            <v-card-title class="flex-column align-start white-text" style="height: auto; display: block;">
                                <div class="text-h4 mb-2 d-flex align-center" style="white-space: pre-line;">
                                    <v-icon class="mr-2" size="90">
                                        {{ meteorologyData.icons[index] }}
                                    </v-icon>
                                    {{ meteorologyData.types[index] }}: {{ meteorologyData.results[index] ?? 'データなし' }}
                                </div>
                                <div class="text-h5 font-weight-regular white-text mb-2" style="white-space: pre-line;">
                                    {{ meteorologyData.times[index] ?? '' }}
                                </div>
                                <div class="text-h6 font-weight-regular text-grey" style="white-space: pre-line;">
                                    {{ meteorologyData.explanations[index] }}
                                </div>
                            </v-card-title>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-container>

        <!-- Astronomy セクション -->
        <v-container class="mx-auto overflow-visible">
            <div class="category-title text-h4 pa-3" style="font-weight: bold; border-bottom: 2px solid #000;">
                天文 (Astronomy)
            </div>
            <v-container class="mx-auto d-flex align-center justify-center overflow-visible">
                <v-row justify="space-between" align="stretch" style="width: 100%;">
                    <v-col v-for="index in [0, 1]" :key="`astro-${index}`" cols="12" sm="6" md="6" lg="6">
                        <v-skeleton-loader v-if="loading" type="image, article" class="skeleton-dark" />
                        <v-card v-else class="black-card" height="100%">
                            <div v-if="!astronomyData.medias[index]" class="no-data-placeholder">
                                <v-icon size="48" color="grey">mdi-image-off-outline</v-icon>
                                <div class="text-body-1 text-grey mt-2">データなし</div>
                            </div>
                            <v-img
                                v-else-if="astronomyData.types[index] === '流星'"
                                :src="astronomyData.medias[index]"
                                cover
                                :aspect-ratio="3/2"
                            ></v-img>
                            <v-img
                                v-else-if="astronomyData.types[index] === '黒点'"
                                :src="astronomyData.medias[index]"
                                contain
                                :aspect-ratio="3/2"
                                class="sunspot-image"
                            ></v-img>
                            <v-card-title class="flex-column align-start white-text" style="height: auto; display: block;">
                                <!-- 流星の場合 -->
                                <template v-if="astronomyData.types[index] === '流星'">
                                    <div class="text-h4 mb-2 d-flex align-center" style="white-space: pre-line;">
                                        <v-icon class="mr-2" size="90">mdi-meteor</v-icon>
                                        最新の流星： {{ getDirection(astronomyData.results[index]) || 'データなし' }}
                                    </div>
                                    <div class="text-h5 font-weight-regular white-text mb-2" style="white-space: pre-line;">
                                        {{ getTime(astronomyData.results[index]) }}
                                    </div>
                                </template>
                                <!-- 黒点の場合 -->
                                <template v-else-if="astronomyData.types[index] === '黒点'">
                                    <div class="text-h4 mb-2 d-flex align-center" style="white-space: pre-line;">
                                        <v-icon class="mr-2" size="90">mdi-white-balance-sunny</v-icon>
                                        最新の太陽黒点： {{ astronomyData.times[index] ?? 'データなし' }}
                                    </div>
                                    <div class="text-h5 font-weight-regular white-text mb-2" style="white-space: pre-line;">
                                        {{ astronomyData.results[index] != null ? `黒点面積 ${astronomyData.results[index]} pixel` : '' }}
                                    </div>
                                </template>
                                <div class="text-h6 font-weight-regular text-grey" style="white-space: pre-line;">
                                    {{ astronomyData.explanations[index] }}
                                </div>
                            </v-card-title>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-container>
        <v-divider class="border-opacity-100"></v-divider>
    </div>
</template>

<script>
import api from '@/lib/api';
import { visDis, Fujiobs, directionMap } from '@/lib/constants';

export default {
    data() {
        return {
            loading: true,
            meteorologyData: {
                medias: [null, null],
                types: ["立川高校から見える距離（視程）", "富士山の可視性"],
                icons: ["mdi-eye-outline", "mdi-image-filter-hdr-outline"],
                results: [null, null],
                times: [null, null],
                explanations: [
                    "視程とは観測場所から識別することのできる距離の程度を表し、大気汚染等の指標となる。",
                    "本校から富士山までの直線距離は70kmである。富士山付近では笠雲やつるし雲がみられることがある。",
                ]
            },
            astronomyData: {
                medias: [null, null],
                types: ["流星", "黒点"],
                icons: ["mdi-meteor", "mdi-white-balance-sunny"],
                results: [null, null],
                times: [null, null],
                explanations: [
                    "流星とは流れ星のことであり、流星の観測は宇宙空間の彗星・小惑星の姿や高層の地球大気を解明することに繋がる。",
                    "黒点は周囲より温度が低く暗く見える太陽表面の領域で、太陽活動の強さを示す手がかりとなる。",
                ]
            },
            visDis,
            Fujiobs,
            directionMap,
            interval: -1,
        };
    },
    methods: {
        async fetchlatestMedias() {
            const [visTree, visFuji, sunspotImage] = await Promise.allSettled([
                api.get("/latest_image", { responseType: 'blob' }),
                api.get("/Fuji_latest_image", { responseType: 'blob' }),
                api.get("/manualReport/sunspot/info"),
            ]);
            this.meteorologyData.medias.forEach(url => {
                if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
            this.meteorologyData.medias = [
                visTree.status === 'fulfilled' ? URL.createObjectURL(new Blob([visTree.value.data])) : null,
                visFuji.status === 'fulfilled' ? URL.createObjectURL(new Blob([visFuji.value.data])) : null,
            ];
            this.astronomyData.medias = [
                `${import.meta.env.VITE_API_BASE_URL}/Meteor_latest_video`,
                sunspotImage.status === 'fulfilled' ? `${import.meta.env.VITE_API_BASE_URL}${sunspotImage.value.data.image_url}` : null,
            ];
        },
        async fetchlatestResults() {
            const [latest_class, Fujilatest_class, meteor_dir, sunspotInfo] = await Promise.allSettled([
                api.get("/latest_class"),
                api.get("/Fuji_latest_class"),
                api.get("/Meteor_info"),
                api.get("/manualReport/sunspot/info"),
            ]);
            this.meteorologyData.results = [
                latest_class.status === 'fulfilled' ? this.visDis[latest_class.value.data[0]] : null,
                Fujilatest_class.status === 'fulfilled' ? this.Fujiobs[Fujilatest_class.value.data[0]] : null,
            ];
            this.astronomyData.results = [
                meteor_dir.status === 'fulfilled' ? meteor_dir.value.data[0] : null,
                sunspotInfo.status === 'fulfilled' ? sunspotInfo.value.data.total_area : null,
            ];
        },
        async fetchObservedTime() {
            const [latest_time, Fujilatest_time, meteor_time, sunspotInfo] = await Promise.allSettled([
                api.get("/latest_info"),
                api.get("/Fuji_latest_info"),
                api.get("/Meteor_info"),
                api.get("/manualReport/sunspot/info"),
            ]);
            this.meteorologyData.times = [
                latest_time.status === 'fulfilled' ? latest_time.value.data.time : null,
                Fujilatest_time.status === 'fulfilled' ? Fujilatest_time.value.data.time : null,
            ];
            this.astronomyData.times = [
                meteor_time.status === 'fulfilled' ? meteor_time.value.data[0] : null,
                sunspotInfo.status === 'fulfilled' ? sunspotInfo.value.data.date : null,
            ];
        },
        getTime(result) {
            if (!result) return '';
            const [time] = result.split(' :');
            return time.trim();
        },
        getDirection(result) {
            if (!result) return '';
            const parts = result.split(' :');
            const direction = parts.length > 1 ? parts[1].trim() : '';
            return this.directionMap[direction] || direction;
        }
    },

    mounted() {
        Promise.all([
            this.fetchlatestMedias(),
            this.fetchlatestResults(),
            this.fetchObservedTime(),
        ]).then(() => {
            this.loading = false;
        });

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

.white-text {
  color: white;
}

.mr-2 {
    margin-right: 8px;
}

.sunspot-image {
  background-color: black;
}

.no-data-placeholder {
    aspect-ratio: 3/2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #1a1a1a;
}

.skeleton-dark :deep(.v-skeleton-loader__image),
.skeleton-dark :deep(.v-skeleton-loader__article),
.skeleton-dark :deep(.v-skeleton-loader__bone) {
    background-color: #2a2a2a;
}

.skeleton-dark {
    background-color: #212121;
}
</style>
