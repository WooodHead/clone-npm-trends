export interface ChartOptions {
    chart?: {
        renderTo?: string;
        type?: string;
    };
    title?: {
        text: string;
    };
    xAxis?: {
        categories?: string[];
    };
    yAxis?: {
        title?: {
            text?: string | null;
        };
    };
    series: Series[];
    legend: {
        symbolWidth?: number;
        symbolHeight?: number;
        symbolRadius?: number;
        squareSymbol?: boolean;

        align?: string;
        verticalAlign?: string;
        itemDistance?: number;
    };
    plotOptions?: {
        series?: {
            lineWidth?: number;
            marker?: {
                enabled?: boolean;
            };
        };
    };
}

export interface Trend {
    downloads: Download[];
    start: string;
    end: string;
    package: string;
}

export interface Download {
    downloads: number;
    day: string;
}

export interface Series {
    name: string;
    data: number[];
    color?: string;
}

export interface Axis {
    type?: string;
    categories: string[] | Date[];
    tickColor?: string;
    tickInterval?: number;
    labels?: {
        formatter?: () => string;
    };
    gridLineWidth?: number;
    gridLineColor?: string;
}
