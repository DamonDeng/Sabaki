const {spawn} = require('child_process')
const {dirname} = require('path')
const EventEmitter = require('events')

const gtp = require('./index')
const helper = require('../helper')
const logger = require('electron').remote.require('./logger')

class Controller extends EventEmitter {
    constructor(engine) {
        super()

        this._outBuffer = ''
        this._errBuffer = ''
        this.commands = []
        this.error = false
        this.process = null

        Object.assign(this, engine)

        this.start()
    }

    start() {
        if (this.process) return

        let split = require('argv-split')
        
        this.process = spawn(this.path, split(this.args), {cwd: dirname(this.path)})

        this.process.on('error', () => {
            this.error = true
        })

        this.process.on('exit', signal => {
            this.emit('quit', signal)
        })

        this.process.stdout.on('data', data => {
            
            //this._outBuffer += (data + '').replace(/\r/g, '').replace(/#.*?\n/g, '').replace(/\t/g, ' ')
            this._outBuffer += (data + '').replace(/\r/g, '').replace(/\t/g, ' ')
            
            let start = this._outBuffer.indexOf('\n')
            let commentArray=[]

            while (start !== -1) {
                if (this._outBuffer[0] == '#'){
                    

                    // re-compute the start pointer as comment may not follow the protocol to use double \n
                    start = this._outBuffer.indexOf('\n')
                    //let response = gtp.parseResponse(this._outBuffer.substr(0, start))
                    
                    //display comment in console log, instead of gtp console window
                    logger.log(this._outBuffer.substr(0, start))
                    // commentArray.push(this._outBuffer.substr(0, start))

                    this._outBuffer = this._outBuffer.substr(start + 1)

                    start = this._outBuffer.indexOf('\n')
                    
                }else if (this._outBuffer[0] == '=' || this._outBuffer[0] == '?'){
                    let response = gtp.parseResponse(this._outBuffer.substr(0, start))
                    
                    response.setComment(commentArray)
                    commentArray = []
                    this._outBuffer = this._outBuffer.substr(start + 1)
    
                    if (this.commands.length > 0) {
                        let command = this.commands.shift()
                        this.emit(`response-${command.internalId}`, {response, command})
                    }

                    start = this._outBuffer.indexOf('\n')
                }else{
                    
                    this._outBuffer = this._outBuffer.substr(start + 1)
                    start = this._outBuffer.indexOf('\n')
                }
                

                
               
            }

            // window.alert('end of the loop of on data')
        })

        this.process.stderr.on('data', data => {
            this._errBuffer += (data + '').replace(/\r/g, '').replace(/\t/g, ' ')

            let start = this._errBuffer.indexOf('\n')

            while (start !== -1) {
                this.emit('stderr', {content: this._errBuffer.substr(0, start)})
                this._errBuffer = this._errBuffer.substr(start + 1)

                start = this._errBuffer.indexOf('\n')
            }
        })
    }

    stop() {
        if (!this.process) return

        this.process.kill()
        this.process = null
    }

    sendCommand(command, callback = helper.noop) {
        if (this.process == null) this.start()

        this.once(`response-${command.internalId}`, callback)

        try {
            this.process.stdin.write(command.toString() + '\n')
            this.commands.push(command)
        } catch (err) {
            let response = new gtp.Response(command.id, 'connection error', true, true)
            this.emit(`response-${command.internalId}`, {response, command})
        }
    }
}

module.exports = Controller
