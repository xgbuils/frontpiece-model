var Observer     = require('ontrigger')
var objectAssign = require('object-assign')

function Model (attrs, options) {
    this.options || (this.options = {validate: true})
    this.attributes = {}
    this.set(attrs, options)
    if (this.initialize) {
        this.initialize(attrs, options)
    }
    this._built = true
    _change.call(this, this.attributes)
    this.validationError = _validate.call(this, this.attributes, options)
}

Model.prototype = Object.create(Observer.prototype)

objectAssign(Model.prototype, {
    get: function (key) {
        var attrs = this.attributes
        return key ? attrs[key] : attrs
    },
    set: function (key, val, options) {
        var attrs
        if (typeof key === 'string') {
            (attrs = {})[key] = val
        } else if (typeof key === 'object') {
            attrs = key
        } else {
            return
        }
        objectAssign(this.attributes, attrs)
        _change.call(this, attrs)
        this.validationError = _validate.call(this, this.attributes, options)
    },
    isValid: function () {
        return !this.validationError
    }
})

function _change (attrs) {
    if (this._built) {
        for (var key in attrs) {
            this.trigger('change:' + key)
        }
        this.trigger('change')
    }
}

function _validate (attrs, options) {
    options = objectAssign({}, this.options, options)
    if (!this._built || !options.validate || !this.validate) return;
    var error = this.validate(attrs, options) || undefined;
    this.trigger((error ? 'in' : '') + 'valid', this, error)
    return error
}

function extend (props) {
    var parent = this
    var child  = function (attrs, options) {
        parent.call(this, attrs, options)
    }

    child.prototype = Object.create(parent.prototype)
    objectAssign(child.prototype, props)

    child.extend = extend

    return child
}

Model.extend = extend

module.exports = Model