import '../Trends.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const downloader = {
    async downloads(keyword) {
        try {
            const response = await axios.get(
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
    getSeries(series, packageName, downloads, perDay = 7) {
        const summarized = this.summarize(downloads.concat(), perDay);

        return {
            name: packageName,
            data: summarized.map(({ downloads }) => downloads),
            color: this.palette[series.length],
        };
    },
    // npm trends를 파싱하여 highcharts의 x축(날짜)을 구성하기 위한 배열 생성하기
    getXAxis(downloads, perDay = 7) {
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
    summarize(downloads, perDay) {
        const result = [];
        downloads.reduce((accumulated, current, idx) => {
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
    removeSeries(series, seriesName) {
        return series
            ? series
                  .filter(({ name }) => name !== seriesName)
                  .map((series, idx) => ({ ...series, color: this.palette[idx] }))
            : [];
    },
    getInitializedChartOptions() {
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
            series: [],
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

function Trends() {
    const [keyword, setKeyword] = useState([]);
    const [chartOptions, setChartOptions] = useState({});
    const series = chartOptions.series;

    useEffect(() => {
        setChartOptions(chartMaker.getInitializedChartOptions());
        drawChart('vue');
    }, []);

    const onChange = (event) => {
        setKeyword(event.target.value);
    };

    const onKeyPress = (event) => {
        if (event.charCode === 13) {
            // 엔터를 눌렀는데 키워드가 입력되면
            // 중복 체크
            //그래프 그리기
            drawChart(keyword);
            // 키워드 초기화하기
            setKeyword('');
        }
    };

    const drawChart = async (keyword) => {
        const trends = await downloader.downloads(keyword);

        if (!trends) return;
        if (chartOptions && chartOptions.series && chartOptions.series.find(({ name }) => name === keyword)) return;

        const downloads = trends.downloads;
        const series = chartOptions.series ? chartOptions.series : [];
        const newSeries = chartMaker.getSeries(series, trends.package, downloads);

        series.length === 0 && composeXAxis(downloads);
        if (newSeries) {
            setChartOptions({
                ...chartOptions,
                series: [...series.concat(), newSeries],
            });
        }
    };

    const composeXAxis = (downloads) => {
        // console.log(chartMaker.getXAxis(downloads), 'x축');
        setChartOptions({
            ...chartOptions,
            xAxis: chartMaker.getXAxis(downloads),
        });
    };

    const removeSeries = (seriesName) => {
        const removed = Array.isArray(series) ? chartMaker.removeSeries(series, seriesName) : [];
        setChartOptions({
            ...chartOptions,
            series: removed,
        });
    };

    return (
        <>
            <h1>npm trends clone</h1>
            <input type="text" onChange={onChange} onKeyPress={onKeyPress} value={keyword} />
            <div className="trends">
                <div className="trends-result">
                    {series && series.length > 0 && (
                        <ul className="keywords">
                            {series.map((series) => (
                                <li className="keyword" key={series.name}>
                                    <div className="keyword-box" style={{ borderColor: series.color }}>
                                        <span>{series.name}</span>
                                        <span onClick={() => removeSeries(series.name)}>❌</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </div>
        </>
    );
}

export default Trends;
