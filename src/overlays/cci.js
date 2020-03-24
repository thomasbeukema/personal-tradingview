import { Overlay } from 'trading-vue-js'

export default {
    name: 'CCI',
    mixins: [Overlay],
    methods: {
        draw(ctx) {
            const layout = this.$props.layout
            // Draw borders

            let x1 = layout.t2screen(this.$props.data[0][0]);
            let x2 = layout.t2screen(this.$props.data[this.$props.data.length - 1][0])

            let y = layout.$2screen(this.borders.upper);

            ctx.strokeStyle = this.colorBorder;
            ctx.beginPath()
            ctx.moveTo(x1, y)
            ctx.lineTo(x2, y)
            ctx.stroke()

            y = layout.$2screen(this.borders.lower)

            ctx.beginPath()
            ctx.moveTo(x1, y)
            ctx.lineTo(x2, y)
            ctx.stroke()

            ctx.strokeStyle = this.colorLine
            ctx.beginPath()

            for (var p of this.$props.data) {

                // t2screen & $2screen - special functions that
                // map your data coordinates to grid coordinates
                let x = layout.t2screen(p[0])
                let y = layout.$2screen(p[1])

                ctx.lineTo(x, y)
            }

            ctx.stroke()
        },
        use_for() { return ['CCI'] },
        data_colors() { return [this.color] }
    },
    computed: {
        colorBorder() {
            return this.$props.settings.colorBorder;
        },
        colorLine() {
            return this.$props.settings.colorLine;
        },
        borders() {
            return this.$props.settings.borders;
        }
    }
}