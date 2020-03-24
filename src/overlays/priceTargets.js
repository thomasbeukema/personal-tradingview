import { Overlay } from 'trading-vue-js'

export default {
    name: 'PriceTargets',
    mixins: [Overlay],
    methods: {
        draw(ctx) {
            const layout = this.$props.layout

            ctx.strokeStyle = this.colorProfit
            ctx.beginPath()

            for (let i = 0; i < this.$props.data.length; i++) {
                // t2screen & $2screen - special functions that
                // map your data coordinates to grid coordinates
                /*
                let multiplier;

                if (p[3] <= 100 && p[3] >= -100) {
                    multiplier = Math.abs(p[3]);
                } else {
                    multiplier = p[3] / 3
                }

                multiplier /= 55
                multiplier += 1
                */

                let current = this.$props.data[i];
                let previous = i == 0 ? this.$props.data[i] : this.$props.data[i - 1];

                let multiplier = (current[2] - previous[2]) / previous[2];
                multiplier += 1


                let x = layout.t2screen(current[0])
                let y = layout.$2screen(current[1] + (current[2] * multiplier))

                if (current[3] >= -100) {
                    ctx.lineTo(x, y)
                } else {
                    ctx.moveTo(x, y)
                }
            }

            ctx.stroke()

            ctx.strokeStyle = this.colorSell
            ctx.beginPath();

            for (let p of this.$props.data) {

                // t2screen & $2screen - special functions that
                // map your data coordinates to grid coordinates
                let x = layout.t2screen(p[0])
                let y = layout.$2screen(p[1] - (p[2] * 2))

                if (p[3] <= 100) {
                    ctx.lineTo(x, y)
                } else {
                    ctx.moveTo(x, y)
                }
            }

            ctx.stroke()
        },
        use_for() { return ['PriceTargets'] },
        legend(values) {
            let i = this.$props.data.indexOf(values);
            let current = this.$props.data[i];
            let previous = i == 0 ? this.$props.data[i] : this.$props.data[i - 1];

            let multiplier = (current[2] - previous[2]) / previous[2];
            multiplier += 1

            values[2] *= multiplier;

            let profit = (values[1] + values[2]).toFixed(2);
            let profitPercentage = (((profit - values[1]) / values[1]) * 100).toFixed(2)

            values[2] /= multiplier;

            let loss = (values[1] - (values[2] / 2)).toFixed(2);
            let lossPercentage = ((((values[1] - (values[2] / 2)) / values[1]) * 100) - 100).toFixed(2)
            return [
                {
                    value: `${profit} (${profitPercentage}%)`,
                    color: this.colorProfit
                },
                {
                    value: `${loss} (${lossPercentage}%)`,
                    color: this.colorSell
                },
                {
                    value: values[1],
                    color: this.colorProfit
                }

            ]
        }
    },
    computed: {
        colorProfit() {
            return this.$props.settings.colorProfit
        },
        colorSell() {
            return this.$props.settings.colorSell;
        },
    }
}