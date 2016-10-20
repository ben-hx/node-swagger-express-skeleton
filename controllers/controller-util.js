module.exports = {

    removeUndefinedPropertyOfObject: function (object) {
        return JSON.parse(JSON.stringify(object));
    }
};