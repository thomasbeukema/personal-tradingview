<template>
  <div id="app">
    <TradingVue
      ref="tradingVue"
      :data="chart"
      id="chart"
      :width="width"
      :height="height"
      :titleTxt="ticker.toUpperCase()"
      :overlays="overlays"
      :legendButtons="legendBtns"
      v-on:legend-button-click="onEyeClick"
    ></TradingVue>
  </div>
</template>

<script>
import { TradingVue, DataCube } from "trading-vue-js";
import EMAOverlay from "./overlays/ema";
import ATROverlay from "./overlays/atr";
import MACDOverlay from "./overlays/macd";
import CCIOverlay from "./overlays/cci";
import PriceTargetOverlay from "./overlays/priceTargets";

const av = require("alphavantage")({ key: "PXJSB2RNM2LLJBGF" });

const EMA = require("technicalindicators").EMA;
const MACD = require("technicalindicators").MACD;
const ATR = require("technicalindicators").ATR;
const CCI = require("technicalindicators").CCI;

export default {
  name: "App",
  components: {
    TradingVue
  },
  data() {
    return {
      ticker: "",
      ohlcv: [],
      showEMA: true,
      showPriceTarget: true,
      ema8: null,
      ema13: null,
      ema21: null,
      atr: null,
      macd: null,
      cci: null,
      width: window.innerWidth,
      height: window.innerHeight,
      overlays: [
        EMAOverlay,
        ATROverlay,
        MACDOverlay,
        CCIOverlay,
        PriceTargetOverlay
      ],
      legendBtns: ["display"]
    };
  },
  methods: {
    onEyeClick(event) {
      if (event.overlay.toLowerCase().includes("ema")) {
        this.showEMA = !this.showEMA;
      } else if (event.overlay.toLowerCase().includes("price")) {
        this.showPriceTarget = !this.showPriceTarget;
      }
    },
    onResize(event) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    },
    timestampData(data) {
      let result = [];
      for (let i = 0; i < data.length; i++) {
        result.push([this.ohlcv[i][0], data[i]]);
      }
      return result;
    },
    generateIndicators() {
      const highs = this.ohlcv.map(a => a[1]);
      const lows = this.ohlcv.map(a => a[2]);
      const closes = this.ohlcv.map(a => a[3]);
      this.ema8 = this.timestampData(
        Array(7)
          .fill(1, 0, 7)
          .concat(...EMA.calculate({ period: 8, values: closes }))
      );
      this.ema13 = this.timestampData(
        Array(12)
          .fill(1, 0, 12)
          .concat(...EMA.calculate({ period: 13, values: closes }))
      );
      this.ema21 = this.timestampData(
        Array(20)
          .fill(1, 0, 20)
          .concat(...EMA.calculate({ period: 21, values: closes }))
      );
      this.atr = this.timestampData(
        Array(14)
          .fill(1, 0, 14)
          .concat(
            ...ATR.calculate({
              period: 14,
              close: closes,
              low: lows,
              high: highs
            })
          )
      );
      this.macd = MACD.calculate({
        values: closes,
        fastPeriod: 13,
        slowPeriod: 21,
        signalPeriod: 6,
        SimpleMAOscillator: true,
        SimpleMASignal: true
      });

      this.macd = Array(20)
        .fill({ MACD: 0, signal: 0 }, 0, 20)
        .concat(...this.macd);

      let newMACD = [];
      for (let i = 0; i < this.macd.length; i++) {
        newMACD.push([
          this.ohlcv[i][0],
          this.macd[i].MACD,
          this.macd[i].signal
        ]);
      }
      this.macd = newMACD;

      this.cci = this.timestampData(
        Array(20)
          .fill(0, 0, 20)
          .concat(
            ...CCI.calculate({
              close: closes,
              low: lows,
              high: highs,
              period: 21
            })
          )
      );
    },
    loadData(ticker, chart = "daily", interval = "refresh") {
      const storage = window.localStorage;

      if (chart == "daily") {
        if (storage.getItem(ticker.toLowerCase()) && interval != "refresh") {
          this.ohlcv = JSON.parse(storage.getItem(ticker.toLowerCase()));
          this.generateIndicators();
          this.$refs.tradingVue.resetChart();
          return;
        }

        av.data.daily(ticker, "full", "json").then(result => {
          const entries = result["Time Series (Daily)"];
          let formatted = [];
          for (const date in result["Time Series (Daily)"]) {
            formatted.push([
              new Date(date).getTime(),
              parseFloat(entries[date]["1. open"]),
              parseFloat(entries[date]["2. high"]),
              parseFloat(entries[date]["3. low"]),
              parseFloat(entries[date]["4. close"]),
              parseFloat(entries[date]["5. volume"])
            ]);
          }

          this.ohlcv = formatted.sort((a, b) => {
            return a[0] - b[0];
          });

          storage.setItem(ticker.toLowerCase(), JSON.stringify(this.ohlcv));

          this.generateIndicators();
          this.$refs.tradingVue.resetChart();
        });
      } else if (chart == "intra") {
        av.data.intraday(ticker, "compact", "json", interval).then(result => {
          const entries = result[`Time Series (${interval})`];
          let formatted = [];
          for (const date in result[`Time Series (${interval})`]) {
            formatted.push([
              new Date(date).getTime(),
              parseFloat(entries[date]["1. open"]),
              parseFloat(entries[date]["2. high"]),
              parseFloat(entries[date]["3. low"]),
              parseFloat(entries[date]["4. close"]),
              parseFloat(entries[date]["5. volume"])
            ]);
          }

          this.ohlcv = formatted.sort((a, b) => {
            return a[0] - b[0];
          });

          this.generateIndicators();
          this.$refs.tradingVue.resetChart();
        });
      }
    }
  },
  computed: {
    chart() {
      return new DataCube({
        chart: {
          type: "Candles",
          data: this.ohlcv ? this.ohlcv : [],
          settings: {
            showVolume: false
          }
        },
        onchart: [
          {
            name: "EMA(8)",
            type: "EMA",
            data: this.showEMA ? this.ema8 : [],
            settings: {
              color: "#478eff"
            }
          },
          {
            name: "EMA(13)",
            type: "EMA",
            data: this.showEMA ? this.ema13 : [],
            settings: {
              color: "#fff94f"
            }
          },
          {
            name: "EMA(21)",
            type: "EMA",
            data: this.showEMA ? this.ema21 : [],
            settings: {
              color: "#34ebd5"
            }
          },
          {
            name: "Price Targets",
            type: "PriceTargets",
            data: this.showPriceTarget
              ? this.ohlcv.map((a, i) => [
                  a[0],
                  a[4],
                  this.atr[i][1],
                  this.cci[i][1]
                ])
              : [],
            settings: {
              colorProfit: "#b1ff5e",
              colorSell: "#ff2626"
            }
          }
        ],
        offchart: [
          {
            name: "MACD(13, 21, 6)",
            type: "MACD",
            data: this.macd,
            settings: {
              colorMACD: "#3b52ff",
              colorSignal: "#ff2626"
            }
          },
          {
            name: "CCI(21)",
            type: "CCI",
            data: this.cci,
            settings: {
              colorBorder: "#ff9500",
              colorLine: "#ffe342",
              borders: {
                upper: 100,
                lower: -100
              }
            }
          },
          {
            name: "ATR(14)",
            type: "ATR",
            data: this.atr,
            settings: {
              color: "#54f05e"
            }
          }
        ]
      });
    }
  },
  mounted() {
    this.ticker = window.prompt("Enter ticker");
    window.addEventListener("resize", this.onResize);

    if (this.ticker) {
      if (this.ticker.includes(":")) {
        let options = this.ticker.split(":");
        this.loadData(options[0], options[1], options[2]);
      } else {
        this.loadData(this.ticker);
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  }
};
</script>

<style lang="stylus">
html, body {
  padding: 0;
  margin: 0;
}
</style>
