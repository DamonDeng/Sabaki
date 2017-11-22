const helper = require('../helper')

class Response {
    constructor(id, content, error, internal) {
        this.id = id
        this.content = content
        this.error = !!error
        this.internal = !!internal
        this.comment = ''
    }

    setComment(inputComment){
        
        for(var i=0; i<inputComment.length; i++){
            this.comment = this.comment + '\n' + inputComment[i]
            
        }

    
    }

    getComment(){
        return this.comment
    }

    toString() {
        return `${this.internal ? '' : this.error ? '?' : '='}${this.id != null ? this.id : ''} ${this.content}`.trim()
    }
}

module.exports = Response
