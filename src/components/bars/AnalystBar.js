const {h, Component} = require('preact')
const classNames = require('classnames')

const Bar = require('./Bar')
const helper = require('../../modules/helper')
const logger = require('electron').remote.require('./logger')

class AnalystBar extends Component {
    constructor() {
        super()

        this.state = {
            stoneTool: 1
        }

        this.handleToolButtonClick = this.handleToolButtonClick.bind(this)
    }

    componentWillReceiveProps({selectedTool}) {
        if (selectedTool === this.props.selectedTool) return

        if (selectedTool.indexOf('stone') === 0) {
            this.setState({stoneTool: +selectedTool.replace('stone_', '')})
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.mode !== this.props.mode || nextProps.mode === 'analyst'
    }

    handleToolButtonClick(evt) {
        let {selectedTool, onToolButtonClick = helper.noop} = this.props

        evt.tool = evt.currentTarget.dataset.id

        if (evt.tool.indexOf('stone') === 0 && selectedTool.indexOf('stone') === 0) {
            evt.tool = `stone_${-this.state.stoneTool}`
            this.setState(({stoneTool}) => ({stoneTool: -stoneTool}))
        }

        onToolButtonClick(evt)
    }

    renderButton(title, toolId, selected = false) {
        
        return h('li', {class: classNames({selected})},
            h('a',
                {
                    title,
                    href: '#',
                    'data-id': toolId,
                    onClick: this.handleToolButtonClick
                },

                h('img', {src: `./img/edit/${toolId}.svg`})
            )
        )
    }

    render({selectedTool}, {stoneTool}) {
        // logger.log("trying to render Analyst bar .......")
        let isSelected = ([, id]) => id.replace(/_-?1$/, '') === selectedTool.replace(/_-?1$/, '')

        return h(Bar, Object.assign({type: 'analyst'}, this.props),
            h('ul', {},
                [
                    ['Analyst Stone Tool', `stone_${stoneTool}`],
                    ['Analyst Cross Tool', 'cross'],
                    ['Analyst Triangle Tool', 'triangle'],
                    ['Analyst Square Tool', 'square'],
                    ['Analyst Circle Tool', 'circle'],
                    ['Analyst Line Tool', 'line'],
                    ['Analyst Arrow Tool', 'arrow'],
                    ['Analyst Label Tool', 'label'],
                    ['Analyst Number Tool', 'number']
                ].map(x =>
                    this.renderButton(...x, isSelected(x))
                )
            )
        )
    }
}

module.exports = AnalystBar
