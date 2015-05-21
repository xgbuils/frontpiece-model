var chai = require('chai')
chai.use(require('chai-things'))
var should = chai.should()
var expect = chai.expect



module.exports = function (Model) {

describe('Frontpiece.Model', function () {
    it ('Model is a function', function () {
        (typeof Model).should.be.equal('function')
    })

    it ('instance of Model has inherited trigger method', function () {
        var model = new Model()
        ;(typeof model.trigger).should.be.equal('function')
    })

    it ('instance of Model has inherited on method', function () {
        var model = new Model()
        ;(typeof model.on).should.be.equal('function')
    })

    it ('has constructor', function () {
        var model = new Model()
        model.constructor.should.be.equal(Model)
    })

    describe('#get', function () {
        beforeEach(function () {
            this.model = new Model({
                foo: 'bar',
                fizz: 'buzz'
            })
        })

        it('get `foo` property', function () {
            this.model.get('foo').should.be.equal('bar')
        })

        it('get `fizz` property', function () {
            this.model.get('fizz').should.be.equal('buzz')
        })

        it('get `buf` property wich does not exist', function () {
            expect(this.model.get('buf')).be.equal(undefined)
        })
    })

    describe('#set', function () {
        beforeEach(function () {
            this.model = new Model({
                foo: 'bar',
                fizz: 'buzz'
            })
        })

        it('set "buzz" in `foo` property', function () {
            this.model.set('foo', 'buzz')
            this.model.get('foo').should.be.equal('buzz')
        })

        it('triggers "change" when set "buzz" in `foo` property', function () {
            var x
            this.model.on('change', function() {
                x = 5
            })
            this.model.set('foo', 'buzz')

            x.should.be.equal(5)
        })

        it('parameter of "change" callback has "foo" string when is set "buzz" in `foo` property', function () {
            var x
            this.model.on('change', function(props) {
                x = props
            })
            this.model.set('foo', 'buzz')

            x.should.be.deep.equal(['foo'])
        })

        it('set "bar" in `fizz` property', function () {
            this.model.set('fizz', 'bar')
            this.model.get('fizz').should.be.equal('bar')
        })

        it('triggers "change:fizz" when set "bar" in `fizz` property', function () {
            var x
            this.model.on('change:fizz', function() {
                x = 5
            })
            this.model.set('fizz', 'bar')

            x.should.be.equal(5)
        })

        it('set "pum" in `bub` property wich does not exist', function () {
            this.model.set('bub', 'pum')
            this.model.get('bub').should.be.equal('pum')
        })

        it('triggers "change:bub" when set "pum" in `bub` property wich does not exist', function () {
            var x
            this.model.on('change:bub', function() {
                x = 5
            })
            this.model.set('bub', 'pum')

            x.should.be.equal(5)
        })
    })

    describe('extend Model to FancyModel', function() {
        it ('has constructor', function () {
            var FancyModel = Model.extend()
            var fancy = new FancyModel()
            fancy.constructor.should.be.equal(FancyModel)
        })
        describe('using get inside initialize', function () {
            beforeEach(function () {
                var self = this
                var FancyModel = Model.extend({
                    initialize: function () {
                        self.foo  = this.get('foo')
                        self.fizz = this.get('fizz')
                        self.all  = this.get()
                    }
                })
                this.fancy = new FancyModel({
                    foo: 'bar',
                    fizz: 'buzz'
                })
            })
            it('get `foo` property', function () {
                this.foo.should.be.equal('bar')
            })
            it('get `fizz` property', function () {
                this.fizz.should.be.equal('buzz')
            })
            it('get all properties of model', function () {
                this.all.should.be.deep.equal({
                    foo: 'bar',
                    fizz: 'buzz'
                })
            })
        })

        describe('change event', function () {
            describe('"change" events are triggered after initialize method is run', function () {
                beforeEach(function () {
                    var self = this
                    this.props
                    this.change = this.change_foo = this.change_fizz = 0
                    var FancyModel = Model.extend({
                        initialize: function () {
                            this.on('change', function (props) {
                                ++self.change
                                self.props = props
                            })
                            this.on('change:foo', function () {
                                ++self.change_foo
                            })
                            this.on('change:fizz', function () {
                                ++self.change_fizz
                            })
                        }
                    })
                    this.fancy = new FancyModel({
                        foo: 'bar',
                        fizz: 'buzz'
                    })
                })
                it('triggers event "change" when instance of FancyModel is created', function () {
                    expect(this.change).to.be.equal(1)
                })
                it('parameter of "change" callback has changed keys', function () {
                   this.props.should.contain('foo').and.contain('fizz')
                })
                it('triggers event "change:foo" when instance of FancyModel is created', function () {
                    expect(this.change_foo).to.be.equal(1)
                })
                it('triggers event "change:fizz" when instance of FancyModel is created', function () {
                    expect(this.change_fizz).to.be.equal(1)
                })
            })

            describe('set method does not trigger "change" events during initialize method is running', function () {
                beforeEach(function () {
                    var self = this
                    this.instance = function (constr) {
                        new constr({
                            foo: 'bar',
                            fizz: 'buzz'
                        })
                    }
                })
                it('just triggers 1 "change" event when is built instance of FancyModel', function () {
                    var change = 0
                    var FancyModel = Model.extend({
                        initialize: function () {
                            this.on('change', function () {
                                ++change
                            })
                            this.set('foo', 'rab')
                        }
                    })
                    this.instance(FancyModel)
                    change.should.be.equal(1)
                })
                it('just triggers 1 "change:foo" event when is built instance of FancyModel', function () {
                    var change_foo = 0
                    var FancyModel = Model.extend({
                        initialize: function () {
                            this.set('foo', 'rab')
                            this.on('change:foo', function () {
                                ++change_foo
                            })
                        }
                    })
                    this.instance(FancyModel)
                    change_foo.should.be.equal(1)
                })
                it('just triggers 1 "change:bub" event when is built instance of FancyModel', function () {
                    var change_bub = 0
                    var FancyModel = Model.extend({
                        initialize: function () {
                            this.on('change:bub', function () {
                                ++change_bub
                            })
                            this.set('bub', this.get('foo'))
                        },
                    })
                    this.instance(FancyModel)
                    change_bub.should.be.equal(1)
                })
            })

            describe('set method triggers "change" events after FancyModel object is created', function () {
                beforeEach(function () {
                    var self = this
                    this.change = this.change_foo = this.change_fizz = 0
                    var FancyModel = Model.extend({
                        initialize: function () {
                            this.on('change', function () {
                                ++self.change
                            })
                            this.on('change:foo', function () {
                                ++self.change_foo
                            })
                            this.on('change:fizz', function () {
                                ++self.change_fizz
                            })
                        }
                    })
                    this.fancy = new FancyModel({
                        foo: 'bar',
                        fizz: 'buzz'
                    })
                })
                it('triggers event "change" when set value in instance of FancyModel', function () {
                    this.fancy.set('foo', 'rab')
                    expect(this.change).to.be.equal(2)
                })
                it('triggers event "change:foo" when set value in `foo` property', function () {
                    this.fancy.set('foo', 'rab')
                    expect(this.change_foo).to.be.equal(2)
                })
                it('triggers event "change:fizz" when set value in `fizz` property', function () {
                    this.fancy.set('fizz', 'zzub')
                    expect(this.change_fizz).to.be.equal(2)
                })
            })
        })

        describe('invalid & valid events and isValid method', function () {
            describe('triggers "valid" or "invalid" event after `initialize` method is run', function () {
                beforeEach(function () {
                    var self = this
                    this.valid   = 0
                    this.invalid = 0
                    this.FancyModel = Model.extend({
                        initialize: function () {
                            this.on('invalid', function () {
                                ++self.invalid
                            })
                            this.on('valid', function () {
                                ++self.valid
                            })
                        },
                        validate: function (attrs) {
                            if (attrs.value > 5) {
                                return "Error: value is greater than 5"
                            }
                        }
                    })
                })
                it('triggers "invalid" event when invalid FancyModel object is created', function () {
                    var fancy = new this.FancyModel({
                        value: 8
                    })
                    this.invalid.should.be.equal(1)
                })
                it('does not trigger "valid" event when invalid FancyModel object is created', function () {
                    var fancy = new this.FancyModel({
                        value: 8
                    })
                    this.valid.should.be.equal(0)
                })
                it('`isValid` method returns false when invalid FancyModel object is created', function () {
                    var fancy = new this.FancyModel({
                        value: 8
                    })
                    fancy.isValid().should.be.equal(false)
                })
                it('triggers "valid" event when valid FancyModel object is created', function () {
                    var fancy = new this.FancyModel({
                        value: 3
                    })
                    this.valid.should.be.equal(1)
                })
                it('does not trigger "invalid" event when valid FancyModel object is created', function () {
                    var fancy = new this.FancyModel({
                        value: 3
                    })
                    this.invalid.should.be.equal(0)
                })
                it('`isValid` method returns true when valid FancyModel object is created', function () {
                    var fancy = new this.FancyModel({
                        value: 3
                    })
                    fancy.isValid().should.be.equal(true)
                })
            })
            describe('set method does not trigger "invalid" events during initialize method is running', function () {
                it('triggers 1 "invalid" event because `value` is invalid after initialize is run', function () {
                    var invalid = 0
                    var valid   = 0
                    var FancyModel = Model.extend({
                        initialize: function () {
                            this.on('invalid', function () {
                                ++invalid
                            })
                            this.set('value', 6)
                            this.set('value', 100)
                            this.set('value', 3)
                            this.set('value', 8)
                        },
                        validate: function (attrs) {
                            if (attrs.value > 5) {
                                return "Error: value is greater than 5"
                            }
                        }
                    })
                    var fancy = new FancyModel({
                        value: 2
                    })
                    invalid.should.be.equal(1)
                    valid.should.be.equal(0)
                })
                it('triggers  1 "valid" event because `value` is valid after initialize is run', function () {
                    var invalid = 0
                    var valid   = 0
                    var FancyModel = Model.extend({
                        initialize: function () {
                            this.on('invalid', function () {
                                ++invalid
                            })
                            this.on('valid', function () {
                                ++valid
                            })
                            this.set('value', 2 * this.get('value'))
                            this.set('value', 6)
                            this.set('value', 100)
                            this.set('value', 3)
                        },
                        validate: function (attrs) {
                            if (attrs.value > 5) {
                                return "Error: value is greater than 5"
                            }
                        }
                    })
                    var fancy = new FancyModel({
                        value: 9
                    })
                    invalid.should.be.equal(0)
                    valid.should.be.equal(1)
                })
                describe('consistent value returned for isValid when is used in change event callback', function () {
                    it('isValid returns false in change callback if invalid FancyModel is created', function () {
                        var valid = ''
                        var FancyModel = Model.extend({
                            initialize: function () {
                                this.on('change', function () {
                                    valid = this.isValid()
                                })
                            },
                            validate: function (attrs) {
                                if (attrs.value > 5) {
                                    return "Error: value is greater than 5"
                                }
                            }
                        })
                        var fancy = new FancyModel({
                            value: 9
                        })
                        valid.should.be.equal(false)
                    })
                })
            })
            describe('set method triggers "valid" or "invalid" event after invalid FancyModel object is created', function () {
                beforeEach(function () {
                    var self = this
                    this.invalid = 0
                    this.valid   = 0
                    var FancyModel = Model.extend({
                        initialize: function () {
                            this.on('invalid', function (o, error) {
                                ++self.invalid
                                self.error = error
                            })
                            this.on('valid', function (o, error) {
                                ++self.valid
                            })
                        },
                        validate: function (attrs) {
                            if (attrs.value > 5) {
                                return "error"
                            }
                        }
                    })
                    this.fancy = new FancyModel({
                        value: 10
                    }, {validate: false})
                })
                it('triggers "invalid" event when set invalid property', function () {
                    this.fancy.set('value', 6)
                    expect(this.invalid).to.be.equal(1)
                })                
                it('does not trigger "valid" event when set invalid property', function () {
                    this.fancy.set('value', 7)
                    expect(this.valid).to.be.equal(0)
                })
                it('`isValid` method returns false when set invalid property', function () {
                    this.fancy.set('value', 7)
                    this.fancy.isValid().should.be.equal(false)
                })
                it('`validationError` property is truthy string when set invalid property', function () {
                    this.fancy.set('value', 7)
                    this.fancy.validationError.should.be.equal('error')
                })
                it('2nd parameter in `invalid` callback is error returned in `validate` method if set invalid property', function () {
                    this.fancy.set('value', 9)
                    this.error.should.be.equal(this.fancy.validationError)
                })
                it('triggers "valid" event when set valid property', function () {
                    this.fancy.set('value', 5)
                    expect(this.valid).to.be.equal(1)
                })
                it('does not trigger "invalid" event when set valid property', function () {
                    this.fancy.set('value', 4)
                    expect(this.invalid).to.be.equal(0)
                })
                it('`isValid` method returns true when set valid property', function () {
                    this.fancy.set('value', 5)
                    this.fancy.isValid().should.be.equal(true)
                })
                it('`validationError` property is undefined when set valid property', function () {
                    this.fancy.set('value', 4)
                    expect(this.fancy.validationError).to.be.equal(undefined)
                })
            })

            describe('validationError property is consistent inside invalid and valid event callback', function () {
                before(function () {
                    var self = this
                    this.invalid = 0
                    this.valid   = 0
                    var FancyModel = Model.extend({
                        initialize: function () {
                            this.on('invalid', function (o, error) {
                                self.validationError = this.validationError
                            })
                            this.on('valid', function (o, error) {
                                self.validationError = this.validationError
                            })
                        },
                        validate: function (attrs) {
                            if (attrs.value > 5) {
                                return "error"
                            }
                        }
                    })
                    this.fancy = new FancyModel({
                        value: 10
                    }, {validate: false})
                })
                it('validationError is truly string when is triggered invalid event', function () {
                    this.fancy.set('value', 8)
                    expect(this.validationError).to.be.equal('error')
                })
                it('validationError is undefined when is triggered valid event', function () {
                    this.fancy.set('value', 2)
                    expect(this.validationError).to.be.equal(undefined)
                })
            })

            describe('when extends Model with falsy value in options.validate "valid" & "invalid" event is not triggered by default', function () {
                beforeEach(function () {
                    var self = this
                    this.invalid = 0
                    this.valid   = 0
                    this.FancyModel = Model.extend({
                        initialize: function () {
                            this.on('invalid', function () {
                                ++self.invalid
                            })
                            this.on('valid', function () {
                                ++self.valid
                            })
                        },
                        validate: function (attrs) {
                            if (attrs.value > 5) {
                                return "Error: value is greater than 5"
                            }
                        },
                        options: {
                            validate: false
                        }
                    })
                })
                it('is not triggered "invalid" event when invalid FancyModel is created', function () {
                    var fancy = new this.FancyModel({
                        value: 8
                    })
                    this.invalid.should.be.equal(0)
                })
                it('is not triggered "valid" event when valid FancyModel is created', function () {
                    var fancy = new this.FancyModel({
                        value: 2
                    })
                    this.valid.should.be.equal(0)
                })
                it('is not triggered "invalid" event when set invalid property', function () {
                    var fancy = new this.FancyModel({
                        value: -6
                    })
                    fancy.set('value', 6)
                    this.invalid.should.be.equal(0)
                })
                it('is not triggered "valid" event when set valid property', function () {
                    var fancy = new this.FancyModel({
                        value: 50
                    })
                    fancy.set('value', 5)
                    this.valid.should.be.equal(0)
                })
                it('is triggered "invalid" event when invalid FancyModel is created  with {validate: true} option', function () {
                    var fancy = new this.FancyModel({
                        value: 80
                    }, {
                        validate: true
                    })
                    this.invalid.should.be.equal(1)
                })
                it('is triggered "valid" event when valid FancyModel is created  with {validate: true} option', function () {
                    var fancy = new this.FancyModel({
                        value: -10
                    }, {
                        validate: true
                    })
                    this.valid.should.be.equal(1)
                })
                it('is triggered "invalid" event when set invalid property with {validate: true} parameter', function () {
                    var fancy = new this.FancyModel({
                        value: 1
                    })
                    fancy.set('value', 5.1, {validate: true})
                    this.invalid.should.be.equal(1)
                })
                it('is triggered "valid" event when set valid property with {validate: true} parameter', function () {
                    var fancy = new this.FancyModel({
                        value: 6
                    })
                    fancy.set('value', 4.9, {validate: true})
                    this.valid.should.be.equal(1)
                })
            })
        })
    })
})


}