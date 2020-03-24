import { Overlay } from 'trading-vue-js'

export default {
    name: 'EMA',
    mixins: [Overlay],
    methods: {
        draw(ctx) {
            const layout = this.$props.layout
            ctx.strokeStyle = this.color
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
        use_for() { return ['EMA'] },
        data_colors() { return [this.color] }
    },
    computed: {
        color() {
            return this.$props.settings.color
        }
    }
}