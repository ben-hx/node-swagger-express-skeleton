var q = require('q');
var sinon = require("sinon");

module.exports = function (Notification, NotificationRepository) {
    var fakeClock = null;
    var tickTime = 3600000;
    return {
        initTime: function () {
            fakeClock = sinon.useFakeTimers(0, "Date");
        },
        saveExampleNotification: function (data) {
            var data = new Notification(data);
            return data.save().then(function (result) {
                return result;
            });
        },
        saveExampleNotificationArray: function (itemCount, options) {

            function saveWithTimeTick(index) {
                return q.fcall(function () {
                    var data = {
                        verb: (options.verb || 'testVerb' ) + index,
                        message: 'testMessage' + index,
                        createdUser: options.createdUser
                    };
                    fakeClock.tick(tickTime);
                    return (new Notification(data)).save().then(function (result) {
                        fakeClock.tick(tickTime);
                        return Notification.populate(result, 'createdUser');
                    }).then(function (result) {
                        return result.toObject();
                    });
                });
            }

            var sequence = q.resolve();
            var resultArray = [];
            var index = 0;
            for (var i = 0; i < itemCount; i++) {
                sequence = sequence.then(function () {
                    return saveWithTimeTick(index);
                }).then(function (item) {
                    index++;
                    resultArray.push(item);
                });
            }
            return q.when(sequence).then(function () {
                return resultArray;
            });
        },

        repository: {
            forUser: function (user) {
                return new NotificationRepository.forUser(user);
            }
        }
    }
};
