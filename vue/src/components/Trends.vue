<template>
    <div class="trends">
        <input type="text" @keypress.enter="keypressed" v-model="keyword" />
        <div class="trends-result" v-if="keywords">
            <ul class="keywords">
                <li class="keyword" v-for="item in series" :key="item.name">
                    <div class="keyword-box" :style="{ borderColor: item.color }">
                        <span>{{ item.name }}</span>
                        <span @click="removeSeries(item.name)">❌</span>
                    </div>
                </li>
            </ul>
            <div class="charts">
                <highcharts :options="chartOptions" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Highcharts from 'highcharts';
import { Chart } from 'highcharts-vue';
import axios from 'axios';
import { Trend, Series, Download, Axis, ChartOptions } from '@/types';

const downloader = {
    async downloads(keyword: string): Promise<Trend | undefined> {
        try {
            const response = await axios.get(
                // 날짜 고정
                `https://proxy.npmtrends.com/?url=https://api.npmjs.org/downloads/range/2020-08-30:2021-02-27/${keyword}`
            );
            return response.data;
        } catch (error) {
            throw new Error(error);
        }
    },
};

const chartMaker = {
    palette: [
        '#0074D9', // 파랑
        '#2ECC40', // 녹색
        '#FF4136', // 빨강
        '#FF851B', // 주황
        '#FFDC00', // 노랑
        '#7FDBFF', // 하늘
        '#B10DC9', // 보라
        '#39CCCC', // 청록
        '#001F3F', // 검정
        '#01FF70', // 형광연두
    ],
    // npm trends 파싱하여 highcharts에 값을 입력하기 위한 수치 배열 생성하기
    getSeries(series: Series[], packageName: string, downloads: Download[], perDay = 7): Series {
        const summarized = this.summarize(downloads.concat(), perDay);

        return {
            name: packageName,
            data: summarized.map(({ downloads }) => downloads),
            color: this.palette[series.length],
        };
    },
    // npm trends를 파싱하여 highcharts의 x축(날짜)을 구성하기 위한 배열 생성하기
    getXAxis(downloads: Download[], perDay = 7): Axis {
        return {
            type: 'datetime',
            categories: this.summarize(downloads, perDay).map(({ day }) => new Date(day)),
            tickColor: '#ff0000',
            tickInterval: 5,
            labels: {
                formatter() {
                    return Highcharts.dateFormat('%Y년 %m월', this.value);
                },
            },
            gridLineWidth: 0.4,
            gridLineColor: '#d0d0d0',
        };
    },
    // npm trends는 일자별 다운로드 수가 넘어오는데 이를 7일 등의 단위로 묶어서 파싱하기
    summarize(downloads: Download[], perDay: number): Download[] {
        const result: Download[] = [];
        downloads.reduce((accumulated: Download, current: Download, idx: number) => {
            if (idx % perDay === 0 || idx === downloads.length - 1) {
                result.push({ downloads: accumulated.downloads, day: current.day });
                return { downloads: 0, day: '' };
            } else {
                accumulated.downloads += current.downloads;
                return accumulated;
            }
        });
        return result;
    },
    removeSeries(series: Series[], seriesName: string): Series[] {
        return series
            ? series
                  .filter(({ name }) => name !== seriesName)
                  .map((series, idx) => ({ ...series, color: this.palette[idx] }))
            : [];
    },
    getInitializedChartOptions(): ChartOptions {
        return {
            chart: {
                type: 'spline',
                renderTo: 'container',
            },
            title: {
                text: '',
            },
            yAxis: {
                title: {
                    text: null,
                },
            },
            series: [] as Series[],
            legend: {
                symbolWidth: 16,
                symbolHeight: 16,
                symbolRadius: 0,
                squareSymbol: false,

                align: 'center',
                verticalAlign: 'top',
                itemDistance: 50,
            },
            plotOptions: {
                series: {
                    lineWidth: 4,
                    marker: {
                        enabled: false,
                    },
                },
            },
        };
    },
};

export default Vue.extend({
    name: 'Trends',
    components: {
        highcharts: Chart,
    },
    data() {
        return {
            keyword: '',
            chartOptions: {} as ChartOptions,
        };
    },
    computed: {
        series(): Series[] {
            return this.chartOptions.series || [];
        },
        keywords(): string[] {
            return this.series.map(({ name }) => name);
        },
    },
    created() {
        this.chartOptions = chartMaker.getInitializedChartOptions();
        this.drawChart('vue');
    },
    methods: {
        keypressed() {
            const keyword = this.keyword.trim();
            this.keyword = '';

            if (keyword && !this.keywords.includes(keyword) && this.keywords.length < chartMaker.palette.length) {
                this.drawChart(keyword);
            }
        },
        async drawChart(keyword: string) {
            const trends: Trend | undefined = await downloader.downloads(keyword);

            if (!trends) return;

            const downloads: Download[] = trends.downloads;
            const series = this.chartOptions.series ? this.chartOptions.series : [];
            const newSeries = chartMaker.getSeries(series, trends.package, downloads);

            series.length === 0 && this.composeXAxis(downloads);
            if (newSeries) {
                this.chartOptions = {
                    ...this.chartOptions,
                    series: [...series.concat(), newSeries],
                };
            }
        },
        removeSeries(keyword: string) {
            this.chartOptions.series = chartMaker.removeSeries(this.chartOptions.series, keyword);
        },
        composeXAxis(downloads: Download[]): void {
            // console.log(chartMaker.getXAxis(downloads), 'x축');
            this.chartOptions = {
                ...this.chartOptions,
                xAxis: chartMaker.getXAxis(downloads),
            } as ChartOptions;
        },
    },
});
</script>

<style lang="scss" scoped>
.trends {
    width: 80%;
    margin: 0 auto;

    ul.keywords {
        li.keyword {
            list-style: none;
            display: inline-block;

            .keyword-box {
                padding: 5px 10px;
                border-radius: 5px;
                border: 2.2px solid #d0d0d0;
            }

            &:not(:first-child) {
                margin-left: 5px;
            }
        }
    }
}
</style>