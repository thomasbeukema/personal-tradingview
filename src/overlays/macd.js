import { Overlay } from 'trading-vue-js'

export default {
    name: 'MACD',
    mixins: [Overlay],
    methods: {
        draw(ctx) {
            const layout = this.$props.layout

            // MACD line
            ctx.strokeStyle = this.colorMACD
            ctx.beginPath()

            for (var p of this.$props.data) {

                let x = layout.t2screen(p[0])
                let y = layout.$2screen(p[1])

                ctx.lineTo(x, y)
            }

            ctx.stroke()

            // Signal Line
            ctx.strokeStyle = this.colorSignal
            ctx.beginPath()

            for (var p of this.$props.data) {

                let x = layout.t2screen(p[0])
                let y = layout.$2screen(p[2])

                ctx.lineTo(x, y)
            }

            ctx.stroke()
        },
        use_for() { return ['MACD'] },
        data_colors() { return [this.color] }
    },
    computed: {
        colorMACD() {
            return this.$props.settings.colorMACD
        },
        colorSignal() {
            return this.$props.settings.colorSignal;
        }
    }
}