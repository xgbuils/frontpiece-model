var Observer     = require('ontrigger')
var objectAssign = require('object-assign')

function Model (attrs, options) {
    this.options || (this.options = {validate: true})
    var options     = objectAssign({}, this.options, options)
    this.attributes = {}
    this.set(attrs, options)
    if (this.initialize) {
        this.initialize(attrs, options)
    }
    this._built = true
    this._validate(this.attributes, options)
    this._change(this.attributes, options)
}

Model.prototype = Object.create(Observer.prototype)

objectAssign(Model.prototype, {
    constructor: Model,
    get: function (key) {
        var attrs = this.attributes
        return key ? attrs[key] : attrs
    },
    set: function (key, val, options) {
        _set.call(this, key, val, options, function (attrs, options) {
            this._previousAttributes = objectAssign({}, this.attributes)
            objectAssign(this.attributes, attrs)
        })
    },
    isValid: function () {
        return !this.validationError
    },
    _change: function (attrs, options) {
        var changes = []
        var prev    = this._previousAttributes
        if (this._built && !options.silent) {
            for (var key in attrs) {
                this.trigger('change:' + key, prev[key])
                changes.push(key)
            }
            this.trigger('change', changes, prev)
        }
    },
    _validate: function (attrs, options) {
        if (options.silent || !this._built || !options.validate || !this.validate) return;
        var error = this.validationError = this.validate(attrs, options) || undefined;
        this.trigger((error ? 'in' : '') + 'valid', this, error)
        return error
    }
})

function _set(key, val, options, set) {
    var attrs
    if (typeof key === 'string') {
        (attrs = {})[key] = val
    } else if (typeof key === 'object') {
        attrs = key
        options = val
    } else {
        return
    }
    options = objectAssign({}, this.options, options)
    set.call(this, attrs, options)
    this._validate(this.attributes, options)
    this._change(attrs, options)
}

function extend (props) {
    props || (props = {})
    var parent = this
    var child  = function (attrs, options) {
        parent.call(this, attrs, options)
    }
    var set = props.set
    delete props.set

    child.prototype = Object.create(parent.prototype)
    child.prototype.constructor = child
    objectAssign(child.prototype, props)
    if (set) {
        child.prototype.set = function (key, val, options) {
            _set.call(this, key, val, options, set)
        }
    }

    child.extend = extend

    return child
}

Model.extend = extend

module.exports = Model